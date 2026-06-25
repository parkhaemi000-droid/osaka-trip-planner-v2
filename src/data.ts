import { Landmark, ChecklistItem } from './types';

export const OSAKA_LANDMARKS: Landmark[] = [
  {
    id: 'dotonbori',
    name: '도톤보리 & 글리코상',
    nameJa: '道頓堀',
    category: 'food',
    description: '오사카의 부엌이자 화려한 네온사인으로 대표되는 상징적인 거리입니다. 강 주변을 따라 줄지어 서 있는 타코야끼, 오코노미야끼 노점과 대형 게 간판, 그리고 전설적인 달리기 선수인 글리코상을 만날 수 있습니다.',
    imageTheme: 'Dotonbori Neon',
    cost: 0,
    duration: '2~3시간',
    nearestStation: '난바역 (도보 5분)',
    rating: 4.8,
    lat: 34.6690,
    lng: 135.5013,
    tips: [
      '신사이바시 교 위에서 글리코상 포즈로 기념 촬영을 해보세요.',
      '오후 6시 이후 네온사인이 하나둘 켜질 때가 가장 아름답습니다.',
      '강변을 달리는 도톤보리 리버 크루즈는 당일 주유패스로 무료 승차가 가능하니 아침에 미리 매표소에서 교환해두세요.'
    ]
  },
  {
    id: 'osaka_castle',
    name: '오사카성 천수각',
    nameJa: '大阪城',
    category: 'sightseeing',
    description: '도요토미 히데요시가 건립한 성이자 오사카의 가장 핵심 역사 랜드마크입니다. 웅장한 해자와 돌벽으로 둘러싸여 있으며, 봄철 벚꽃 and 가을 단풍이 어우러진 비주얼이 예술을 이룹니다.',
    imageTheme: 'Osaka Castle Sakura',
    cost: 600, // Adults 600 JPY
    duration: '1.5~2시간',
    nearestStation: '다니마치욘초메역 / 신오사카비즈니스파크역',
    rating: 4.6,
    lat: 34.6873,
    lng: 135.5262,
    tips: [
      '성 안의 전시회를 보려면 천수각 입장권이 필요하지만, 외곽 공원과 해자 주변은 무료로 거닐 수 있습니다.',
      '천수각 꼭대기 전망대에서는 오사카 시내 전경을 360도로 조망할 수 있습니다.',
      '오사카성 고부자부네 나룻배를 타서 물가에서 성벽을 바라보는 운치를 더해보세요.'
    ]
  },
  {
    id: 'usj',
    name: '유니버설 스튜디오 재팬 (USJ)',
    nameJa: 'ユニバーサル・スタジオ・ジャパン',
    category: 'sightseeing',
    description: '세계 최고의 할리우드 영화 및 닌텐도, 해리포터 테마 모험을 즐길 수 있는 초대형 테마파크입니다. 마리오 카트를 실제 탈 수 있는 닌텐도 월드는 전 세계적인 사랑을 받고 있습니다.',
    imageTheme: 'Universal Studio Japan',
    cost: 8600, // approx base ticket
    duration: '하루 종일',
    nearestStation: '유니버설시티역 (JR선)',
    rating: 4.9,
    lat: 34.6654,
    lng: 135.4323,
    tips: [
      '닌텐도 월드에 들어가려면 공식 앱에서 "정리권(E-확약권)"을 반드시 스캔/발급받거나, 익스프레스 티켓을 사전 구매해야 안전합니다.',
      '오픈런(개장 최소 1시간 전 대기)을 통해 최고 인기 어트랙션의 대기 시간을 절약할 수 있습니다.',
      '대표 스낵인 미니언즈 만두나 칠면조 다리 고기는 아주 인기 있는 먹거리입니다.'
    ]
  },
  {
    id: 'shinsekai',
    name: '신세카이 & 츠텐카쿠',
    nameJa: '新世界',
    category: 'sightseeing',
    description: '1912년 파리와 뉴욕을 모티브로 만들어져 쇼와 시대 특유의 복고풍 감성이 깃든 아련하고 역동적인 하타구치 거리입니다. 오사카의 원조 타워인 츠텐카쿠와 바삭한 쿠시카츠(꼬치튀김)의 성지입니다.',
    imageTheme: 'Shinsekai Golden Tower',
    cost: 900, // Tsutenkaku observation deck
    duration: '1.5~2시간',
    nearestStation: '에비스초역 / 도부쓰엔마에역',
    rating: 4.4,
    lat: 34.6525,
    lng: 135.5063,
    tips: [
      '유명 매장 다루마(Daruma)에서 바삭하고 따뜻한 원조 쿠시카츠를 맛보세요. 소스는 양배추와 함께 찍어 먹는 것이 정석입니다.',
      '츠텐카쿠 타워에서 아래로 내려오는 짜릿한 대형 슬라이더 타워 미끄럼틀(추가 비용 발생)이 최신 핫트렌드입니다.',
      '밤이 찾아오면 화려한 복고풍 복어 간판과 타워의 라이트업이 한데 어우러져 기막힌 복고 사진을 남길 수 있습니다.'
    ]
  },
  {
    id: 'umeda_sky',
    name: '우메다 스카이 빌딩 공중정원',
    nameJa: '梅田スカイビル',
    category: 'sightseeing',
    description: '두 개의 초고층 빌딩이 상공에서 원형 다리로 연결된 오사카 최고의 미래지향적 빌딩이자 전망대입니다. 바닥이 야광으로 조각된 야외 전망 산책로에서는 지상 173m 높이의 로맨틱한 파노라마 밤바람을 느낄 수 있습니다.',
    imageTheme: 'Umeda Sky Building Night',
    cost: 1500,
    duration: '1시간',
    nearestStation: '우메다역 / 오사카역 (도보 9분)',
    rating: 4.7,
    lat: 34.7053,
    lng: 135.4902,
    tips: [
      '투명 전망 에스컬레이터는 우주선에 탑승하는 듯한 기분을 주며 최고의 셀카 스팟 중 하나입니다.',
      '야외 루프탑 공중정원 전망대는 모자가 날아갈 정도로 시원한 바람이 분야 복장에 참고하세요.',
      '오사카 주유패스로는 무료 입장 시간이 한정되어 있는 경우가 있으니 가기 전 반드시 최신 무료 이용 마감 시각을 확인하세요.'
    ]
  },
  {
    id: 'shinsaibashi',
    name: '신사이바시스지 쇼핑가',
    nameJa: '心斎橋筋商店街',
    category: 'shopping',
    description: '수많은 패션 브랜드, 드러그스토어, 다양한 소품샵과 카페가 천장 아케이드 지붕 아래 막힘없이 뻗어 있는 오사카 최대의 전천후 패션 및 백화점 쇼핑 아케이드입니다.',
    imageTheme: 'Shinsaibashi Arcade',
    cost: 0,
    duration: '2~3시간',
    nearestStation: '신사이바시역',
    rating: 4.5,
    lat: 34.6720,
    lng: 135.5014,
    tips: [
      '날씨가 궂거나 비가 와도 지붕형 아케이드라 안심하고 쇼핑에 집중할 수 있습니다.',
      '대부분의 상점에서 5,000엔 이상 구입 시 여권을 제시하면 면세(Tax-Free)를 즉시 받을 수 있으니 꼭 여권을 항상 소지하세요.',
      '대표 소품샵들과 산리오 갤러리점, 다이소, 돈키호테가 줄지어 있어 기념품 대량 구매에 제격입니다.'
    ]
  }
];

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 'c1', task: '여권 (유효기간 유효한지 확인!)', category: 'essential', completed: true },
  { id: 'c2', task: '일본 eSIM 또는 포켓 와이파이 예약 확인', category: 'essential', completed: false },
  { id: 'c3', task: 'Visit Japan Web 등록 및 QR 캡처', category: 'essential', completed: false },
  { id: 'c4', task: '일본 어댑터 (110V 돼지코)', category: 'electronics', completed: false },
  { id: 'c5', task: '엔화(JPY) 환전 혹은 트래블로그 카드 든든하게 충전', category: 'essential', completed: false },
  { id: 'c6', task: '편안한 도보 여행용 러닝화나 가벼운 운동화', category: 'clothing', completed: false },
  { id: 'c7', task: '동전 여분의 작은 미니 지갑이나 코인 동전 지갑', category: 'essential', completed: false },
  { id: 'c8', task: '보조배터리 및 충전용 케이블', category: 'electronics', completed: false },
  { id: 'c9', task: '가벼운 우산 혹은 우의 (기상 대비)', category: 'etc', completed: false }
];
