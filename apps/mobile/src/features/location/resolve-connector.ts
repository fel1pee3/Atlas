import { Platform } from 'react-native';
import type { LocationConnector } from './location.connector';
import { DemoLocationConnector } from './demo.connector';
import { NativeLocationConnectorStub } from './native.stub';

export function resolveLocationConnector(): LocationConnector {
  return new DemoLocationConnector();
}

export function listLocationConnectors(): LocationConnector[] {
  const demo = new DemoLocationConnector();
  if (Platform.OS === 'web') return [demo];
  return [demo, new NativeLocationConnectorStub()];
}
