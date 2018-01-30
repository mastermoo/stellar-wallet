import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const Send = props => (
  <View style={[styles.wrap, { backgroundColor: "#f5000033" }]}>
    <Ionicons name="md-arrow-up" style={[styles.icon, styles.send]} />
  </View>
);
const Deposit = props => (
  <View style={[styles.wrap, { backgroundColor: "#00ca5a33" }]}>
    <Ionicons name="md-add" style={[styles.icon, styles.deposit]} />
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    width: 30,
    height: 30,
    borderRadius: 30 / 2,
    alignItems: "center",
    justifyContent: "center"
  },
  icon: {
    fontSize: 20,
    marginLeft: -1,
    marginBottom: -1
  },
  send: {
    color: "#f50000"
  },
  deposit: {
    color: "#00ca5a"
  }
});

export default {
  Send,
  Deposit
};
