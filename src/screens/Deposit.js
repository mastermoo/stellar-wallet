import React from "react";
import {
  StyleSheet,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Share
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import QRCode from "react-native-qrcode-svg";
import { CircleIcon, Typo } from "../components";
import store from "../store";

const marginBottom = value => ({
  marginBottom: value
});

export default class extends React.Component {
  static navigationOptions = {
    title: "Deposit"
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={marginBottom(20)}>
            <QRCode size={200} value={store.activeAccountId} />
          </View>
          <Typo.H style={marginBottom(10)}>You wallet address is:</Typo.H>
          <Typo.T style={{ marginBottom: 10, textAlign: "center" }}>
            {store.activeAccountId}
          </Typo.T>
          <TouchableOpacity
            onPress={this.shareAddress}
            style={styles.shareButton}
          >
            <Ionicons name="md-share" style={styles.shareIcon} />
            <Text style={styles.shareText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  shareAddress = () => {
    Share.share({
      title: "My XLM Address",
      message: `This is my wallet address: ${store.activeAccountId}`
    });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: "#ddd"
  },
  shareButton: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: "#e9e9e9",
    flexDirection: "row",
    alignItems: "center"
  },
  shareIcon: {
    color: "#000000",
    fontSize: 12,
    marginRight: 4
  },
  shareText: {
    fontFamily: "System",
    color: "#000000",
    fontSize: 12,
    fontWeight: "400"
  }
});
