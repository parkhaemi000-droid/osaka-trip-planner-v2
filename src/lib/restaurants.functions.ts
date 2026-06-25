import { Restaurant } from './restaurants';

function getMapsApiKey(): string {
  return process.env.GOOGLE_MAPS_PLATFORM_KEY || process.env.ROUTES_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
}

function isPlaceholderKey(key: string): boolean {
  if (!key) return true;
  const k = key.trim();
  return (
    k === 'YOUR_API_KEY' ||
    k === 'MY_GEMINI_API_KEY' ||
    k === 'MY_GOOGLE_MAPS_PLATFORM_KEY' ||
    k === 'YOUR_GOOGLE_MAPS_API_KEY' ||
    k.includes('PLACEHOLDER') ||
    k.includes('아직_없으면') ||
    k.length <= 20
  );
}

const FAMOUS_MOCK_RESTAURANTS: Restaurant[] = [
  {
    id: 'achichi_honppo',
    name: '아치치혼포 도톤보리 본점',
    nameJa: 'あちち本舗 道頓堀店',
    rating: 4.2,
    userRatingCount: 2845,
    formattedAddress: '7-19 Souemoncho, Chuo Ward, Osaka, 542-0084',
    location: { lat: 34.6692, lng: 135.5019 },
    websiteUri: 'http://www/achichi.com',
    nationalPhoneNumber: '06-7890-1234',
    priceLevel: 'PRICE_LEVEL_INEXPENSIVE',
    editorialSummary: '도톤보리 강변에 위치한 대인기 야외 리버사이드 타코야끼 전문점. 특유의 달짝지근한 소스와 파 토핑이 환상적인 조화를 이룹니다.',
    types: ['restaurant', 'food'],
    openNow: true,
    weekdayDescriptions: ['월요일 - 일요일: 오전 10:00 ~ 오전 2:00'],
    cuisineType: '타코야끼/길거리음식'
  },
  {
    id: 'ichiran_dotonbori',
    name: '이치란 라면 도톤보리 본관',
    nameJa: '一蘭 道頓堀店本館',
    rating: 4.3,
    userRatingCount: 8934,
    formattedAddress: '7-17 Souemoncho, Chuo Ward, Osaka, 542-0084',
    location: { lat: 34.6691, lng: 135.5017 },
    websiteUri: 'https://ichiran.com',
    nationalPhoneNumber: '06-6212-1801',
    priceLevel: 'PRICE_LEVEL_MODERATE',
    editorialSummary: '자신만의 레시피 용지에 맛, 기름진 정도, 면의 부드러움, 비법 소스 양을 직접 코스마이징하여 칸막이 독서실 책상에서 맛보는 유명 돈코츠 라멘 전문점.',
    types: ['restaurant', 'ramen_restaurant'],
    openNow: true,
    weekdayDescriptions: ['월요일 - 일요일: 24시간 영업'],
    cuisineType: '일본식 돈코츠 라멘'
  },
  {
    id: 'harukoma_sushi',
    name: '하루코마 스시 본점',
    nameJa: '春駒 本店',
    rating: 4.5,
    userRatingCount: 3980,
    formattedAddress: '5-5-2 Tenjinbashi, Kita Ward, Osaka, 530-0041',
    location: { lat: 34.7067, lng: 135.5135 },
    priceLevel: 'PRICE_LEVEL_MODERATE',
    editorialSummary: '텐진바시스지 상점가에 위치하여 엄청난 두께와 훌륭한 신선도로 유명한 전설적인 가성비 초밥 강자입니다.',
    types: ['restaurant', 'sushi_restaurant'],
    openNow: false,
    weekdayDescriptions: ['월요일 - 일요일: 오전 11:00 ~ 오후 9:30 (화요일 휴무)'],
    cuisineType: '스시/초밥 전문점'
  },
  {
    id: 'kushikatsu_daruma',
    name: '쿠시카츠 다루마 신세카이 총본점',
    nameJa: '元祖串かつ だる마 新世界총본점',
    rating: 4.4,
    userRatingCount: 2210,
    formattedAddress: '2-3-9 Ebisuhigashi, Naniwa Ward, Osaka, 556-0002',
    location: { lat: 34.6521, lng: 135.5065 },
    websiteUri: 'http://www.kushikatu-daruma.com',
    priceLevel: 'PRICE_LEVEL_INEXPENSIVE',
    editorialSummary: '화가 난 험악한 표정의 전형적인 창업주 인형이 환영하는 바삭바삭하고 고소한 소스 한 번만 찍어먹는 오사카식 정통 모둠 꼬치 튀김 전문점.',
    types: ['restaurant', 'food'],
    openNow: true,
    weekdayDescriptions: ['월요일 - 일요일: 오전 11:00 ~ 오후 10:30'],
    cuisineType: '쿠시카츠/꼬치구이'
  },
  {
    id: 'kiji_okonomiyaki',
    name: '오코노미야키 키지 우메다 스카이빌딩점',
    nameJa: 'お好み焼き きじ',
    rating: 4.6,
    userRatingCount: 1980,
    formattedAddress: '1-1-90 Oyodonaka, Kita Ward, Osaka, 531-0076 (우메다 스카이빌딩 지하 1층)',
    location: { lat: 34.7052, lng: 135.4901 },
    priceLevel: 'PRICE_LEVEL_MODERATE',
    editorialSummary: '우메다의 오래된 쇼와 복고풍 거리 식당가에 위치하여, 달콤하고 짭짤한 특유 테판 소스로 볶은 소바와 야채 반죽의 절정 오코노미야키 명가입니다.',
    types: ['restaurant', 'food'],
    openNow: true,
    cuisineType: '오코노미야키/야키소바'
  },
  {
    id: 'gyukatsu_motomura',
    name: '규카츠 모토무라 난바점',
    nameJa: '牛かつもと村 難波店',
    rating: 4.8,
    userRatingCount: 6512,
    formattedAddress: '3-131 Nanbanaka, Chuo Ward, Osaka, 542-0076',
    location: { lat: 34.6651, lng: 135.5011 },
    websiteUri: 'https://www.gyukatsu-motomura.com',
    priceLevel: 'PRICE_LEVEL_MODERATE',
    editorialSummary: '바삭한 빵가루를 입혀 겉만 살짝 튀겨낸 소고기 등심을 각자 테이블의 다채로운 미니 개인 화로 돌판에 미디엄 레어로 직접 따뜻하게 구워먹는 극락의 규카츠.',
    types: ['restaurant', 'steak_house'],
    openNow: true,
    cuisineType: '규카츠/소고기 커틀릿'
  },
  {
    id: 'kani_doraku_dotonbori',
    name: '카니도라쿠 도톤보리 본점',
    nameJa: 'かに道楽 道頓堀本店',
    rating: 4.4,
    userRatingCount: 5120,
    formattedAddress: '1-6-18 Dotonbori, Chuo Ward, Osaka, 542-0071',
    location: { lat: 34.6687, lng: 135.5013 },
    websiteUri: 'https://douraku.co.jp',
    priceLevel: 'PRICE_LEVEL_EXPENSIVE',
    editorialSummary: '도톤보리의 상징적인 거대 움직이는 게 간판으로 유명한 오사카 최고의 대게 요리 코스 전문점. 신선한 게회부터 구이, 찜, 솥밥까지 선사합니다.',
    types: ['restaurant', 'food'],
    openNow: true,
    cuisineType: '대게 코스 요리/해산물'
  },
  {
    id: 'hanatako_umeda',
    name: '하나타코 우메다 한큐삼번가',
    nameJa: 'はなだこ',
    rating: 4.4,
    userRatingCount: 3845,
    formattedAddress: '9-26 Kakudacho, Kita Ward, Osaka, 530-0017 (우메다 한큐역 인근)',
    location: { lat: 34.7029, lng: 135.4984 },
    priceLevel: 'PRICE_LEVEL_INEXPENSIVE',
    editorialSummary: '우메다역의 타코야끼 초인기 맛집. 싱싱하고 아삭한 쪽파를 산더미처럼 가득 얹어 마요네즈와 곁들여 먹는 시그니처 네기마요 타코야끼가 유명합니다.',
    types: ['restaurant', 'food'],
    openNow: true,
    cuisineType: '네기마요 타코야끼'
  },
  {
    id: 'honmiyake_umeda',
    name: '혼미야케 우메다 한큐삼번가점',
    nameJa: '本みやけ 阪急三番街店',
    rating: 4.5,
    userRatingCount: 1540,
    formattedAddress: '1-1-3 Shibata, Kita Ward, Osaka, 530-0012 (한큐삼번가 지하 2층)',
    location: { lat: 34.7042, lng: 135.4980 },
    priceLevel: 'PRICE_LEVEL_MODERATE',
    editorialSummary: '한큐 삼번가에 위치한 전설적인 스테이크 덮밥(스테키동) 전문점. 부드럽고 도톰한 소고기 스테이크에 특제 타레 소스가 입혀진 가성비 극상의 맛집.',
    types: ['restaurant', 'food'],
    openNow: true,
    cuisineType: '스테이크 덮밥/규동'
  },
  {
    id: 'mizuno_okonomiyaki',
    name: '미즈노 오코노미야키 도톤보리',
    nameJa: '美津の',
    rating: 4.3,
    userRatingCount: 3410,
    formattedAddress: '1-4-15 Dotonbori, Chuo Ward, Osaka, 542-0071',
    location: { lat: 34.6685, lng: 135.5020 },
    priceLevel: 'PRICE_LEVEL_MODERATE',
    editorialSummary: '미슐랭 가이드에 등재된 오랜 역사의 도톤보리 오코노미야키 전문점. 밀가루를 쓰지 않고 100% 마 반죽만을 사용하여 부드럽게 녹아내리는 산마야키가 시그니처입니다.',
    types: ['restaurant', 'food'],
    openNow: true,
    cuisineType: '미슐랭 오코노미야키'
  },
  {
    id: 'rikuro_cheese_namba',
    name: '리쿠로 오지산의 가게 난바 본점',
    nameJa: 'りくろーおじさんの店 難波本店',
    rating: 4.5,
    userRatingCount: 7820,
    formattedAddress: '3-2-15 Namba, Chuo Ward, Osaka, 542-0076',
    location: { lat: 34.6663, lng: 135.5015 },
    priceLevel: 'PRICE_LEVEL_INEXPENSIVE',
    editorialSummary: '갓 구워져 나올 때 흔들면 탱글탱글하게 흔들리는 오사카 대표 수플레 치즈케이크 명가. 은은한 단맛과 건포도의 어우러짐이 환상적입니다.',
    types: ['bakery', 'cafe', 'food'],
    openNow: true,
    cuisineType: '수플레 치즈케이크/디저트'
  }
];

