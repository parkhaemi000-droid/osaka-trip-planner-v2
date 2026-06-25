import { Restaurant } from './restaurants';

/**
 * Searches restaurants in Osaka or nearby using the backend proxy which calls the Google Places API (New).
 */
export async function searchRestaurantsOnServer(query: string, location?: { lat: number; lng: number }): Promise<Restaurant[]> {
  try {
    const response = await fetch('/api/restaurants/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, location })
    });
    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }
    const data = await response.json();
    return data.restaurants || [];
  } catch (error) {
    console.error('Failed to search restaurants on server:', error);
    return [];
  }
}

/**
 * Searches nearby restaurants around given coordinates using the backend proxy.
 */
export async function searchNearbyRestaurantsOnServer(lat: number, lng: number, radius = 1000): Promise<Restaurant[]> {
  try {
    const response = await fetch('/api/restaurants/nearby', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, radius })
    });
    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }
    const data = await response.json();
    return data.restaurants || [];
  } catch (error) {
    console.error('Failed to search nearby restaurants on server:', error);
    return [];
  }
}

/**
 * Geocodes an address or name into latitude and longitude coordinates.
 */
export async function geocodeAddressOnServer(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const response = await fetch(`/api/google-maps/geocode?address=${encodeURIComponent(address)}`);
    if (!response.ok) {
      throw new Error(`Server returned status: ${response.status}`);
    }
    const data = await response.json();
    return data.location || null;
  } catch (error) {
    console.error('Failed to geocode address on server:', error);
    return null;
  }
}
