import { observable, computed, action, reaction } from "mobx";
import StellarSdk from "stellar-sdk";
import Expo from "expo";
import Account from "./mobx/account";
import Ticker from "./mobx/ticker";

// secret: "SCVDSRX4ZCQ67SXLPIJFYDOIFG2K6OVUE34YOS4PTRZCF6SQWOAW5FUI",
// public: "GAEO24CUSGYAPPTK7F7SKUD6L2ND46NFSKNT23FSOWQ47ONUVYFBRVZH",

// secret: "SBUB4RXETYFRVIGNYVSCWOHWKS4BCIM535E2Q2775RZO2VWX33IZUDR7",
// public: "GBMPDEGIH2ALSVJ36GT2KHZYTU6IC2KPDOJNBVN6BCRU3GDHD7TZIN35",

// secret: "SBWIHSVAPTDVTIJXLJF6HD7365EOH3ZV2ZMNRLTFMAIMLGNRWCN2CFDS",
// public: "GDYFZI73Z3BYFTK7WXDT4FFO4XSBJKLBHHBYD4W4GMM3B3VMWL3OFSJS",

const ACCOUNTS_STORAGE_KEY = "ACCOUNTS";
const TOUCH_ID_STORAGE_KEY = "TOUCH_ID";

class Store {
  @observable accounts = [];
  @observable appReady = false;
  @observable account = null;
  @observable touchIdEnabled = false;
  @observable ticker = new Ticker();

  server = new StellarSdk.Server("https://horizon-testnet.stellar.org");

  constructor() {
    Expo.SecureStore.getItemAsync(ACCOUNTS_STORAGE_KEY)
      .then(value => {
        this.accounts = JSON.parse(value).map(acc => new Account(acc, this));
        if (this.accounts.length > 0) this.account = this.accounts[0];
        return Expo.SecureStore.getItemAsync(TOUCH_ID_STORAGE_KEY);
      })
      .then(value => (this.touchIdEnabled = value === "true"))
      .then(() => {
        return Expo.Font.loadAsync({
          ClearSans: require("./assets/ClearSans-Light.ttf"),
          "ClearSans-Bold": require("./assets/ClearSans-Bold.ttf")
        });
      })
      .then(() => this.ticker.fetchData())
      .then(() => {
        this.addReactions();
        this.appReady = true;
      })
      .catch(error => {
        console.log(error);
        this.appReady = true;
      });

    StellarSdk.Network.useTestNetwork();
  }

  addReactions = () => {
    reaction(() => this.accounts, this.saveAccountsToStorage);

    reaction(
      () => this.touchIdEnabled,
      () => {
        Expo.SecureStore.setItemAsync(
          TOUCH_ID_STORAGE_KEY,
          this.touchIdEnabled ? "true" : "false"
        );
      }
    );
  };

  saveAccountsToStorage = () => {
    // console.log("ACCOUNTS CHANGED!");
    Expo.SecureStore.setItemAsync(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify(this.accounts)
    );
  };

  fetchPayments() {
    return this.server
      .loadAccount(this.activeAccountId)
      .then(account => {
        this.account.balances = account.balances;
        return this.ticker.fetchData();
      })
      .then(() =>
        this.server
          .payments()
          .forAccount(this.activeAccountId)
          .order("desc")
          .limit(50)
          .cursor(this.account.cursor)
          .call()
      )
      .then(paymentsPage => {
        const records = paymentsPage.records.filter(o => o.type === "payment");

        if (records.length > 0) {
          this.cursor = records[records.length - 1].paging_token;
        }

        this.account.payments = records;
        return records;
      })
      .catch(StellarSdk.NotFoundError, () => []);
  }

  setActiveAccount = newAccount => {
    if (newAccount) {
      this.account = newAccount;
    }
  };

  deleteCurrentAccount = () => {
    this.accounts = this.accounts.filter(
      o => o.publicKey !== this.account.publicKey
    );

    if (this.accounts.length > 0) {
      this.account = this.accounts[0];
    } else {
      this.account = null;
    }
  };

  addAccount = ({ secret, name }) => {
    let sourceKeys;
    try {
      sourceKeys = StellarSdk.Keypair.fromSecret(secret);
    } catch (e) {
      return Promise.reject(new Error("Secret key is invalid"));
    }

    if (this.accounts.find(o => o.secret === secret)) {
      return Promise.reject(new Error("Account already added"));
    }

    let balances = null;
    let payments = null;

    return this.server
      .loadAccount(sourceKeys.publicKey())
      .then(sourceAccount => {
        balances = sourceAccount.balances;

        return this.server
          .payments()
          .forAccount(sourceKeys.publicKey())
          .order("desc")
          .limit(50)
          .call();
      })
      .then(paymentsPage => {
        payments = paymentsPage.records.filter(o => o.type == "payment");
        newAccount = new Account(
          {
            name,
            secret,
            publicKey: sourceKeys.publicKey(),
            payments,
            balances
          },
          this
        );

        this.account = newAccount;
        this.accounts = this.accounts.concat([newAccount]);
      })
      .catch(StellarSdk.NotFoundError, error => {
        newAccount = new Account(
          {
            name,
            secret,
            publicKey: sourceKeys.publicKey()
          },
          this
        );

        this.account = newAccount;
        this.accounts = this.accounts.concat([newAccount]);
      });
  };

  sendMoney = ({ amount, destinationId, memo }) => {
    let transaction;

    return this.server
      .loadAccount(destinationId)
      .then(() => this.server.loadAccount(this.account.publicKey))
      .then(sourceAccount => {
        transaction = new StellarSdk.TransactionBuilder(sourceAccount)
          .addOperation(
            StellarSdk.Operation.payment({
              destination: destinationId,
              asset: StellarSdk.Asset.native(),
              amount: amount.replace(",", ".")
            })
          )
          .addMemo(StellarSdk.Memo.text(memo))
          .build();
        transaction.sign(this.account.sourceKeys);
        return this.server.submitTransaction(transaction);
      })
      .then(result => {
        return this.fetchPayments().then(() => result);
      });
  };

  fundAccount = ({ amount, destinationId, memo }) => {
    let transaction;

    return this.server
      .loadAccount(this.account.publicKey)
      .then(sourceAccount => {
        transaction = new StellarSdk.TransactionBuilder(sourceAccount)
          .addOperation(
            StellarSdk.Operation.createAccount({
              destination: destinationId,
              startingBalance: amount.replace(",", ".")
            })
          )
          .addMemo(StellarSdk.Memo.text(memo))
          .build();
        transaction.sign(this.account.sourceKeys);
        return this.server.submitTransaction(transaction);
      })
      .then(result => {
        return this.fetchPayments().then(() => result);
      });
  };

  fetchPayment = transactionId => {
    return this.server
      .transactions()
      .transaction(transactionId)
      .call();
  };

  @computed
  get activeAccountId() {
    return this.account ? this.account.publicKey : null;
  }
}

const store = new Store();

export default store;
