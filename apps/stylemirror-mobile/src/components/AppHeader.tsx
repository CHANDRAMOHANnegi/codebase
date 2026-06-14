import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

export function AppHeader() {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>StyleMirror</Text>
        <Text style={styles.subtitle}>Face-first hair advisor</Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>AI scan</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.md
  },
  title: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '700'
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 13,
    marginTop: 2
  },
  badge: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  badgeText: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '700'
  }
});
