import { Stack } from "expo-router";

/* layout : düzen dosyasıdır. */
/* Stack : navigator düzenlememizi sağlar 
 */
export default function RootLayout() {
  return <Stack screenOptions={{title:"Home"}}>
   <Stack.Screen name="index" options={{title:"Home"}}/>
  </Stack>
}
