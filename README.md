# 🚇 오사카 여행 가이드: Google Routes API (Transit) 연동 안내

이 저장소는 오사카 여행자들을 위한 스마트 지하철/전철 최적 환승 안내 시스템을 포함하고 있습니다. Google Routes API v2의 Transit 모드를 사용하여 출발지부터 목적지까지의 상세 실시간 경로, 요금, 소요시간 및 환승 횟수를 완벽히 계산합니다.

---

## 🌟 주요 구현 기능

1. **보안 지향 서버 프록시 (`/api/routes/transit`)**
   - 클라이언트 측에서 직접 API Key를 호출하지 않아 **인증키 노출 위협을 완벽히 방지**합니다.
   - 백엔드(Express)에서 `GOOGLE_MAPS_PLATFORM_KEY` 헤더를 맵핑하여 안전하게 프록시 요청을 전송합니다.

2. **비용 효율화를 위한 인메모리 캐싱**
   - 서버 측에 인메모리 캐시(`Map`)를 구현하여 동일한 `출발지 + 목적지 + 선호도` 조합 요청은 **15분간 캐시**하여 중복 결제를 차단하고 API 호출 비용을 극적으로 최소화합니다.

3. **고해상도 백업 시뮬레이터 (High-Fidelity Mock Router)**
   - API Key가 미설정 상태이거나 구글 클라우드 할당량 초과(Quota Error), 오프라인 환경인 경우에도 실제 오사카의 핵심 지하철 노선(미도스지선, 다니마치선, 주오선, 사카이스지선, JR선) 환승 지도를 100% 추종하는 **실제 시뮬레이션 경로를 반환**하여 무중단 서비스를 제공합니다.

4. **실시간 현재 위치 연동 (GPS)**
   - 브라우저의 Geolocation API를 사용하여 이프레임 내에서도 현재 좌표를 획득, 실시간 출발지로 지정해 경로를 탐색하는 유동적인 사용성을 선사합니다.

---

## 🛠️ API 키 설정 방법

애플리케이션이 실시간 Google Routes API를 직접 수신하기 위해서는 다음 환경변수를 제공해야 합니다.

1. **AI Studio 플랫폼 이용 시**:
   - 우측 상단 혹은 사이드바 **Settings > API Keys / Secrets**에 접속합니다.
   - 키 이름을 `GOOGLE_MAPS_PLATFORM_KEY`로 만들고 Google Cloud Console에서 발급받은 Routes API 및 Maps API 사용 가능한 API Key를 값으로 넣습니다.

2. **로컬 개발 환경 (`.env`)**:
   - 프로젝트 루트의 `.env` 파일에 아래와 같이 추가합니다:
     ```env
     GOOGLE_MAPS_PLATFORM_KEY=AIzaSyYourRealGoogleCloudPlatformApiKeyHere
     ```

---

## 🛰️ API 연동 및 데이터 모델

### 1. 요청 Payload 구성 (클라이언트 → 서버)

```json
POST /api/routes/transit
{
  "origin": {
    "latitude": 34.6690,
    "longitude": 135.5013
  },
  "destination": {
    "latitude": 34.6873,
    "longitude": 135.5262
  },
  "transitPreferences": {
    "routingPreference": "LESS_WALKING" // "LESS_WALKING" 또는 "FEWER_TRANSFERS"
  },
  "languageCode": "ko"
}
```

### 2. 응답 데이터 변환 모델 (Data Parsing Layer)

구글의 원시 응답을 받아 가독성이 우수한 클라이언트용 데이터 인터페이스(`RouteSummary`)로 정제하여 UI를 간편하게 렌더링합니다:

```typescript
export interface Leg {
  lineName: string;       // 노선명 (예: "미도스지선 (M)", "도보")
  lineColor: string;      // 노선 고유 브랜드 색상 코드 (예: "#E51C23")
  vehicleType: string;    // 교통 기관 종류 (예: "SUBWAY", "TRAIN", "WALK")
  fromStation: string;    // 승차역
  toStation: string;      // 하차역
  departTime?: string;    // 출발 시각
  arriveTime?: string;    // 도착 시각
  stopCount?: number;     // 경유 정차역 개수
  isWalking: boolean;     // 도보 구간 여부
  instructions?: string;  // 도보 안내 설명
  durationText: string;   // 소요시간 (예: "6분")
}

export interface RouteSummary {
  totalDuration: string;  // 전체 소요시간 (예: "23분")
  totalDurationSeconds: number;
  totalFare: string;      // 총 교통 요금 (예: "¥240")
  totalFareValue: number;
  transferCount: number;  // 환승 횟수
  legs: Leg[];            // 상세 이동 세그먼트
}
```

---

## 🎨 UI 가이드 구성요소

- **환승 타임라인**: 세로형 점진 타임라인 선을 주어 환승 거점을 명확하게 구분합니다.
- **노선 브랜드 컬러 동적 맵핑**: 구글 Routes API가 반환하는 실제 노선의 고유 테마 컬러(HEX)를 타임라인 구슬과 배지에 실시간 주입하여 현실과 동기화된 가독성을 보장합니다.
- **가성비 절약 가이드**: 탐색된 경로의 편도 요금을 기준으로 왕복 요금을 자동 계산한 뒤, 오사카 주유패스 혹은 1일 지하철 무제한 패스 가격과 대조하여 어떤 수단을 구매하는 것이 가장 절약되는지 실시간 조언 문구를 제공합니다.
