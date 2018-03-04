import { types, flow } from "mobx-state-tree";
import StellarSdk from "stellar-sdk";
import Account from "./account";
import Ticker from "./ticker";

const Root = types
  .model({
    accounts: types.optional(types.map(Account), {}),
    account: types.maybe(types.reference(Account)),
    ticker: Ticker,
    touchIdEnabled: false
  })
  .views(self => ({
    get server() {
      if (true) {
        return new StellarSdk.Server("https://horizon.stellar.org");
      }
      return new StellarSdk.Server("https://horizon-testnet.stellar.org");
    }
  }))
  .actions(self => ({
    afterCreate() {
      if (true) {
        StellarSdk.Network.usePublicNetwork();
      } else {
        StellarSdk.Network.useTestNetwork();
      }
      self.ticker.fetchData();
    },

    setAccount(account: any) {
      if (account) {
        self.account = account;
      }
    },

    setTouchIdEnabled(enabled: boolean) {
      self.touchIdEnabled = enabled;
    },

    deleteCurrentAccount() {
      if (!self.account || self.account === null) return;

      self.accounts.delete(self.account.secret);

      if (self.accounts.values().length > 0) {
        self.account = self.accounts.values()[0];
      } else {
        self.account = null;
      }
    },

    addAccount: flow(function*(data: { secret: string; name: string }) {
      let sourceKeys: any;

      try {
        sourceKeys = StellarSdk.Keypair.fromSecret(data.secret);
      } catch (e) {
        throw new Error("Secret key is invalid");
      }

      if (self.accounts.get(data.secret)) {
        throw new Error("Account already added");
      }

      try {
        const sourceAccount = yield self.server.loadAccount(
          sourceKeys.publicKey()
        );
        const balances = sourceAccount.balances;

        const paymentsPage = yield self.server
          .payments()
          .forAccount(sourceKeys.publicKey())
          .order("desc")
          .limit(50)
          .call();

        const payments = paymentsPage.records.filter(
          (o: any) => o.type == "payment"
        );

        const newAccount = Account.create({
          name: data.name,
          secret: data.secret,
          publicKey: sourceKeys.publicKey(),
          balances,
          payments
        });

        self.account = newAccount;
        self.accounts.set(data.secret, newAccount);
      } catch (error) {
        console.log("ERROR!!!!", error);
        if (error instanceof StellarSdk.NotFoundError) {
          const newAccount = Account.create({
            name: data.name,
            secret: data.secret,
            publicKey: sourceKeys.publicKey()
          });

          self.account = newAccount;
          self.accounts = self.accounts.set(data.secret, newAccount);
        }
      }
    }),

    sendMoney(data: { amount: string; destinationId: string; memo: string }) {
      if (!self.account) return;

      const { amount, destinationId, memo } = data;

      let transaction;

      return self.server
        .loadAccount(destinationId)
        .then(() => self.server.loadAccount(self.account.publicKey))
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
          transaction.sign(self.account.sourceKeys);
          return self.server.submitTransaction(transaction);
        })
        .then(result => {
          return self.account.fetchPayments().then(() => result);
        });
    },

    fundAccount(data: { amount: string; destinationId: string; memo: string }) {
      if (!self.account) return;

      const { amount, destinationId, memo } = data;

      let transaction;

      return self.server
        .loadAccount(self.account.publicKey)
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
          transaction.sign(self.account.sourceKeys);
          return self.server.submitTransaction(transaction);
        })
        .then(result => {
          return self.account.fetchPayments().then(() => result);
        });
    }
  }));

export default Root;
