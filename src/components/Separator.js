import React from "react";
import { StyleSheet, View } from "react-native";

export default props => <View style={styles.separator} />;

const styles = StyleSheet.create({
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#d3d3d3",
    marginLeft: 20
  }
});
