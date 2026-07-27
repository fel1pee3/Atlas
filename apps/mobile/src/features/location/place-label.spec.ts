import { formatPlaceLabel } from './place-label';

describe('formatPlaceLabel', () => {
  it('prefere rua + número em vez do name de POI vizinho', () => {
    expect(
      formatPlaceLabel({
        name: 'Padaria do Vizinho',
        streetNumber: '120',
        street: 'Rua das Flores',
        city: 'São Paulo',
        region: 'SP',
      }),
    ).toBe('120 Rua das Flores, São Paulo, SP');
  });

  it('usa name quando não há rua', () => {
    expect(
      formatPlaceLabel({
        name: 'Parque Ibirapuera',
        city: 'São Paulo',
      }),
    ).toBe('Parque Ibirapuera, São Paulo');
  });
});
