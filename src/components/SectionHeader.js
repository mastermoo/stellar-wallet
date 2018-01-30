import React from "react";
import { StyleSheet, View } from "react-native";
import { Typo } from "./";

export default ({ title }) => (
  <View style={styles.header}>
    <Typo.T>{title}</Typo.T>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 8
  }
});
