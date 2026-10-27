import {
  requireNativeComponent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
} from 'react-native';
import type { ViewProps } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

const ClippingView = requireNativeComponent<ViewProps>(
  'ReproducerClippingView',
);

const ROWS = Array.from({ length: 40 }, (_, index) => `Row ${index + 1}`);

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.screen}>
        <ClippingView style={styles.fieldBox}>
          <TextInput
            autoFocus
            placeholder="The caret blinks here"
            style={styles.field}
          />
        </ClippingView>
        <ScrollView>
          {ROWS.map(row => (
            <Text key={row} style={styles.row}>
              {row}
            </Text>
          ))}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  fieldBox: {
    margin: 16,
  },
  field: {
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#888888',
    borderRadius: 8,
    fontSize: 18,
    color: '#000000',
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
  },
});

export default App;
