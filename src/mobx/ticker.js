import { observable, computed, action, reaction } from "mobx";
import StellarSdk from "stellar-sdk";
import Expo from "expo";
import moment from "moment";

const CURRENCY_STORAGE_KEY = "CURRENCY";

export default class Ticker {
  @observable price = 1.0;
  @observable currency = "USD";
  baseUrl = "https://api.coinmarketcap.com/v1/ticker/stellar";

  constructor() {
    Expo.SecureStore.getItemAsync(CURRENCY_STORAGE_KEY).then(value => {
      this.currency = value || "USD";
      reaction(
        () => this.currency,
        () => {
          Expo.SecureStore.setItemAsync(CURRENCY_STORAGE_KEY, this.currency);
        }
      );
    });
  }

  fetchData = () => {
    return fetch(`${this.baseUrl}?convert=${this.currency}`)
      .then(response => response.json())
      .then(result => {
        this.price = parseFloat(
          result[0][`price_${this.currency.toLowerCase()}`] ||
            result[0].price_usd
        );
      })
      .catch(err => console.log(err));
  };
}
