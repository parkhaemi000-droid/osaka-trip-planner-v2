export interface Leg {
  lineName: string;
  lineColor: string;
  vehicleType: string; // 'SUBWAY' | 'TRAIN' | 'BUS' | 'WALK'
  fromStation: string;
  toStation: string;
  departTime?: string;
  arriveTime?: string;
  stopCount?: number;
  isWalking: boolean;
  instructions?: string;
  durationText: string;
}

export interface RouteSummary {
  totalDuration: string; // e.g. "23분"
  totalDurationSeconds: number;
  totalFare: string; // e.g. "¥240"
  totalFareValue: number;
  transferCount: number;
  legs: Leg[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
  name: string;
}

// Predefined landmark coordinates in Osaka for Transit routing
export const TRANSIT_PLACES: Coordinates[] = [
  { name: '도톤보리 / 글리코상', latitude: 34.6690, longitude: 135.5013 },
  { name: '오사카성 천수각', latitude: 34.6873, longitude: 135.5262 },
  { name: '유니버설 스튜디오 재팬 (USJ)', latitude: 34.6654, longitude: 135.4323 },
  { name: '신세카이 & 츠텐카쿠', latitude: 34.6525, longitude: 135.5063 },
  { name: '우메다 스카이 빌딩 공중정원', latitude: 34.7053, longitude: 135.4902 },
  { name: '신사이바시 쇼핑가', latitude: 34.6720, longitude: 135.5014 },
  { name: '간사이 국제공항 (KIX)', latitude: 34.4320, longitude: 135.2300 },
  { name: '난바역', latitude: 34.6625, longitude: 135.5022 },
  { name: '오사카역 (우메다)', latitude: 34.7024, longitude: 135.4959 },
  { name: '텐노지 아베노 하루카스', latitude: 34.6469, longitude: 135.5132 },
  { name: '닛폰바시 덴덴타운', latitude: 34.6598, longitude: 135.5057 }
];

export async function computeTransitRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  options: { routingPreference?: 'LESS_WALKING' | 'FEWER_TRANSFERS'; languageCode?: string } = {}
): Promise<RouteSummary[]> {
  try {
    const response = await fetch('/api/routes/transit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        origin,
        destination,
        transitPreferences: {
          routingPreference: options.routingPreference || 'LESS_WALKING'
        },
        languageCode: options.languageCode || 'ko'
      })
    });

    if (!response.ok) {
      throw new Error(`Server returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const routes = data.routes || [];

    return routes.map((route: any) => {
      const leg = route.legs?.[0];
      const durationStr = leg?.duration || '0s';
      const durationSeconds = parseInt(durationStr.replace('s', ''), 10) || 0;
      const durationMinutes = Math.ceil(durationSeconds / 60);

      const fareObj = route.travelAdvisory?.transitFare;
      const fareUnits = fareObj ? parseInt(fareObj.units, 10) : 0;

      const steps = leg?.steps || [];
      let transitRidesCount = 0;
      const legsList: Leg[] = [];

      steps.forEach((step: any) => {
        const isWalking = step.travelMode === 'WALK';
        const stepDurationSec = parseInt((step.duration || '0s').replace('s', ''), 10) || 0;
        const stepDurationMinutes = Math.ceil(stepDurationSec / 60);
        const stepDurationText = `${stepDurationMinutes}분`;

        if (isWalking) {
          legsList.push({
            lineName: '도보',
            lineColor: '#94A3B8', // slate-400
            vehicleType: 'WALK',
            fromStation: '',
            toStation: '',
            isWalking: true,
            instructions: step.navigationInstruction?.instructions || '도보 이동',
            durationText: stepDurationText
          });
        } else {
          const details = step.transitDetails;
          if (details) {
            transitRidesCount++;
            const transitLine = details.transitLine || {};
            legsList.push({
              lineName: transitLine.name || '지하철',
              lineColor: transitLine.color || '#E51C23',
              vehicleType: transitLine.vehicle?.type || 'SUBWAY',
              fromStation: details.stopDetails?.departureStop?.name || '출발역',
              toStation: details.stopDetails?.arrivalStop?.name || '도착역',
              departTime: details.localizedValues?.departureTime?.text || '',
              arriveTime: details.localizedValues?.arrivalTime?.text || '',
              stopCount: details.stopCount || 0,
              isWalking: false,
              durationText: stepDurationText
            });
          }
        }
      });

      // Filter out redundant short walks or group consecutive walks for cleaner presentation if needed
      // Transfer count is number of boarding times - 1
      const transferCount = transitRidesCount > 0 ? transitRidesCount - 1 : 0;

      return {
        totalDuration: `${durationMinutes}분`,
        totalDurationSeconds: durationSeconds,
        totalFare: fareUnits > 0 ? `¥${fareUnits.toLocaleString()}` : '¥240', // default fallback for clarity
        totalFareValue: fareUnits || 240,
        transferCount,
        legs: legsList
      };
    });
  } catch (err) {
    console.error('Failed to compute transit route:', err);
    throw err;
  }
}
