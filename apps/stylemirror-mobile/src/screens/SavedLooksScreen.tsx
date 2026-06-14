import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSavedLooks } from '../features/saved/useSavedLooks';
import { theme } from '../theme/theme';

export function SavedLooksScreen() {
  const { looks, loading, deleteLook, clearAll } = useSavedLooks();

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Remove look', `Remove "${title}" from saved looks?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteLook(id) }
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Clear all', 'Remove all saved looks?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear all', style: 'destructive', onPress: () => clearAll() }
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Saved looks</Text>
          <Text style={styles.body}>
            Your haircut previews, barber notes, and consultation references.
          </Text>
        </View>
        {looks.length > 0 && (
          <Pressable onPress={handleClearAll} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {loading && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>⏳</Text>
          <Text style={styles.emptyTitle}>Loading...</Text>
        </View>
      )}

      {!loading && looks.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✂</Text>
          <Text style={styles.emptyTitle}>No saved looks yet</Text>
          <Text style={styles.emptyBody}>
            Scan your face, pick a hairstyle, and tap Save to keep a reference for your barber.
          </Text>
        </View>
      )}

      {looks.map((look) => (
        <View key={look.id} style={styles.card}>
          {look.photoUri ? (
            <Image source={{ uri: look.photoUri }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={styles.thumbPlaceholder}>
              <Text style={styles.thumbIcon}>{look.title.slice(0, 1)}</Text>
            </View>
          )}
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{look.title}</Text>
            <Text style={styles.cardSubtitle}>{look.subtitle}</Text>
            <Text style={styles.status}>{look.status}</Text>
            <Text style={styles.savedAt}>
              {new Date(look.savedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
          </View>
          <Pressable onPress={() => handleDelete(look.id, look.title)} style={styles.deleteButton}>
            <Text style={styles.deleteText}>✕</Text>
          </Pressable>
        </View>
      ))}

      <View style={styles.note}>
        <Text style={styles.noteTitle}>💡 Tip</Text>
        <Text style={styles.noteBody}>
          Take a screenshot of your saved look or share your barber note before your next appointment.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flexGrow: 1,
    padding: theme.spacing.lg
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800'
  },
  body: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    maxWidth: '80%'
  },
  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  clearText: {
    color: theme.colors.warning,
    fontSize: 13,
    fontWeight: '700'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: theme.spacing.md
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800'
  },
  emptyBody: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    maxWidth: '80%'
  },
  card: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md
  },
  thumb: {
    borderRadius: theme.radius.sm,
    height: 72,
    width: 72
  },
  thumbPlaceholder: {
    alignItems: 'center',
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.md,
    height: 72,
    justifyContent: 'center',
    width: 72
  },
  thumbIcon: {
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
    fontSize: 13,
    marginTop: 4
  },
  status: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
    textTransform: 'uppercase'
  },
  savedAt: {
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 4
  },
  deleteButton: {
    padding: 8
  },
  deleteText: {
    color: theme.colors.textMuted,
    fontSize: 16
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
