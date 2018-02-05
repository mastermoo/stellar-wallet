import { types, flow } from "mobx-state-tree";

const baseUrl = "https://api.coinmarketcap.com/v1/ticker/stellar";

const Ticker = types
  .model({
    price: 1.0,
    currency: "USD"
  })
  .actions(self => ({
    setCurrency(currency: string) {
      self.currency = currency;
    },

    fetchData: flow(function*() {
      try {
        const response = yield fetch(`${baseUrl}?convert=${self.currency}`);
        const result = yield response.json();

        self.price = parseFloat(
          result[0][`price_${self.currency.toLowerCase()}`] ||
            result[0].price_usd
        );
      } catch (err) {
        console.log(err);
      }
    })
  }));

export default Ticker;
