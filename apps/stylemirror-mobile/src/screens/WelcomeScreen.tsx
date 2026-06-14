import { useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

type StylePref = 'Men' | 'Women' | 'All styles';
const PREFS: StylePref[] = ['Men', 'Women', 'All styles'];

type Props = {
  onStart: (pref: StylePref) => void;
};

export function WelcomeScreen({ onStart }: Props) {
  const [selected, setSelected] = useState<StylePref>('All styles');

  return (
    <View style={styles.root}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>✦ STYLEMIRROR</Text>
        </View>
        <Text style={styles.title}>Find haircuts that{'\n'}fit your face.</Text>
        <Text style={styles.body}>
          Scan your face structure with your camera, get personalised hairstyle recommendations,
          and save a barber-ready reference in seconds.
        </Text>

        {/* Feature pills */}
        <View style={styles.pills}>
          {['Real face scan', 'AI shape match', 'Barber notes', 'Save & share'].map((f) => (
            <View key={f} style={styles.pill}>
              <Text style={styles.pillText}>✓ {f}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom panel */}
      <View style={styles.choicePanel}>
        <Text style={styles.panelTitle}>Explore styles for</Text>
        <View style={styles.chips}>
          {PREFS.map((p) => (
            <Pressable
              key={p}
              onPress={() => setSelected(p)}
              style={[styles.chip, selected === p && styles.chipSelected]}
            >
              <Text style={[styles.chipText, selected === p && styles.chipTextSelected]}>{p}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={styles.button} onPress={() => onStart(selected)}>
          <Text style={styles.buttonText}>Start face scan →</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Camera is used only on your device. No images are stored or sent to any server.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'space-between',
    padding: theme.spacing.lg
  },
  hero: {
    paddingTop: 52
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.accentSoft,
    borderColor: `${theme.colors.accent}66`,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  badgeText: {
    color: theme.colors.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5
  },
  title: {
    color: theme.colors.text,
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 46
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 25,
    marginTop: theme.spacing.md
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg
  },
  pill: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  pillText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700'
  },
  choicePanel: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.md
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700'
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.md
  },
  chip: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9
  },
  chipSelected: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent
  },
  chipText: {
    color: theme.colors.textMuted,
    fontWeight: '700'
  },
  chipTextSelected: {
    color: theme.colors.accent
  },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: 16
  },
  buttonText: {
    color: '#16110A',
    fontSize: 16,
    fontWeight: '800'
  },
  disclaimer: {
    color: theme.colors.textMuted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: theme.spacing.sm,
    textAlign: 'center'
  }
});
