/**
 * Converts decimal degrees latitude & longitude to traditional Astrological DMS format
 * E.g., 11.0018, 76.9628 => "11° 00' N / 76° 58' E"
 */
export function formatDMSCoordinates(lat: number | string, lon: number | string): string {
  const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
  const lonNum = typeof lon === 'string' ? parseFloat(lon) : lon;

  if (isNaN(latNum) || isNaN(lonNum)) {
    return "10° 00' N / 78° 00' E";
  }

  const latAbs = Math.abs(latNum);
  const latDeg = Math.floor(latAbs);
  const latMin = Math.round((latAbs - latDeg) * 60);
  const latHem = latNum >= 0 ? 'N' : 'S';

  const lonAbs = Math.abs(lonNum);
  const lonDeg = Math.floor(lonAbs);
  const lonMin = Math.round((lonAbs - lonDeg) * 60);
  const lonHem = lonNum >= 0 ? 'E' : 'W';

  const latStr = `${String(latDeg).padStart(2, '0')}° ${String(latMin).padStart(2, '0')}' ${latHem}`;
  const lonStr = `${String(lonDeg).padStart(2, '0')}° ${String(lonMin).padStart(2, '0')}' ${lonHem}`;

  return `${latStr} / ${lonStr}`;
}

export interface NominatimPlace {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state_district?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

export function formatPlaceTitle(item: NominatimPlace): { mainName: string; subtitle: string } {
  const addr = item.address || {};
  const main = addr.city || addr.town || addr.village || addr.municipality || addr.county || item.display_name.split(',')[0].trim();
  
  const subParts = [
    addr.state_district && addr.state_district !== main ? addr.state_district : null,
    addr.state,
    addr.country
  ].filter(Boolean);

  const subtitle = subParts.length > 0 ? subParts.join(', ') : item.display_name;

  return { mainName: main, subtitle };
}
