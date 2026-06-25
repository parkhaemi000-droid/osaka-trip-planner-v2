let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise(async (resolve, reject) => {
    // Check if Google Maps is already loaded in global scope
    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      resolve();
      return;
    }

    let apiKey =
      (import.meta as any).env?.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY ||
      (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
      '';

    // If not set statically at build-time or is a placeholder, try fetching from the secure server config API
    const isLocalPlaceholder = !apiKey || apiKey === 'MY_GOOGLE_MAPS_PLATFORM_KEY' || apiKey === 'YOUR_API_KEY' || apiKey.includes('PLACEHOLDER');
    if (isLocalPlaceholder) {
      try {
        const res = await fetch('/api/config/maps-key');
        if (res.ok) {
          const data = await res.json();
          apiKey = data.apiKey || '';
        }
      } catch (err) {
        console.error('Failed to fetch maps API key from server config:', err);
      }
    }

    const isPlaceholder =
      !apiKey ||
      apiKey === 'MY_GOOGLE_MAPS_PLATFORM_KEY' ||
      apiKey === 'YOUR_API_KEY' ||
      apiKey === 'YOUR_GOOGLE_MAPS_API_KEY' ||
      apiKey.includes('PLACEHOLDER') ||
      apiKey.length <= 20;

    if (isPlaceholder) {
      const msg = 'Google Maps API 키가 등록되지 않았거나 올바르지 않은 임시 키 상태입니다. AI Studio 화면 우측 상단의 Settings -> Secrets에서 GOOGLE_MAPS_PLATFORM_KEY 값을 실제 발급받으신 API 키로 입력하고 저장(Save)해 주세요.';
      console.warn(msg);
      reject(new Error(msg));
      loadPromise = null; // allow retrying
      return;
    }

    // Define the global callback function
    (window as any).initGoogleMapsCallback = () => {
      resolve();
    };

    const script = document.createElement('script');
    // Places library is required for place autocompletes and details
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;

    script.onerror = (err) => {
      console.error('Google Maps script load error:', err);
      reject(err);
      loadPromise = null; // reset if failed, so they can try again
    };

    document.head.appendChild(script);
  });

  return loadPromise;
}
