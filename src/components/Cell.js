import React from "react";
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Text,
  Clipboard,
  Alert
} from "react-native";
import { Typo } from "./";

export default ({
  title,
  detail,
  renderDetail,
  onPress,
  type,
  hideAccessory,
  detailCopiable
}) => {
  const isDanger = type === "danger";
  hideAccessory = isDanger ? true : hideAccessory;

  return (
    <TouchableHighlight
      disabled={!onPress && !detailCopiable}
      underlayColor="rgba(0,0,0,0.35)"
      onPress={onPress}
      onLongPress={() => {
        if (detailCopiable) {
          Clipboard.setString(detail);
          Alert.alert("Copied!");
        }
      }}
    >
      <View style={styles.cell}>
        <Text
          numberOfLines={1}
          style={[styles.title, isDanger && styles.dangerTitle]}
        >
          {title}
        </Text>

        {typeof detail === "string" ? (
          <Typo.Detail
            numberOfLines={1}
            ellipsizeMode="middle"
            style={{ flex: 1 }}
          >
            {detail}
          </Typo.Detail>
        ) : (
          detail && <View style={styles.detailWrap}>{detail}</View>
        )}

        {onPress && !hideAccessory && <View style={styles.accessory} />}
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  cell: {
    backgroundColor: "white",
    justifyContent: "center",
    paddingLeft: 20,
    paddingRight: 20,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center"
    // height: 44
  },
  title: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    fontFamily: "System",
    color: "black"
  },
  detailWrap: {
    flex: 1,
    alignItems: "flex-end"
  },
  accessory: {
    width: 10,
    height: 10,
    marginLeft: 7,
    backgroundColor: "transparent",
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: "#c7c7cc",
    transform: [
      {
        rotate: "45deg"
      }
    ]
  },
  dangerTitle: {
    textAlign: "center",
    color: "red"
  }
});