function inferCuisineType(types: string[]): string {
  if (types.includes('sushi_restaurant')) return '스시/초밥';
  if (types.includes('ramen_restaurant')) return '라멘/우동';
  if (types.includes('steak_house') || types.includes('barbecue_restaurant')) return '고기/야키니쿠/규카츠';
  if (types.includes('cafe') || types.includes('bakery')) return '카페/디저트';
  if (types.includes('bar') || types.includes('pub')) return '이자카야/주점';
  if (types.includes('fast_food_restaurant')) return '패스트푸드';
  return '일식 요리';
}

function normalizePlace(place: any): Restaurant {
  return {
    id: place.id || Math.random().toString(),
    name: place.displayName?.text || '기록된 이름 없음',
    formattedAddress: place.formattedAddress || '',
    location: {
      lat: place.location?.latitude || 34.675,
      lng: place.location?.longitude || 135.495
    },
    rating: place.rating,
    userRatingCount: place.userRatingCount,
    websiteUri: place.websiteUri,
    nationalPhoneNumber: place.nationalPhoneNumber,
    priceLevel: place.priceLevel,
    editorialSummary: place.editorialSummary?.text,
    types: place.types || [],
    openNow: place.regularOpeningHours?.openNow,
    weekdayDescriptions: place.regularOpeningHours?.weekdayDescriptions || [],
    cuisineType: inferCuisineType(place.types || [])
  };
}

