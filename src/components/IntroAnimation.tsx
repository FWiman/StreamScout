import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, Easing, Platform, Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/theme";
import { Logo } from "./Logo";

const lensImage = require("../../assets/intro-lens.png");
const sparkleImage = require("../../assets/intro-sparkle.png");

/** Shown once per app launch / page load. */
let alreadyShown = false;

const LENS = 150;
const native = Platform.OS !== "web";

/**
 * Intro on opening the site or app (~2 s): the glowing lens slides in, the sparkle inside
 * it lights up, the wordmark and tagline fade in, then everything fades out.
 * Tap to skip. Skipped entirely for people who've turned on "reduce motion".
 */
export function IntroAnimation() {
  const [visible, setVisible] = useState(!alreadyShown);
  const lens = useRef(new Animated.Value(0)).current;
  const sparkle = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;
  const overlay = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) return;
    alreadyShown = true;
    let animation: Animated.CompositeAnimation | undefined;
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduceMotion) => {
        if (cancelled) return;
        if (reduceMotion) {
          setVisible(false);
          return;
        }
        animation = Animated.sequence([
          Animated.parallel([
            Animated.spring(lens, { toValue: 1, friction: 7, tension: 50, useNativeDriver: native }),
            Animated.sequence([
              Animated.delay(380),
              Animated.timing(sparkle, {
                toValue: 1,
                duration: 650,
                easing: Easing.out(Easing.back(2.2)),
                useNativeDriver: native,
              }),
            ]),
            Animated.sequence([
              Animated.delay(650),
              Animated.timing(text, { toValue: 1, duration: 450, easing: Easing.out(Easing.cubic), useNativeDriver: native }),
            ]),
          ]),
          Animated.delay(650),
          Animated.timing(overlay, { toValue: 0, duration: 450, easing: Easing.in(Easing.quad), useNativeDriver: native }),
        ]);
        animation.start(({ finished }) => finished && setVisible(false));
      });

    return () => {
      cancelled = true;
      animation?.stop();
    };
  }, [visible, lens, sparkle, text, overlay]);

  if (!visible) return null;

  const skip = () => {
    Animated.timing(overlay, { toValue: 0, duration: 200, useNativeDriver: native }).start(() => setVisible(false));
  };

  return (
    <Animated.View style={[styles.overlay, { opacity: overlay }]}>
      <Pressable style={styles.center} onPress={skip} accessibilityRole="button" accessibilityLabel="Skip intro">
        <Animated.View
          style={{
            width: LENS,
            height: LENS,
            opacity: lens,
            transform: [
              { translateX: lens.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) },
              { scale: lens.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
            ],
          }}
        >
          <Image source={lensImage} style={StyleSheet.absoluteFill} contentFit="contain" />
          {/* The sparkle image is the 40×40 area of the 100×100 lens around the sparkle's centre. */}
          <Animated.View
            style={[
              styles.sparkle,
              {
                opacity: sparkle,
                transform: [
                  { scale: sparkle },
                  { rotate: sparkle.interpolate({ inputRange: [0, 1], outputRange: ["-90deg", "0deg"] }) },
                ],
              },
            ]}
          >
            <Image source={sparkleImage} style={StyleSheet.absoluteFill} contentFit="contain" />
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.text,
            {
              opacity: text,
              transform: [{ translateY: text.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
            },
          ]}
        >
          <Logo size={38} />
          <Text style={styles.tagline}>Find your next favorite.</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
  },
  sparkle: {
    position: "absolute",
    left: LENS * 0.26,
    top: LENS * 0.24,
    width: LENS * 0.4,
    height: LENS * 0.4,
  },
  text: {
    alignItems: "center",
    gap: 8,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 17,
    fontFamily: Platform.select({ web: "Fraunces_700Bold, Georgia, serif", default: "Fraunces_700Bold" }),
  },
});
