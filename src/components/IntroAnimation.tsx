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

/** How far the lens grows when we fly through it – big enough that the ring leaves the screen. */
const ZOOM = 28;
/** The glass's centre is at 42 % of the lens image (the handle takes the bottom right). */
const GLASS_OFFSET = (0.42 - 0.5) * LENS;

/**
 * Intro on opening the site or app (~2.5 s): the glowing lens slides in, the sparkle inside
 * it lights up, the wordmark and tagline fade in, then we fly through the glass into the page.
 * Tap to skip. Skipped entirely for people who've turned on "reduce motion".
 */
export function IntroAnimation() {
  const [visible, setVisible] = useState(!alreadyShown);
  const lens = useRef(new Animated.Value(0)).current;
  const sparkle = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;
  const overlay = useRef(new Animated.Value(1)).current;
  /** 0 → 1: flying through the lens at the end. */
  const zoom = useRef(new Animated.Value(0)).current;

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
              Animated.timing(text, { toValue: 1, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: native }),
            ]),
          ]),
          Animated.delay(1000),
          // Fly through the glass: the lens grows past the screen while the background fades,
          // so the page appears inside the glass.
          Animated.parallel([
            Animated.timing(zoom, { toValue: 1, duration: 750, easing: Easing.in(Easing.cubic), useNativeDriver: native }),
            Animated.sequence([
              Animated.delay(200),
              Animated.timing(overlay, { toValue: 0, duration: 450, easing: Easing.in(Easing.quad), useNativeDriver: native }),
            ]),
          ]),
        ]);
        animation.start(({ finished }) => finished && setVisible(false));
      });

    return () => {
      cancelled = true;
      animation?.stop();
    };
  }, [visible, lens, sparkle, text, overlay, zoom]);

  if (!visible) return null;

  const skip = () => {
    Animated.parallel([
      Animated.timing(overlay, { toValue: 0, duration: 200, useNativeDriver: native }),
      Animated.timing(zoom, { toValue: 1, duration: 200, useNativeDriver: native }),
    ]).start(() => setVisible(false));
  };

  const scale = zoom.interpolate({ inputRange: [0, 1], outputRange: [1, ZOOM] });
  // Keep the glass's centre in place while scaling (RN scales around the view's centre).
  const shift = zoom.interpolate({ inputRange: [0, 1], outputRange: [0, GLASS_OFFSET * (1 - ZOOM)] });

  return (
    <Animated.View style={styles.overlay} pointerEvents="box-none">
      <Animated.View style={[styles.background, { opacity: overlay }]} />
      <Pressable style={styles.center} onPress={skip} accessibilityRole="button" accessibilityLabel="Skip intro">
        <Animated.View
          style={{
            opacity: zoom.interpolate({ inputRange: [0, 0.75, 1], outputRange: [1, 1, 0] }),
            transform: [{ translateX: shift }, { translateY: shift }, { scale }],
          }}
        >
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
                  // The sparkle fades as we start flying through, so it doesn't fill the screen.
                  opacity: Animated.multiply(
                    sparkle,
                    zoom.interpolate({ inputRange: [0, 0.3], outputRange: [1, 0], extrapolate: "clamp" })
                  ),
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
        </Animated.View>

        <Animated.View
          style={[
            styles.text,
            {
              opacity: Animated.multiply(
                text,
                zoom.interpolate({ inputRange: [0, 0.15], outputRange: [1, 0], extrapolate: "clamp" })
              ),
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
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
  },
  background: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
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
