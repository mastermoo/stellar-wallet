import React from "react";
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Switch,
  AlertIOS,
  Alert,
  ActionSheetIOS
} from "react-native";
import Expo from "expo";
import { observer } from "mobx-react";
import { Cell, Table, Typo } from "../components";
import store from "../store";

const CURRENCIES = ["USD", "EUR", "GBP", "BTC", "ETH"];

@observer
export default class extends React.Component {
  static navigationOptions = {
    title: "Settings"
  };

  state = {
    hasTouchId: false
  };

  async componentWillMount() {
    if (
      (await Expo.Fingerprint.hasHardwareAsync()) &&
      (await Expo.Fingerprint.isEnrolledAsync())
    ) {
      this.setState({ hasTouchId: true });
    }
  }

  openDialog = () => {
    AlertIOS.prompt(
      "Edit name",
      null,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Done",
          onPress: text => {
            store.account.name = text;
          }
        }
      ],
      "plain-text",
      store.account.name
    );
  };

  deleteAccount = () => {
    Alert.alert(
      "Remove wallet",
      "Do you really want to remove the wallet from this app?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, remove!",
          style: "destructive",
          onPress: () => {
            store.deleteCurrentAccount();
            this.props.navigation.goBack();
          }
        }
      ]
    );
  };

  validateTouchId = enabled => {
    Expo.Fingerprint.authenticateAsync(
      "Unlock Stellar Wallet with Touch ID"
    ).then(({ success, error }) => {
      if (success) {
        store.touchIdEnabled = enabled;
      }
    });
  };

  render() {
    return (
      <Table.TableView>
        {!!store.account && (
          <Table.Section header="Wallet info">
            <Cell
              title="Name"
              detail={store.account.name}
              onPress={this.openDialog}
            />
            <Cell title="Network" detail={"Test Network"} />
            <Cell
              title="Account ID"
              detail={store.account.publicKey}
              detailCopiable
            />
            <Cell
              title="Remove wallet"
              type="danger"
              onPress={this.deleteAccount}
            />
          </Table.Section>
        )}

        {this.state.hasTouchId && (
          <Table.Section header="General Settings">
            <Cell
              title="TouchID/FaceID"
              detail={
                <Switch
                  value={store.touchIdEnabled}
                  onValueChange={this.validateTouchId}
                />
              }
            />
            <Cell
              title="Currency Converter"
              detail={store.ticker.currency}
              onPress={this.handleCurrencyMenu}
            />
          </Table.Section>
        )}
      </Table.TableView>
    );
  }

  handleCurrencyMenu = () => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel"].concat(CURRENCIES),
        cancelButtonIndex: 0,
        title: "Change Currency"
      },
      buttonIndex => {
        if (buttonIndex > 0) {
          store.ticker.currency = CURRENCIES[buttonIndex - 1];
        }
      }
    );
  };
}
