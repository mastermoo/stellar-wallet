import React from "react";
import { StyleSheet, View, Button, AppState } from "react-native";
import Expo from "expo";
import { observer } from "mobx-react";
import { Loader } from "./components";
// import store from "./store";
import Stack from "./Stack";
import RootStore from "./models/root";
import { onSnapshot } from "mobx-state-tree";

const STORAGE_KEY = "MST";
const emptyState = { ticker: { price: 1.0, currency: "USD" } };
let store;

@observer
export default class App extends React.Component {
  state = {
    appReady: false,
    authenticated: false,
    appState: AppState.currentState
  };

  async componentDidMount() {
    try {
      await Expo.Font.loadAsync({
        ClearSans: require("./assets/ClearSans-Light.ttf"),
        "ClearSans-Bold": require("./assets/ClearSans-Bold.ttf")
      });

      savedState = await Expo.SecureStore.getItemAsync(STORAGE_KEY);
      const initialState = !!savedState ? JSON.parse(savedState) : emptyState;

      console.log(savedState);
      store = RootStore.create(initialState);
    } catch (e) {
      console.log(error);
      store = RootStore.create(emptyState);
    }

    onSnapshot(store, snapshot => {
      Expo.SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(snapshot));
    });

    if (store.touchIdEnabled) {
      this.setState({ appReady: true }, this.authenticateWithFingerprint);
    } else {
      this.setState({ appReady: true, authenticated: true });
    }

    AppState.addEventListener("change", this._handleAppStateChange);
  }

  _handleAppStateChange = nextAppState => {
    if (!store.touchIdEnabled) return;

    if (nextAppState === "background") {
      this.setState({ authenticated: false, appState: nextAppState });
      return;
    } else if (
      this.state.appState === "background" &&
      nextAppState === "active"
    ) {
      this.setState({ appState: nextAppState });
      this.authenticateWithFingerprint();
    }
  };

  authenticateWithFingerprint = () => {
    Expo.Fingerprint.authenticateAsync(
      "Unlock Stellar Wallet with Touch ID"
    ).then(({ success, error }) => {
      if (success) {
        this.setState({ authenticated: true });
      }
    });
  };

  render() {
    if (!this.state.appReady) return <Loader />;

    return (
      <View style={styles.container}>
        <Stack screenProps={{ store }} />
        {store.touchIdEnabled &&
          !this.state.authenticated && (
            <View style={[StyleSheet.absoluteFill, styles.lockedContainer]}>
              <Button
                title="Unlock with Touch ID"
                onPress={this.authenticateWithFingerprint}
              />
            </View>
          )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  lockedContainer: {
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  }
});
