/**
 * Demo connectors only in __DEV__ (Expo Go / local debug).
 * Production / dogfood builds use real Health / Location / Calendar sources.
 */
export function isDemoConnectorAllowed(): boolean {
  return typeof __DEV__ !== 'undefined' && __DEV__;
}
