import { types, flow } from "mobx-state-tree";
import StellarSdk from "stellar-sdk";
import { prettyNumber } from "../helpers";

export const Balance = types.model("BalanceModel", {
  balance: types.string,
  asset_type: types.string,
  asset_code: types.maybe(types.string)
});

export const Payment = types.model("PaymentModel", {
  transaction_hash: types.string,
  from: types.string,
  to: types.string,
  amount: types.string,
  asset_type: types.string,
  asset_issuer: types.maybe(types.string),
  asset_code: types.maybe(types.string),
  created_at: types.string
});

const Account = types
  .model("AccountModel", {
    name: types.string,
    secret: types.identifier(types.string),
    publicKey: types.string,
    payments: types.optional(types.array(Payment), []),
    balances: types.optional(types.array(Balance), [])
  })
  .actions(self => ({
    setName(newName: string) {
      self.name = newName;
    },

    fetchPayments: flow(function*(): any {
      const account = yield self.server.loadAccount(self.publicKey);
      self.balances = account.balances;

      const paymentsPage = yield self.server
        .payments()
        .forAccount(self.publicKey)
        .order("desc")
        .limit(50)
        // .cursor(self.cursor)
        .call();

      self.payments = paymentsPage.records.filter(
        (o: any) => o.type === "payment"
      );
    })
  }))
  .views(self => ({
    get server() {
      if (true) {
        return new StellarSdk.Server("https://horizon.stellar.org");
      }
      return new StellarSdk.Server("https://horizon-testnet.stellar.org");
    },

    get sourceKeys() {
      if (self.secret) {
        return StellarSdk.Keypair.fromSecret(self.secret);
      }
    },

    get nativeBalance() {
      const balance = self.balances.find(o => o.asset_type === "native");
      if (balance) {
        return prettyNumber(balance.balance);
      }
    },

    get nativeBalanceNumber() {
      const balance = self.balances.find(o => o.asset_type === "native");
      if (balance) {
        return parseInt(balance.balance);
      }
    },

    get isUnfunded() {
      return self.balances.length <= 0;
    },

    get paymentsGrouped() {
      return [
        {
          data: self.payments.slice(),
          title: "Transactions"
        }
      ];
    }
  }));

export default Account;
