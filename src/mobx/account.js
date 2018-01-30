import { observable, computed, action, reaction } from "mobx";
import StellarSdk from "stellar-sdk";
import { prettyNumber } from "../helpers";

export default class Account {
  @observable name = null;
  @observable secret = null;
  @observable publicKey = null;
  @observable payments = [];
  @observable balances = [];
  @observable cursor = null;

  constructor(account, store) {
    this.name = account.name;
    this.secret = account.secret;
    this.publicKey = account.publicKey;
    this.payments = account.payments || [];
    this.balances = account.balances || [];
    this.cursor = account.cursor;

    reaction(() => this.name, store.saveAccountsToStorage);
    reaction(() => this.payments, store.saveAccountsToStorage);
    reaction(() => this.balances, store.saveAccountsToStorage);
    reaction(() => this.cursor, store.saveAccountsToStorage);
  }

  @computed
  get sourceKeys() {
    if (this.secret) {
      return StellarSdk.Keypair.fromSecret(this.secret);
    }
    return null;
  }

  @computed
  get nativeBalance() {
    try {
      return prettyNumber(
        this.balances.find(o => o.asset_type === "native").balance
      );
    } catch (e) {
      return "";
    }
  }

  @computed
  get nativeBalanceNumber() {
    try {
      return parseInt(
        this.balances.find(o => o.asset_type === "native").balance
      );
    } catch (e) {
      return "";
    }
  }

  @computed
  get isUnfunded() {
    return this.balances.length <= 0;
  }

  @computed
  get paymentsGrouped() {
    return [
      {
        data: this.payments.slice(),
        title: "Transactions"
      }
    ];
  }
}
