import React from "react";
import { StyleSheet, TextInput } from "react-native";

export default class extends React.Component {
  focus = () => {
    this.input.focus();
  };

  render() {
    return (
      <TextInput
        ref={_this => (this.input = _this)}
        placeholderTextColor="#999"
        {...this.props}
        style={[styles.input, this.props.style]}
      />
    );
  }
}

const styles = StyleSheet.create({
  input: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    backgroundColor: "#f1f1f1",
    fontFamily: "System",
    fontSize: 16
  }
});
