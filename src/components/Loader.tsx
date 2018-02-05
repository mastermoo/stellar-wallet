import React from "react";
import { StyleSheet, ActivityIndicator } from "react-native";

export default () => (
  <ActivityIndicator style={styles.container} size="large" />
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  }
});
