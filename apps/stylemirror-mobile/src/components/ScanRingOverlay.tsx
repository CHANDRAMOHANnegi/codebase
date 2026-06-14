import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { theme } from '../theme/theme';

type Props = {
  scanning: boolean;
};

export function ScanRingOverlay({ scanning }: Props) {
  const rotation = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (scanning) {
      // Fade in
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true
      }).start();

      // Spin loop
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1800,
          easing: Easing.linear,
          useNativeDriver: true
        })
      ).start();

      // Pulse loop
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.06,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          }),
          Animated.timing(pulse, {
            toValue: 0.96,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true
          })
        ])
      ).start();
    } else {
      rotation.stopAnimation();
      pulse.stopAnimation();
      Animated.timing(opacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true
      }).start(() => {
        rotation.setValue(0);
        pulse.setValue(1);
      });
    }
  }, [scanning]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <Animated.View style={[styles.wrapper, { opacity }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.ring,
          { transform: [{ rotate: spin }, { scale: pulse }] }
        ]}
      >
        {/* Dashed ring segments */}
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.segment,
              {
                transform: [{ rotate: `${i * 30}deg` }],
                opacity: i % 3 === 0 ? 1 : 0.35
              }
            ]}
          />
        ))}
      </Animated.View>

      {/* Inner glow ring */}
      <Animated.View
        style={[
          styles.innerRing,
          { transform: [{ scale: pulse }] }
        ]}
      />

      {/* Corner brackets */}
      <View style={[styles.bracket, styles.bracketTL]} />
      <View style={[styles.bracket, styles.bracketTR]} />
      <View style={[styles.bracket, styles.bracketBL]} />
      <View style={[styles.bracket, styles.bracketBR]} />
    </Animated.View>
  );
}

const RING_SIZE = 200;
const INNER_SIZE = 168;
const BRACKET = 22;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    height: RING_SIZE + 40,
    justifyContent: 'center',
    position: 'absolute',
    width: RING_SIZE + 40
  },
  ring: {
    alignItems: 'center',
    height: RING_SIZE,
    justifyContent: 'center',
    position: 'absolute',
    width: RING_SIZE
  },
  segment: {
    backgroundColor: theme.colors.accent,
    borderRadius: 2,
    height: 4,
    left: RING_SIZE / 2 - 2,
    position: 'absolute',
    top: 2,
    transformOrigin: `2px ${RING_SIZE / 2 - 2}px`,
    width: 4
  },
  innerRing: {
    borderColor: `${theme.colors.accent}40`,
    borderRadius: INNER_SIZE / 2,
    borderWidth: 1.5,
    height: INNER_SIZE,
    position: 'absolute',
    width: INNER_SIZE
  },
  bracket: {
    borderColor: theme.colors.accent,
    height: BRACKET,
    position: 'absolute',
    width: BRACKET
  },
  bracketTL: {
    borderLeftWidth: 3,
    borderTopWidth: 3,
    left: 10,
    top: 10,
    borderTopLeftRadius: 6
  },
  bracketTR: {
    borderRightWidth: 3,
    borderTopWidth: 3,
    right: 10,
    top: 10,
    borderTopRightRadius: 6
  },
  bracketBL: {
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    bottom: 10,
    left: 10,
    borderBottomLeftRadius: 6
  },
  bracketBR: {
    borderBottomWidth: 3,
    borderRightWidth: 3,
    bottom: 10,
    right: 10,
    borderBottomRightRadius: 6
  }
});
