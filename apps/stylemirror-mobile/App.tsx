import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { recommendHairstyles } from '@stylemirror/style-engine';
import { AppHeader } from './src/components/AppHeader';
import { BottomTabs, TabKey } from './src/components/BottomTabs';
import { useFaceScan } from './src/features/scan/useFaceScan';
import { CameraTryOnScreen } from './src/screens/CameraTryOnScreen';
import { ScanResultScreen } from './src/screens/ScanResultScreen';
import { SavedLooksScreen } from './src/screens/SavedLooksScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { theme } from './src/theme/theme';

export default function App() {
  const [tab, setTab] = useState<TabKey>('tryOn');
  const [hasStarted, setHasStarted] = useState(false);
  const { runDemoScan, scan, status } = useFaceScan();
  const recommendations = useMemo(() => recommendHairstyles(scan), [scan]);

  if (!hasStarted) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        <WelcomeScreen onStart={() => setHasStarted(true)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      <AppHeader />
      <View style={styles.content}>
        {tab === 'tryOn' ? (
          <CameraTryOnScreen
            onRunScan={runDemoScan}
            recommendations={recommendations}
            scan={scan}
            scanStatus={status}
          />
        ) : null}
        {tab === 'scan' ? <ScanResultScreen scan={scan} recommendations={recommendations} /> : null}
        {tab === 'saved' ? <SavedLooksScreen /> : null}
      </View>
      <BottomTabs active={tab} onChange={setTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: theme.colors.background,
    flex: 1
  },
  content: {
    flex: 1
  }
});
