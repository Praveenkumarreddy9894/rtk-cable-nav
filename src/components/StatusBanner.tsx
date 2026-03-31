import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  status: string;
  warning: string | null;
  fixText: string;
  offsetText: string;
}

export function StatusBanner({ status, warning, fixText, offsetText }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.row}>Status: {status}</Text>
      <Text style={styles.row}>Fix: {fixText}</Text>
      <Text style={styles.row}>Offset: {offsetText}</Text>
      {warning ? <Text style={styles.warn}>Warning: {warning}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    position: "absolute",
    top: 40,
    left: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.72)",
    borderRadius: 8,
    padding: 12,
    zIndex: 10
  },
  row: { color: "#fff", fontSize: 13, marginBottom: 4 },
  warn: { color: "#ffcb3d", fontSize: 13, fontWeight: "600" }
});
