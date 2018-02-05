import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import moment from "moment";
import { Typo, CircleIcon } from "./";
import { prettyNumber } from "../helpers";

export interface PaymentRowProps {
  screenProps: any;
  navigation: any;
  payment: any;
}

export default class PaymentRow extends React.Component<PaymentRowProps> {
  visitDetails = () => {
    this.props.navigation.navigate("Payment", { payment: this.props.payment });
  };

  render() {
    const { payment, screenProps } = this.props;
    const amount = prettyNumber(payment.amount);
    const received = payment.to === screenProps.store.account.publicKey;
    const currency =
      payment.asset_type === "native" ? "XLM" : payment.asset_code;

    return (
      <View style={styles.row}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.rowInner}
          onPress={this.visitDetails}
        >
          <View style={styles.iconWrap}>
            {received ? <CircleIcon.Deposit /> : <CircleIcon.Send />}
          </View>
          <View style={styles.left}>
            <Typo.Title>
              {received ? "Received" : "Sent"} {currency}
            </Typo.Title>
            <Typo.Sub>{moment(payment.created_at).format("LL")}</Typo.Sub>
          </View>
          <Text
            style={[
              styles.amount,
              {
                color: received ? "#00ca5a" : "#f50000"
              }
            ]}
          >
            {received ? "+" : "-"}
            {amount}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  row: {},
  rowInner: {
    backgroundColor: "#fff",
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 20
  },
  iconWrap: {
    marginRight: 15
  },
  left: {
    flex: 1,
    marginRight: 10
  },
  amount: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "500"
  }
});
