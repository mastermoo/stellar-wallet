import React from "react";
import { StyleSheet, View, Button } from "react-native";
import Expo from "expo";

export default class extends React.Component {
  static navigationOptions = ({ navigation }) => ({
    header: null
  });

  componentDidMount() {
    this.authenticate();
  }

  authenticate = async () => {
    Expo.Fingerprint.authenticateAsync("Unlock wallet with Touch ID").then(
      ({ success, error }) => {
        if (success) {
          this.props.navigation.goBack();
        }
      }
    );
  };

  render() {
    return (
      <View style={styles.container}>
        <Button title="Unlock with Touch ID" onPress={this.authenticate} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center"
  }
});
