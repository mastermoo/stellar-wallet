import React from "react";
import {
  StyleSheet,
  Text,
  SectionList,
  ScrollView,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActionSheetIOS,
  Dimensions,
  Button,
  RefreshControl
} from "react-native";
import _ from "lodash";
import { Constants } from "expo";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { observer } from "mobx-react";
import { Header } from "react-navigation";
import {
  CircleIcon,
  Loader,
  SectionHeader,
  Separator,
  PaymentRow,
  Typo
} from "../components";
import { prettyNumber } from "../helpers";

@observer
export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    header: null
  });

  state = {
    refreshing: false
  };

  constructor(props) {
    super(props);
    this.store = props.screenProps.store;
  }

  onRefresh = () => {
    if (this.state.refreshing) return;
    this.setState({ refreshing: true });
    this.store.account
      .fetchPayments()
      .then(this.accountFetched)
      .catch(error => {
        alert(error);
      });
  };

  accountFetched = records => {
    this.setState({ refreshing: false });
  };

  fundAccount = () => {
    const friendbotURL = "https://horizon-testnet.stellar.org/friendbot";
    fetch(`${friendbotURL}?addr=${this.store.account.publicKey}`)
      .then(this.onRefresh)
      .catch(() => {
        alert("Hmmm, that didn't work somehow...");
      });
  };

  render() {
    if (this.store.accounts.values().length <= 0)
      return (
        <View style={styles.emptyContainer}>
          <Typo.H style={{ marginBottom: 20, textAlign: "center" }}>
            Stellar Mobile Wallet
          </Typo.H>
          <Typo.T style={{ marginBottom: 20, textAlign: "center" }}>
            Use this lightweight app to send and receive lumens over the Stellar
            network.
          </Typo.T>
          <Button
            title="Add your first Account"
            color={Typo.Colors.link}
            onPress={() => this.props.navigation.navigate("New")}
          />
        </View>
      );

    return (
      <View style={styles.container}>
        {this._renderNavigationBar()}
        {this.store.account.isUnfunded ? (
          <ScrollView
            contentContainerStyle={{
              justifyContent: "center",
              alignItems: "center"
            }}
            style={[
              styles.emptyScrollContainer,
              {
                paddingTop: 200
              }
            ]}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this.onRefresh}
              />
            }
          >
            <Typo.H style={{ marginBottom: 20 }}>Account is unfunded</Typo.H>
            <Typo.T style={{ textAlign: "center" }}>
              Send at least 1 lumens to this account to activate it. This is
              required by the Stellar network. You can buy lumens from an
              exchange.
            </Typo.T>
            <Typo.T style={{ textAlign: "center", marginTop: 20 }}>
              Since this account lives in the Test Network, you can also get
              funded 10.000 XLM by clicking{" "}
              <Typo.Link onPress={this.fundAccount}>this magic link</Typo.Link>!
            </Typo.T>
          </ScrollView>
        ) : (
          <View style={styles.container}>
            <SectionList
              style={styles.listContainer}
              sections={this.store.account.paymentsGrouped}
              keyExtractor={(item, idx) => idx}
              onRefresh={this.onRefresh}
              refreshing={this.state.refreshing}
              renderSectionHeader={({ section }) => (
                <SectionHeader title={section.title} />
              )}
              renderItem={({ item, idx }) => (
                <PaymentRow key={idx} payment={item} {...this.props} />
              )}
              ItemSeparatorComponent={() => <Separator />}
              ListHeaderComponent={this._renderBalance}
            />
            {this._renderToolbar()}
          </View>
        )}
      </View>
    );
  }

  _renderNavigationBar() {
    return (
      <View style={styles.navigationBarContainer}>
        <View style={styles.navigationBarTitleContainer}>
          <TouchableWithoutFeedback
            hitSlop={{ left: 40, top: 30, right: 40, bottom: 10 }}
            onPress={this._handleToggleMenu}
          >
            <View style={{ flexDirection: "row" }}>
              <Text style={styles.navigationBarTitle}>
                {this.store.account.name}
              </Text>

              {this.store.accounts.values().length > 1 && (
                <View style={styles.navigationBarArrow}>
                  <FontAwesome
                    name="angle-down"
                    size={18}
                    color="rgba(0,0,0,0.7)"
                  />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>

        <View style={styles.navigationBarLeft}>
          <TouchableOpacity
            hitSlop={{ right: 40, bottom: 20, left: 20, top: 20 }}
            onPress={() => this.props.navigation.navigate("Settings")}
          >
            <Ionicons
              name="ios-more-outline"
              size={28}
              color="rgba(0,0,0,0.7)"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.navigationBarRight}>
          <TouchableOpacity
            hitSlop={{ right: 20, bottom: 20, left: 40, top: 20 }}
            onPress={() => this.props.navigation.navigate("New")}
          >
            <Ionicons name="ios-add" size={34} color="rgba(0,0,0,0.7)" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _renderBalance = () => {
    return (
      <ScrollView
        horizontal
        snapToAlignment="center"
        decelerationRate="fast"
        snapToInterval={Dimensions.get("window").width}
        showsHorizontalScrollIndicator={false}
        style={styles.balancesContainer}
      >
        {this.store.account.balances.slice().map((balance, idx) => (
          <View key={idx} style={styles.balanceContainer}>
            <View style={styles.balanceNumberContainer}>
              <Text style={styles.balanceTitle}>Total Balance</Text>
              <Text style={styles.balanceNumber}>
                {prettyNumber(balance.balance)}
                <Text style={styles.balanceCurrency}>
                  {" "}
                  {balance.asset_code || "XLM"}
                </Text>
              </Text>
              {balance.asset_type === "native" && (
                <Typo.Sub style={{ textAlign: "center" }}>
                  {prettyNumber(
                    this.store.ticker.price * parseFloat(balance.balance)
                  )}{" "}
                  {this.store.ticker.currency}
                </Typo.Sub>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };

  _renderToolbar() {
    return (
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => {
            this.props.navigation.navigate("Deposit");
          }}
        >
          <CircleIcon.Deposit />
          <Typo.T style={{ marginTop: 8 }}>Deposit</Typo.T>
        </TouchableOpacity>
        {/*<View style={styles.toolbarSeparator} />*/}
        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => {
            this.props.navigation.navigate("Send");
          }}
        >
          <CircleIcon.Send />
          <Typo.T style={{ marginTop: 8 }}>Send</Typo.T>
        </TouchableOpacity>
      </View>
    );
  }

  _handleToggleMenu = () => {
    if (this.store.accounts.values().length <= 1) return;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Cancel"].concat(
          this.store.accounts.values().map(o => o.name)
        ),
        cancelButtonIndex: 0,
        title: "Switch account"
      },
      buttonIndex => {
        if (buttonIndex > 0) {
          this.store.setAccount(this.store.accounts.values()[buttonIndex - 1]);
        }
      }
    );
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    padding: 20
  },
  emptyScrollContainer: {
    flex: 1,
    backgroundColor: "white",
    padding: 20
  },
  listContainer: {
    flex: 1,
    backgroundColor: "white"
  },
  toolbar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
    flexDirection: "row",
    backgroundColor: "white"
  },
  toolbarSeparator: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: "#DDD"
  },
  mainButton: {
    flex: 1,
    padding: 15,
    alignItems: "center"
  },

  navigationBarContainer: {
    backgroundColor: "white",
    height: 64,
    overflow: "hidden",
    paddingTop: Constants.statusBarHeight
  },
  navigationBarTitleContainer: {
    flex: 1,
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  navigationBarTitle: {
    fontFamily: "ClearSans",
    fontSize: 17,
    marginTop: -2
  },
  navigationBarArrow: {
    marginLeft: 5,
    marginTop: 2
  },
  navigationBarLeft: {
    position: "absolute",
    top: 0,
    left: 15,
    bottom: 0,
    top: Constants.statusBarHeight,
    justifyContent: "center"
  },
  navigationBarRight: {
    position: "absolute",
    top: 0,
    right: 15,
    bottom: 0,
    top: Constants.statusBarHeight,
    justifyContent: "center"
  },

  balancesContainer: {},
  balanceContainer: {
    width: Dimensions.get("window").width - 40,
    height: 180,
    backgroundColor: "#D4EEF7",
    marginVertical: 10,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    paddingBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8
  },
  balanceTitle: {
    fontFamily: "ClearSans",
    color: "#555",
    fontSize: 16,
    textAlign: "center"
  },
  balanceNumber: {
    fontFamily: "ClearSans",
    fontSize: 34,
    marginBottom: 5
  }
});
