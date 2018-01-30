import "./global";
import React from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Button,
  AppState
} from "react-native";
import { StackNavigator } from "react-navigation";
import { Ionicons } from "@expo/vector-icons";
import Expo from "expo";
import { reaction } from "mobx";
import { observer } from "mobx-react";
import { Home, Send, Deposit, Payment, Settings, New } from "./src/screens";
import { Loader } from "./src/components";
import store from "./src/store";

const Stack = StackNavigator(
  {
    Home: {
      screen: Home
    },
    Send: {
      screen: Send
    },
    Deposit: {
      screen: Deposit
    },
    Payment: {
      screen: Payment
    },
    Settings: {
      screen: Settings
    },
    New: {
      screen: New
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      headerStyle: {
        backgroundColor: "white"
      },
      headerLeft: (
        <TouchableOpacity
          activeOpacity={0.5}
          style={{
            padding: 15
          }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="ios-close" size={40} color="#222" />
        </TouchableOpacity>
      ),
      gesturesEnabled: false,
      headerTitleStyle: {
        fontFamily: "ClearSans",
        marginTop: -2
      }
    }),
    mode: "modal"
  }
);

@observer
export default class App extends React.Component {
  state = {
    authenticated: false,
    appState: AppState.currentState
  };

  componentDidMount() {
    reaction(
      () => store.appReady,
      () => {
        if (store.touchIdEnabled) {
          this.authenticateWithFingerprint();
        } else {
          this.setState({ authenticated: true });
        }
      }
    );

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
    if (!store.appReady) return <Loader />;

    return (
      <View style={styles.container}>
        <Stack />
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
