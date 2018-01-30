import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Clipboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default props => (
  <View style={styles.container}>
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => {
        Clipboard.setString(props.string);
        alert("Saved to clipboard!");
      }}
      style={styles.button}
    >
      <Ionicons name="md-copy" style={styles.icon} />
      <Text style={styles.text}>COPY ADDRESS</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    alignItems: "flex-start"
  },
  button: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "#e9e9e9",
    flexDirection: "row",
    alignItems: "center"
  },
  icon: {
    color: "#000000",
    fontSize: 12,
    marginRight: 4
  },
  text: {
    fontFamily: "System",
    color: "#000000",
    fontSize: 12,
    fontWeight: "400"
  }
});
