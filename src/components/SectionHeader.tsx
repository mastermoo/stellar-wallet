import React from "react";
import { StyleSheet, View } from "react-native";
import { Typo } from "./";

export default (props: { title: string }) => (
  <View style={styles.header}>
    <Typo.T>{props.title}</Typo.T>
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 8
  }
});
