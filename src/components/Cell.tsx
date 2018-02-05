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

export interface CellProps {
  title: string;
  detail?: string;
  renderDetail?: JSX.Element;
  onPress?: any;
  type?: string;
  hideAccessory?: boolean;
  detailCopiable?: boolean;
}

export default (props: CellProps) => {
  const isDanger = props.type === "danger";
  const hideAccessory = isDanger ? true : props.hideAccessory;

  return (
    <TouchableHighlight
      disabled={!props.onPress && !props.detailCopiable}
      underlayColor="rgba(0,0,0,0.35)"
      onPress={props.onPress}
      onLongPress={() => {
        if (props.detailCopiable && props.detail) {
          Clipboard.setString(props.detail);
          Alert.alert("Copied!");
        }
      }}
    >
      <View style={styles.cell}>
        <Text
          numberOfLines={1}
          style={[styles.title, isDanger && styles.dangerTitle]}
        >
          {props.title}
        </Text>

        {!!props.detail && (
          <Typo.Detail
            numberOfLines={1}
            ellipsizeMode="middle"
            style={{ flex: 1 }}
          >
            {props.detail}
          </Typo.Detail>
        )}

        {!!props.renderDetail && (
          <View style={styles.detailWrap}>{props.renderDetail}</View>
        )}

        {props.onPress && !hideAccessory && <View style={styles.accessory} />}
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
