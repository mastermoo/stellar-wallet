import React from "react";
import { StyleSheet, Text, TouchableHighlight } from "react-native";

export default props => (
  <TouchableHighlight {...props} underlayColor="#0691b7" style={styles.button}>
    <Text style={styles.buttonText}>{props.title}</Text>
  </TouchableHighlight>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#08b5e5",
    borderColor: "#0691b7",
    padding: 10,
    borderRadius: 3,
    width: 335,
    alignSelf: "center",
    marginTop: 10
  },
  buttonText: {
    fontFamily: "ClearSans",
    fontSize: 18,
    color: "white",
    textAlign: "center"
  }
});
