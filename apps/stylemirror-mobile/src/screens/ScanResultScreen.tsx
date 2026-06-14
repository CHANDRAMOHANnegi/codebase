import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { FaceScanResult } from '@stylemirror/shared';
import { getHairlineGuidance, HairstyleRecommendation } from '@stylemirror/style-engine';
import { celebrityReferences } from '../data/celebrityReferences';
import { theme } from '../theme/theme';

type Props = {
  scan: FaceScanResult;
  recommendations: HairstyleRecommendation[];
};

export function ScanResultScreen({ scan, recommendations }: Props) {
  const references = celebrityReferences[scan.faceShape] ?? [];
  const hairlineGuidance = getHairlineGuidance(scan);

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <View style={styles.summary}>
        <Text style={styles.kicker}>Your style profile</Text>
        <Text style={styles.title}>{scan.faceShape} face</Text>
        <Text style={styles.body}>
          Hairline appears {scan.hairlineStage.replaceAll('_', ' ')}. Suggestions are style guidance,
          not medical diagnosis.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Scan signals</Text>
      {scan.signals.map((signal) => (
        <View key={signal.id} style={styles.signalCard}>
          <View style={styles.signalHeader}>
            <Text style={styles.signalLabel}>{signal.label}</Text>
            <Text style={styles.signalValue}>{signal.value}</Text>
          </View>
          <Text style={styles.signalBody}>{signal.description}</Text>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Reference looks</Text>
      <View style={styles.grid}>
        {references.map((name) => (
          <View key={name} style={styles.referenceCard}>
            <Text style={styles.referenceInitial}>{name.slice(0, 1)}</Text>
            <Text style={styles.referenceName}>{name}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Recommended haircuts</Text>
      {recommendations.map((item) => (
        <View key={item.id} style={styles.recommendation}>
          <Text style={styles.recName}>{item.name}</Text>
          <Text style={styles.recReason}>{item.reason}</Text>
          <Text style={styles.barberNote}>{item.barberNote}</Text>
          {item.caution ? <Text style={styles.caution}>{item.caution}</Text> : null}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Hairline guidance</Text>
      <View style={styles.guidance}>
        {hairlineGuidance.map((item) => (
          <Text key={item} style={styles.guidanceItem}>{item}</Text>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl
  },
  summary: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    padding: theme.spacing.lg
  },
  kicker: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '800',
    marginTop: theme.spacing.sm,
    textTransform: 'capitalize'
  },
  body: {
    color: theme.colors.textMuted,
    lineHeight: 22,
    marginTop: theme.spacing.sm
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm
  },
  signalCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md
  },
  signalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md
  },
  signalLabel: {
    color: theme.colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '800'
  },
  signalValue: {
    color: theme.colors.accent,
    fontSize: 13,
    fontWeight: '900'
  },
  signalBody: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginTop: 8
  },
  referenceCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md,
    width: '31%'
  },
  referenceInitial: {
    color: theme.colors.accent,
    fontSize: 24,
    fontWeight: '900'
  },
  referenceName: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
    marginTop: theme.spacing.sm,
    textAlign: 'center'
  },
  recommendation: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md
  },
  recName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800'
  },
  recReason: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginTop: 6
  },
  barberNote: {
    color: theme.colors.text,
    lineHeight: 20,
    marginTop: theme.spacing.sm
  },
  caution: {
    color: theme.colors.warning,
    fontSize: 12,
    lineHeight: 18,
    marginTop: theme.spacing.sm
  },
  guidance: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    padding: theme.spacing.md
  },
  guidanceItem: {
    color: theme.colors.textMuted,
    lineHeight: 22,
    marginBottom: theme.spacing.sm
  }
});
