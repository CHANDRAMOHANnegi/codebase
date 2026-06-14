import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

const savedLooks = [
  {
    id: 'barber-reference',
    title: 'Barber Reference',
    subtitle: 'Clean Side Fade / diamond face',
    status: 'Ready to share'
  },
  {
    id: 'hairline-preview',
    title: 'Hairline Preview',
    subtitle: 'Conservative mature hairline',
    status: 'Consultation note'
  }
];

export function SavedLooksScreen() {
  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.title}>Saved looks</Text>
      <Text style={styles.body}>Keep haircut previews, barber notes, and consultation references in one place.</Text>
      {savedLooks.map((look) => (
        <View key={look.id} style={styles.card}>
          <View style={styles.thumb}>
            <Text style={styles.thumbText}>{look.title.slice(0, 1)}</Text>
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{look.title}</Text>
            <Text style={styles.cardSubtitle}>{look.subtitle}</Text>
            <Text style={styles.status}>{look.status}</Text>
          </View>
        </View>
      ))}
      <View style={styles.note}>
        <Text style={styles.noteTitle}>Next build step</Text>
        <Text style={styles.noteBody}>Capture real camera frames and save the selected style overlay here.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    padding: theme.spacing.lg
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800'
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginTop: theme.spacing.sm
  },
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    padding: theme.spacing.md
  },
  thumb: {
    alignItems: 'center',
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.md,
    height: 72,
    justifyContent: 'center',
    width: 72
  },
  thumbText: {
    color: theme.colors.accent,
    fontSize: 28,
    fontWeight: '900'
  },
  cardText: {
    flex: 1
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800'
  },
  cardSubtitle: {
    color: theme.colors.textMuted,
    marginTop: 4
  },
  status: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
    textTransform: 'uppercase'
  },
  note: {
    backgroundColor: theme.colors.surfaceRaised,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md
  },
  noteTitle: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  noteBody: {
    color: theme.colors.textMuted,
    lineHeight: 21,
    marginTop: 8
  }
});
