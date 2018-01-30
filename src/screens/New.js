import React from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  View,
  Button,
  ActivityIndicator,
  Linking
} from "react-native";
import StellarSdk from "stellar-sdk";
import { Input, Typo } from "../components";
import store from "../store";

export default class extends React.Component {
  static navigationOptions = {
    title: "Add Account"
  };

  state = {
    loading: false,
    name: "",
    secret: ""
  };

  addAccount = () => {
    const { name, secret, loading } = this.state;

    if (loading || !name || secret.length !== 56) return;

    this.setState({ loading: true });

    store
      .addAccount({
        name,
        secret
      })
      .then(() => {
        this.setState({ loading: false });
        this.props.navigation.goBack();
      })
      .catch(error => {
        this.setState({ loading: false });
        alert(error);
      });
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.formGroup}>
          <Typo.T>
            Sign in to an existing account (in the Test Network) using its
            secret key and give it a catchy name.
          </Typo.T>
        </View>

        <View style={styles.formGroup}>
          <Typo.L>Name</Typo.L>
          <Input
            autoFocus
            onChangeText={name => this.setState({ name })}
            placeholder="e.g. Lambo Dreams"
            onSubmitEditing={() => this.secretInput.focus()}
          />
        </View>

        <View style={styles.formGroup}>
          <Typo.L>Secret Key</Typo.L>
          <Input
            ref={_this => (this.secretInput = _this)}
            onChangeText={secret => this.setState({ secret })}
            placeholder="e.g. SCHBJ...........ZLJ7"
            returnKeyType="send"
            maxLength={56}
            onSubmitEditing={this.addAccount}
          />
        </View>

        {this.state.loading ? (
          <ActivityIndicator size="large" style={styles.loader} />
        ) : (
          <Button
            title="Add Account →"
            onPress={this.addAccount}
            disabled={!this.state.name || this.state.secret.length !== 56}
          />
        )}

        <Typo.T style={{ marginTop: 50 }}>
          To generate a new keypair,{" "}
          <Typo.Link
            onPress={() => {
              Linking.openURL("https://www.stellar.org/account-viewer");
            }}
          >
            visit Stellar's official Account Viewer
          </Typo.Link>.
        </Typo.T>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20
  },
  formGroup: {
    marginBottom: 15
  },
  generatedWrap: {
    paddingVertical: 30
  },
  loader: {
    height: 40,
    justifyContent: "center"
  }
});
