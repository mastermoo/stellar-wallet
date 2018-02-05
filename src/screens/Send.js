import React from "react";
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Button,
  Animated,
  ActivityIndicator,
  Alert,
  Keyboard
} from "react-native";
import StellarSdk from "stellar-sdk";
import { DangerZone, Permissions, BarCodeScanner, Fingerprint } from "expo";
import { FontAwesome } from "@expo/vector-icons";
import { Typo, Input } from "../components";
import { prettyNumber } from "../helpers";
import { observer } from "mobx-react";

const { Lottie } = DangerZone;
const lottieSource = require("../assets/success.json");
const PKEY_LENGTH = 56;

@observer
export default class extends React.Component {
  static navigationOptions = {
    title: "Send"
  };

  state = {
    amount: "",
    destinationId: "",
    memo: "",
    sending: false,
    sent: false,
    scannerActive: false
  };

  constructor(props) {
    super(props);
    this.store = props.screenProps.store;
  }

  successAnim = new Animated.Value(0);

  onSubmit = () => {
    const { amount, destinationId, memo, sending } = this.state;
    if (!amount || destinationId.length !== PKEY_LENGTH || sending) return;

    if (!this.store.touchIdEnabled) {
      return this.sendMoney();
    }

    Fingerprint.authenticateAsync("Submit with Touch ID").then(
      ({ success, error }) => {
        if (success) {
          this.sendMoney();
        }
      }
    );
  };

  sendMoney = () => {
    const { amount, destinationId, memo, sending } = this.state;

    this.setState({ sending: true });

    this.store
      .sendMoney({
        amount,
        destinationId,
        memo
      })
      .then(this.onSendSuccess)
      .catch(StellarSdk.NotFoundError, error => {
        this.setState({ sending: false });

        Alert.alert(
          "The destination account does not exist!",
          "Do you want to create a new account for the specified address?",
          [
            { text: "No", style: "cancel" },
            {
              text: "Yes, create account!",
              style: "destructive",
              onPress: this.fundAccount
            }
          ]
        );
      })
      .catch(error => {
        this.setState({ sending: false });
        alert(error);
      });
  };

  fundAccount = () => {
    const { amount, destinationId, memo } = this.state;
    this.setState({ sending: true });

    this.store
      .fundAccount({
        amount,
        destinationId,
        memo
      })
      .then(this.onSendSuccess)
      .catch(error => {
        alert(error);
        this.setState({ sending: false });
      });
  };

  onSendSuccess = result => {
    // console.log("Success! Results:", result);
    this.setState({ sending: false, sent: true }, () => {
      this.animation.reset();
      this.animation.play();
      Animated.timing(this.successAnim, {
        toValue: 1,
        duration: 2000
      }).start();
    });
  };

  setAmount = () => {
    this.setState({
      amount: this.store.account.nativeBalanceNumber.toString()
    });

    if (this.amountInput && this.amountInput.focus) this.amountInput.focus();
  };

