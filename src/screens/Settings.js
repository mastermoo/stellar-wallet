import React from "react";
import { Switch, AlertIOS, Alert, ActionSheetIOS } from "react-native";
import Expo from "expo";
import { observer } from "mobx-react";
import { Cell, Table, Typo } from "../components";

const CURRENCIES = ["USD", "EUR", "GBP", "BTC", "ETH"];

@observer
export default class extends React.Component {
  static navigationOptions = {
    title: "Settings"
  };

  state = {
    hasTouchId: false
  };

  constructor(props) {
    super(props);
    this.store = props.screenProps.store;
  }

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
            this.store.account.setName(text);
          }
        }
      ],
      "plain-text",
      this.store.account.name
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
            this.store.deleteCurrentAccount();
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
        this.store.setTouchIdEnabled(enabled);
      }
    });
  };

  render() {
    return (
      <Table.TableView>
        {!!this.store.account && (
          <Table.Section header="Wallet info">
            <Cell
              title="Name"
              detail={this.store.account.name}
              onPress={this.openDialog}
            />
            <Cell title="Network" detail={"Test Network"} />
            <Cell
              title="Account ID"
              detail={this.store.account.publicKey}
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
                  value={this.store.touchIdEnabled}
                  onValueChange={this.validateTouchId}
                />
              }
            />
            <Cell
              title="Currency Converter"
              detail={this.store.ticker.currency}
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
          this.store.ticker.setCurrency(CURRENCIES[buttonIndex - 1]);
        }
      }
    );
  };
}
