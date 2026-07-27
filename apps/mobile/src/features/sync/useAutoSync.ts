import { useEffect } from 'react';
import { startAutoSync, stopAutoSync } from './auto-sync';

/** Mantém saúde/agenda/localização e insights atualizados sem tocar em Atualizar. */
export function useAutoSync(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      stopAutoSync();
      return;
    }
    startAutoSync();
    return () => {
      stopAutoSync();
    };
  }, [enabled]);
}
