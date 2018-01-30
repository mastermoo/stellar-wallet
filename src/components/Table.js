import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableHighlight,
  Text,
  TextInput
} from "react-native";
import _ from "lodash";
import { Separator } from "./";

export const TableView = props => {
  const children = _.concat([], props.children).filter(section => !!section);

  return (
    <ScrollView style={styles.container} {...props}>
      {children}
    </ScrollView>
  );
};

export const Section = ({
  children,
  borders = true,
  spacing = true,
  header
}) => {
  children = _.concat([], children).filter(cell => !!cell);

  return (
    <View style={[styles.section, spacing && styles.sectionSpacing]}>
      {header && (
        <View style={styles.header}>
          <Text style={styles.headerText}>{header.toUpperCase()}</Text>
        </View>
      )}
      <View style={[borders && styles.sectionBorders]}>
        {_.flatten(children).map((Cell, idx) => (
          <View key={idx}>
            {Cell}
            {idx < children.length - 1 && <Separator />}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f3f3",
    paddingVertical: 10
  },
  sectionBorders: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#dedede"
  },
  sectionSpacing: {
    marginVertical: 10
  },
  header: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 5
  },
  headerText: {
    fontSize: 13,
    color: "#6d6d72"
  }
});

export default {
  TableView: TableView,
  Section: Section
};
