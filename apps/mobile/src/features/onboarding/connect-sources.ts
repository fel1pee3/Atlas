import type { ImageSourcePropType } from 'react-native';

export type ConnectSourceKind = 'health' | 'calendar' | 'location';

export type ConnectSourceContent = {
  kind: ConnectSourceKind;
  step: number;
  title: string;
  body: string;
  cta: string;
  hero: ImageSourcePropType;
  heroAlt: string;
  nextRoute: '/(onboarding)/connect-calendar' | '/(onboarding)/connect-location' | '/(onboarding)/aha';
};

export const CONNECT_TOTAL_STEPS = 3;

export const CONNECT_SOURCES: Record<ConnectSourceKind, ConnectSourceContent> = {
  health: {
    kind: 'health',
    step: 0,
    title: 'Conecte sua saúde',
    body: 'Importe sono e passos a partir de hoje para ver a timeline e o primeiro insight com a sua vida.',
    cta: 'Conectar Health Connect',
    hero: require('../../../assets/onboarding/hero-health.png'),
    heroAlt: 'Anéis de atividade com uma linha de pulso',
    nextRoute: '/(onboarding)/connect-calendar',
  },
  calendar: {
    kind: 'calendar',
    step: 1,
    title: 'Conecte sua agenda',
    body: 'Seus eventos dão semântica ao tempo — o Atlas entende o que aconteceu em cada momento do dia.',
    cta: 'Conectar calendário do aparelho',
    hero: require('../../../assets/onboarding/hero-agenda.png'),
    heroAlt: 'Cartão de calendário com um arco de relógio',
    nextRoute: '/(onboarding)/connect-location',
  },
  location: {
    kind: 'location',
    step: 2,
    title: 'Conecte seus lugares',
    body: 'Visitas e rotina ajudam a reconhecer padrões — sem rastro contínuo, apenas os lugares que importam.',
    cta: 'Permitir localização',
    hero: require('../../../assets/onboarding/hero-places.png'),
    heroAlt: 'Marcador de localização com um caminho',
    nextRoute: '/(onboarding)/aha',
  },
};
