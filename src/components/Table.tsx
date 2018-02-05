import React from "react";
import { StyleSheet, ScrollView, View, Text } from "react-native";
import _ from "lodash";
import { Separator } from "./";

export const TableView = (props: any) => {
  const children = _.concat([], props.children).filter(
    (section: any) => !!section
  );

  return (
    <ScrollView style={styles.container} {...props}>
      {children}
    </ScrollView>
  );
};

export interface SectionProps {
  children: any;
  borders?: boolean;
  spacing?: boolean;
  header?: string;
}

export const Section = (props: SectionProps) => {
  const { borders = true, spacing = true } = props;
  const children = _.concat([], props.children).filter((cell: any) => !!cell);

  return (
    <View style={[spacing && styles.sectionSpacing]}>
      {props.header && (
        <View style={styles.header}>
          <Text style={styles.headerText}>{props.header.toUpperCase()}</Text>
        </View>
      )}
      <View style={[borders && styles.sectionBorders]}>
        {_.flatten(children).map((Cell: any, idx: number) => (
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
