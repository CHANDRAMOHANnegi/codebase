import { Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme/theme';

export type TabKey = 'tryOn' | 'scan' | 'saved';

type Props = {
  active: TabKey;
  onChange: (tab: TabKey) => void;
};

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: 'tryOn', label: 'Try On' },
  { key: 'scan', label: 'Scan' },
  { key: 'saved', label: 'Saved' }
];

export function BottomTabs({ active, onChange }: Props) {
  return (
    <View style={styles.wrap}>
      {tabs.map((tab) => {
        const selected = active === tab.key;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            style={[styles.tab, selected && styles.selected]}
          >
            <Text style={[styles.label, selected && styles.selectedLabel]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: theme.colors.surface,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    padding: theme.spacing.md
  },
  tab: {
    alignItems: 'center',
    borderRadius: 999,
    flex: 1,
    paddingVertical: 12
  },
  selected: {
    backgroundColor: theme.colors.accent
  },
  label: {
    color: theme.colors.textMuted,
    fontWeight: '700'
  },
  selectedLabel: {
    color: '#16110A'
  }
});
