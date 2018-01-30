import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";

const Sub = props => (
  <Text style={[styles.sub, props.style]}>{props.children}</Text>
);

const Title = props => (
  <Text style={[styles.title, props.style]}>{props.children}</Text>
);

const L = props => (
  <Text style={[styles.label, props.style]}>{props.children}</Text>
);

const T = props => (
  <Text style={[styles.text, props.style]}>{props.children}</Text>
);

const H = props => (
  <Text style={[styles.headline, props.style]}>{props.children}</Text>
);

const Green = props => (
  <Text style={[styles.green, props.style]}>{props.children}</Text>
);

const Detail = props => (
  <Text {...props} style={[styles.detail, props.style]}>
    {props.children}
  </Text>
);

const Link = props => (
  <Text {...props} style={[styles.link, props.style]}>
    {props.children}
  </Text>
);

const fontFamily = "ClearSans";
const Colors = {
  link: "#07a2cc",
  bg: "#D4EEF7",
  light: "#5b6a72"
};

const styles = StyleSheet.create({
  text: {
    fontFamily,
    color: "#5b6a72",
    fontSize: 16,
    fontWeight: "400"
  },
  title: {
    fontFamily,
    color: "#000000",
    fontSize: 17,
    fontWeight: "500"
  },
  sub: {
    fontFamily,
    color: "#5b6a72",
    fontSize: 14,
    fontWeight: "400"
  },
  label: {
    fontFamily,
    color: "#5b6a72",
    fontSize: 14,
    fontWeight: "400",
    marginBottom: 5
  },
  headline: {
    fontFamily,
    color: "#000000",
    fontSize: 20,
    fontWeight: "500"
  },
  green: {
    color: "#00ca5a"
  },
  detail: {
    fontSize: 16,
    textAlign: "right",
    fontFamily,
    color: "#888"
  },
  link: {
    color: Colors.link,
    textDecorationLine: "underline",
    textDecorationColor: Colors.link,
    textDecorationStyle: "solid"
  }
});

export default {
  Title,
  Sub,
  L,
  T,
  H,
  Green,
  Link,
  Detail,
  Colors
};
