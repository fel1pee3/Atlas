import { useState } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type LayoutChangeEvent,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';

type Props = {
  source: ImageSourcePropType;
  accessibilityLabel: string;
};

/**
 * Hero do onboarding com máscara radial circular —
 * o centro fica sólido e as bordas somem no fundo névoa.
 */
export function OnboardingHero({ source, accessibilityLabel }: Props) {
  const [size, setSize] = useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0 && w !== size) setSize(w);
  };

  return (
    <View style={styles.wrap} accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <View style={styles.frame} onLayout={onLayout}>
        {size > 0 ? (
          <MaskedView
            style={{ width: size, height: size }}
            maskElement={
              <Svg width={size} height={size}>
                <Defs>
                  <RadialGradient id="heroFade" cx="50%" cy="50%" rx="50%" ry="50%">
                    {/* Igual ao protótipo: opaco ~52%, transparente ~74%+ */}
                    <Stop offset="0%" stopColor="#fff" stopOpacity="1" />
                    <Stop offset="52%" stopColor="#fff" stopOpacity="1" />
                    <Stop offset="74%" stopColor="#fff" stopOpacity="0.35" />
                    <Stop offset="100%" stopColor="#fff" stopOpacity="0" />
                  </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width={size} height={size} fill="url(#heroFade)" />
              </Svg>
            }
          >
            <Image source={source} style={{ width: size, height: size }} resizeMode="cover" />
          </MaskedView>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minHeight: 160,
    maxHeight: 280,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  frame: {
    width: '78%',
    maxWidth: 260,
    aspectRatio: 1,
  },
});
