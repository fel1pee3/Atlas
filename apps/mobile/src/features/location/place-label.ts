/**
 * Monta rótulo de visita a partir do reverse geocode.
 * Prefere rua + número (evita `name` de POI vizinho no Android).
 */
export function formatPlaceLabel(place: {
  name?: string | null;
  street?: string | null;
  streetNumber?: string | null;
  district?: string | null;
  subregion?: string | null;
  city?: string | null;
  region?: string | null;
}): string | undefined {
  const streetLine = [place.streetNumber, place.street]
    .map((x) => (typeof x === 'string' ? x.trim() : ''))
    .filter(Boolean)
    .join(' ');

  const parts = [
    streetLine || (typeof place.name === 'string' ? place.name.trim() : ''),
    typeof place.district === 'string' ? place.district.trim() : '',
    typeof place.city === 'string' ? place.city.trim() : '',
    typeof place.region === 'string' ? place.region.trim() : '',
  ].filter(Boolean);

  const unique: string[] = [];
  for (const part of parts) {
    if (unique[unique.length - 1]?.toLowerCase() !== part.toLowerCase()) {
      unique.push(part);
    }
  }
  return unique.length > 0 ? unique.join(', ') : undefined;
}
