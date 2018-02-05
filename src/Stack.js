import React from "react";
import { TouchableOpacity } from "react-native";
import { StackNavigator } from "react-navigation";
import { Ionicons } from "@expo/vector-icons";
import { Home, Send, Deposit, Payment, Settings, New } from "./screens";

export default StackNavigator(
  {
    Home: {
      screen: Home
    },
    Send: {
      screen: Send
    },
    Deposit: {
      screen: Deposit
    },
    Payment: {
      screen: Payment
    },
    Settings: {
      screen: Settings
    },
    New: {
      screen: New
    }
  },
  {
    navigationOptions: ({ navigation }) => ({
      headerStyle: {
        backgroundColor: "white"
      },
      headerLeft: (
        <TouchableOpacity
          activeOpacity={0.5}
          style={{
            padding: 15
          }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="ios-close" size={40} color="#222" />
        </TouchableOpacity>
      ),
      gesturesEnabled: false,
      headerTitleStyle: {
        fontFamily: "ClearSans",
        marginTop: -2
      }
    }),
    mode: "modal"
  }
);