/**
 * Perform Search Text call to Google Places API (New)
 */
export async function fetchFromGooglePlaces(query: string, location?: { lat: number; lng: number }): Promise<Restaurant[]> {
  const apiKey = getMapsApiKey();
  if (isPlaceholderKey(apiKey)) {
    console.warn('[Places API] GOOGLE_MAPS_PLATFORM_KEY is missing or invalid. Defaulting to local famous gourmet selection.');
    return filterMockRestaurants(query);
  }

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        // FieldMask enables the specific fields to avoid extra billing and capture all required properties
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.editorialSummary,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours'
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'ko',
        locationBias: location ? {
          circle: {
            center: { latitude: location.lat, longitude: location.lng },
            radius: 5000.0
          }
        } : {
          circle: {
            center: { latitude: 34.675, longitude: 135.495 }, // Central Osaka
            radius: 10000.0
          }
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Places API] Failed api request:', errText);
      return filterMockRestaurants(query);
    }

    const data = await response.json();
    if (!data.places || data.places.length === 0) {
      return [];
    }

    return data.places.map((p: any) => normalizePlace(p));
  } catch (error) {
    console.error('[Places API Error]:', error);
    return filterMockRestaurants(query);
  }
}

/**
 * Perform Search Nearby call to Google Places API (New)
 */
