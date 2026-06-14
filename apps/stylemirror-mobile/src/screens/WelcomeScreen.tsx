import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

type Props = {
  onStart: () => void;
};

export function WelcomeScreen({ onStart }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>StyleMirror</Text>
        <Text style={styles.title}>Find haircuts that fit your face, hairline, and style.</Text>
        <Text style={styles.body}>
          Scan your face structure, compare reference looks, and save a barber-ready hairstyle preview.
        </Text>
      </View>

      <View style={styles.choicePanel}>
        <Text style={styles.panelTitle}>Explore styles for</Text>
        <View style={styles.chips}>
          <Text style={styles.chip}>Men</Text>
          <Text style={styles.chip}>Women</Text>
          <Text style={styles.chip}>All styles</Text>
        </View>
        <Pressable style={styles.button} onPress={onStart}>
          <Text style={styles.buttonText}>Start face scan</Text>
        </Pressable>
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
    paddingTop: 72
  },
  kicker: {
    color: theme.colors.accent,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase'
  },
  title: {
    color: theme.colors.text,
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 44
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: theme.spacing.md
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
    color: theme.colors.text,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radius.md,
    paddingVertical: 15
  },
  buttonText: {
    color: '#16110A',
    fontSize: 16,
    fontWeight: '800'
  }
});
