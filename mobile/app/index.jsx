import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      /* style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }} */
      style={styles.container}
    >
      <Text style={{ color: "red" }}>Hello merhaba </Text>
      <Text style={styles.title}>Renk Blue</Text>

      <Link href="/(auth)/signup">Signup</Link>
      <Link href="/(auth)/login">Login</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: { color: "blue" },
});