export async function fetchNearbyFromGooglePlaces(lat: number, lng: number, radius = 1000): Promise<Restaurant[]> {
  const apiKey = getMapsApiKey();
  if (isPlaceholderKey(apiKey)) {
    return FAM_MOCK_NEARBY(lat, lng);
  }

  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.priceLevel,places.types,places.editorialSummary,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours'
      },
      body: JSON.stringify({
        includedTypes: ['restaurant', 'cafe', 'bar', 'food'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: { latitude: lat, longitude: lng },
            radius: Number(radius)
          }
        },
        languageCode: 'ko'
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[Places API Nearby] Failed api request:', errText);
      return FAM_MOCK_NEARBY(lat, lng);
    }

    const data = await response.json();
    if (!data.places || data.places.length === 0) {
      return [];
    }

    return data.places.map((p: any) => normalizePlace(p));
  } catch (error) {
    console.error('[Places API Nearby Error]:', error);
    return FAM_MOCK_NEARBY(lat, lng);
  }
}

/**
 * Perform Geocoding call using Google Geocoding API
 */
export async function geocodeAddressWithGoogle(address: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = getMapsApiKey();
  if (isPlaceholderKey(apiKey)) {
    // If mocking, return approximate coords based on popular strings
    const lower = address.toLowerCase();
    if (lower.includes('난바') || lower.includes('namba')) return { lat: 34.6651, lng: 135.5011 };
    if (lower.includes('우메다') || lower.includes('umeda')) return { lat: 34.7024, lng: 135.4959 };
    if (lower.includes('도톤보리') || lower.includes('dotonbori')) return { lat: 34.6691, lng: 135.5017 };
    if (lower.includes('오사카성') || lower.includes('osaka castle')) return { lat: 34.6873, lng: 135.5262 };
    return { lat: 34.675, lng: 135.495 }; // Default central Osaka
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=ko`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
      const loc = data.results[0].geometry.location;
      return { lat: loc.lat, lng: loc.lng };
    }
    return null;
  } catch (error) {
    console.error('[Geocoding API Error]:', error);
    return null;
  }
}

// Helpers for smart mocking based on filters or spatial sorting
function filterMockRestaurants(query: string): Restaurant[] {
  const q = query.toLowerCase();
  if (!q || q === 'osaka restaurants' || q === '오사카 맛집' || q.trim() === '') {
    return FAMOUS_MOCK_RESTAURANTS;
  }
  return FAMOUS_MOCK_RESTAURANTS.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.cuisineType?.toLowerCase().includes(q) ||
      r.editorialSummary?.toLowerCase().includes(q)
  );
}

function FAM_MOCK_NEARBY(lat: number, lng: number): Restaurant[] {
  // Sort mock restaurants by simple Euclidean distance to selected point
  return [...FAMOUS_MOCK_RESTAURANTS].sort((a, b) => {
    const distA = Math.pow(a.location.lat - lat, 2) + Math.pow(a.location.lng - lng, 2);
    const distB = Math.pow(b.location.lat - lat, 2) + Math.pow(b.location.lng - lng, 2);
    return distA - distB;
  });
}
