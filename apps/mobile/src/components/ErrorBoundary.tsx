import { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing, font } from '../theme';
import { Title, Body, Button } from '../ui';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Boundary leve (M8) — evita tela branca silenciosa no Expo Go.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Atlas] ErrorBoundary', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <View style={styles.box}>
          <Title style={styles.title}>Algo quebrou na UI</Title>
          <Body tone="muted" style={styles.body}>
            {this.state.error.message}
          </Body>
          <Button label="Tentar de novo" onPress={() => this.setState({ error: null })} />
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: { marginBottom: spacing.sm, fontFamily: font.family.serif },
  body: { marginBottom: spacing.lg },
});