  openScanner = async () => {
    Keyboard.dismiss();
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === "granted") {
      this.setState({ scannerActive: true });
    }
  };

  handleScannerRead = ({ type, data }) => {
    let destinationId = data;
    let memo = this.state.memo;

    try {
      const payment = JSON.parse(data).stellar.payment;
      destinationId = payment.destination;
      memo = payment.memo.value;
    } catch (e) {}

    this.setState({ destinationId, memo, scannerActive: false }, () => {
      this.memoInput.focus();
    });
  };

  render() {
    const { amount, destinationId, memo, sending, sent } = this.state;

    if (sent)
      return (
        <View style={styles.success}>
          <View style={styles.successAnimWrap}>
            <Lottie
              style={{ flex: 1 }}
              ref={animation => {
                this.animation = animation;
              }}
              source={lottieSource}
            />
          </View>
          <Animated.View
            style={{
              opacity: this.successAnim,
              marginTop: -100
            }}
          >
            <Typo.Title style={styles.successText}>
              You sent {amount} XLM {"\n"} to an external address!
            </Typo.Title>
            <Typo.Link
              style={{ textAlign: "center" }}
              onPress={() => this.props.navigation.goBack()}
            >
              Back to Home.
            </Typo.Link>
          </Animated.View>
        </View>
      );

    return (
      <View style={styles.container}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          style={styles.scrollContainer}
        >
          <View style={styles.formGroup}>
            <View style={styles.labelWrap}>
              <Typo.L>Amount</Typo.L>
              <Typo.L>
                Balance:{" "}
                <Typo.Link onPress={this.setAmount}>
                  {this.store.account.nativeBalance} XLM
                </Typo.Link>
              </Typo.L>
            </View>
            <View>
              <Input
                ref={_this => (this.amountInput = _this)}
                autoFocus
                value={amount}
                onChangeText={val => this.setState({ amount: val })}
                placeholder="10"
                style={{ paddingRight: 100 }}
                keyboardType="numeric"
                returnKeyType="next"
                onSubmitEditing={() => this.destinationInput.focus()}
              />
              <Typo.T style={styles.amountConverter}>
                ~{" "}
                {prettyNumber(
                  this.store.ticker.price *
                    parseFloat(this.state.amount.replace(",", "."))
                )}{" "}
                {this.store.ticker.currency}
              </Typo.T>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Typo.L>To</Typo.L>
            <View>
              <Input
                ref={_this => (this.destinationInput = _this)}
                value={destinationId}
                onChangeText={val => this.setState({ destinationId: val })}
                placeholder="GBMPH...........ZN35"
                style={{ paddingRight: 40 }}
                returnKeyType="next"
                ellipsizeMode="middle"
                onSubmitEditing={() => this.memoInput.focus()}
              />
              <TouchableOpacity
                hitSlop={{ top: 40, bottom: 40, left: 10, right: 40 }}
                onPress={this.openScanner}
                style={styles.inputIcon}
              >
                <FontAwesome name="qrcode" color={Typo.Colors.link} size={26} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelWrap}>
              <Typo.L>Message</Typo.L>
              <Typo.L>{28 - memo.length} characters left</Typo.L>
            </View>
            <Input
              ref={_this => (this.memoInput = _this)}
              value={memo}
              onChangeText={val => this.setState({ memo: val })}
              placeholder="Rent for January 18"
              returnKeyType="send"
              maxLength={28}
              onSubmitEditing={this.onSubmit}
            />
          </View>

          {sending ? (
            <ActivityIndicator size="large" style={styles.loader} />
          ) : (
            <Button
              title={`Send ${amount || 0} XLM`}
              color={Typo.Colors.link}
              onPress={this.onSubmit}
              disabled={
                !amount || destinationId.length !== PKEY_LENGTH || sending
              }
            />
          )}
        </ScrollView>
        {this.state.scannerActive && (
          <View style={[StyleSheet.absoluteFill]}>
            <BarCodeScanner
              onBarCodeRead={this.handleScannerRead}
              style={StyleSheet.absoluteFill}
              barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
            />
            <TouchableOpacity
              onPress={() => {
                this.setState({ scannerActive: false });
              }}
              style={styles.scannerBackButton}
            >
              <Text style={styles.scannerBackButtonText}>Back</Text>
            </TouchableOpacity>
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
  scrollContainer: {
    flex: 1,
    padding: 20
  },
  labelWrap: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  formGroup: {
    marginBottom: 15
  },
  loader: {
    height: 40,
    justifyContent: "center"
  },
  inputIcon: {
    position: "absolute",
    right: 10,
    top: 6,
    backgroundColor: "transparent"
  },
  scannerBackButton: {
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: 10
  },
  scannerBackButtonText: {
    color: "white",
    fontSize: 24,
    textAlign: "right"
  },
  success: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 20
  },
  successAnimWrap: {
    width: 350,
    height: 350
  },
  successText: {
    textAlign: "center",
    marginBottom: 20
  },
  amountConverter: {
    position: "absolute",
    right: 10,
    top: 6,
    backgroundColor: "transparent"
  }
});
