import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import { StylePreference } from '@stylemirror/shared';
import { recommendHairstyles } from '@stylemirror/style-engine';
import { AppHeader } from './src/components/AppHeader';
import { BottomTabs, TabKey } from './src/components/BottomTabs';
import { useFaceScan } from './src/features/scan/useFaceScan';
import { useSavedLooks } from './src/features/saved/useSavedLooks';
import { CameraTryOnScreen } from './src/screens/CameraTryOnScreen';
import { ScanResultScreen } from './src/screens/ScanResultScreen';
import { SavedLooksScreen } from './src/screens/SavedLooksScreen';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { theme } from './src/theme/theme';

export default function App() {
  const [tab, setTab] = useState<TabKey>('tryOn');
  const [hasStarted, setHasStarted] = useState(false);
  const [stylePreference, setStylePreference] = useState<StylePreference>('all');

  const { runRealScan, runDemoScan, scan, status, errorMsg, faceBounds, lastPhotoUri } =
    useFaceScan();
  const { saveLook } = useSavedLooks();

  const recommendations = useMemo(
    () => recommendHairstyles(scan, stylePreference),
    [scan, stylePreference]
  );

  const handleSaveLook = (styleId: string, styleName: string, photoUri?: string) => {
    saveLook({ faceShape: scan.faceShape, styleId, styleName, photoUri });
    // Navigate to saved tab briefly to confirm
    setTab('saved');
    setTimeout(() => setTab('tryOn'), 1500);
  };

  if (!hasStarted) {
    return (
      <SafeAreaView style={styles.root}>
        <StatusBar style="light" />
        <WelcomeScreen
          onStart={(pref) => {
            setStylePreference(pref);
            setHasStarted(true);
          }}
        />
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
            onRunRealScan={runRealScan}
            onRunDemoScan={runDemoScan}
            onSaveLook={handleSaveLook}
            recommendations={recommendations}
            scan={scan}
            scanStatus={status}
            errorMsg={errorMsg}
            faceBounds={faceBounds}
            lastPhotoUri={lastPhotoUri}
          />
        ) : null}
        {tab === 'scan' ? (
          <ScanResultScreen scan={scan} recommendations={recommendations} />
        ) : null}
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
