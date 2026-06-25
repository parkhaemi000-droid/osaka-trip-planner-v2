import React, { useEffect, useState, useRef } from 'react';
import { loadGoogleMaps } from '../lib/google-maps-loader';
import { Search, MapPin, Loader2, X } from 'lucide-react';

interface PlaceAutocompleteProps {
  onSelectPlace: (place: { name: string; lat: number; lng: number }) => void;
  placeholder?: string;
}

export default function PlaceAutocomplete({ onSelectPlace, placeholder = '오사카 맛집, 호텔, 역 이름으로 찾기...' }: PlaceAutocompleteProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<google.maps.places.AutocompletePrediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Google Maps SDK
  useEffect(() => {
    loadGoogleMaps()
      .then(() => {
        setIsLoaded(true);
        // Initialize services
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();
      })
      .catch((err) => {
        console.error('Failed to load Google Maps for AutoComplete:', err);
      });
  }, []);

  // Fetch predictions on query change
  useEffect(() => {
    if (!isLoaded || !autocompleteServiceRef.current || query.trim().length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);

    const timeoutId = setTimeout(() => {
      // Set bounds biased to Osaka Area (Umeda, Namba, etc.)
      const osakaBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(34.55, 135.35), // Southwest Osaka
        new google.maps.LatLng(34.80, 135.65)  // Northeast Osaka
      );

      autocompleteServiceRef.current?.getPlacePredictions(
        {
          input: query,
          sessionToken: sessionTokenRef.current || undefined,
          bounds: osakaBounds,
          componentRestrictions: { country: 'jp' }, // Restrict search to Japan
        },
        (results, status) => {
          setIsSearching(false);
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            setPredictions(results);
            setIsOpen(true);
          } else {
            setPredictions([]);
            setIsOpen(false);
          }
        }
      );
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, isLoaded]);

  // Handle outside Click to close suggestion container
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Retrieve Place Details when prediction selected
  const handleSelectPrediction = (prediction: google.maps.places.AutocompletePrediction) => {
    setQuery(prediction.structured_formatting.main_text);
    setIsOpen(false);
    setIsSearching(true);

    // Call PlacesService to fetch coordinate details for chosen spot
    const dummyDiv = document.createElement('div');
    const placesService = new google.maps.places.PlacesService(dummyDiv);

    placesService.getDetails(
      {
        placeId: prediction.place_id,
        fields: ['name', 'geometry', 'formatted_address'],
        sessionToken: sessionTokenRef.current || undefined,
      },
      (place, status) => {
        setIsSearching(false);
        // Refresh token for next session
        sessionTokenRef.current = new google.maps.places.AutocompleteSessionToken();

        if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          onSelectPlace({
            name: place.name || prediction.structured_formatting.main_text,
            lat,
            lng,
          });
        } else {
          console.error('Error fetching details for place:', prediction.description, status);
        }
      }
    );
  };

  const handleClear = () => {
    setQuery('');
    setPredictions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full z-40">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
          ) : (
            <Search className="h-4 w-4 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (predictions.length > 0) setIsOpen(true);
          }}
          disabled={!isLoaded}
          placeholder={isLoaded ? placeholder : '지도 및 장소 검색 기능 가동 중...'}
          className="w-full pl-9 pr-8 py-2 md:py-2.5 text-xs md:text-sm text-gray-900 border border-gray-150/90 rounded-xl bg-gray-50/50 hover:bg-white hover:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && predictions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto z-50 divide-y divide-gray-50">
          {predictions.map((p) => (
            <button
              key={p.place_id}
              onClick={() => handleSelectPrediction(p)}
              className="w-full text-left px-4 py-2.5 hover:bg-orange-50/50 flex gap-3 items-start transition cursor-pointer text-xs"
            >
              <MapPin className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900 leading-snug">
                  {p.structured_formatting.main_text}
                </p>
                <p className="text-[10px] text-gray-400 leading-normal truncate mt-0.5">
                  {p.structured_formatting.secondary_text}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
