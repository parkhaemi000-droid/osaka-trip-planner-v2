export interface Restaurant {
  id: string;
  name: string;
  nameJa?: string;
  rating?: number;
  userRatingCount?: number;
  formattedAddress?: string;
  location: {
    lat: number;
    lng: number;
  };
  websiteUri?: string;
  nationalPhoneNumber?: string;
  priceLevel?: string; // e.g. "PRICE_LEVEL_INEXPENSIVE", "PRICE_LEVEL_MODERATE"
  editorialSummary?: string;
  types?: string[];
  photoUrls?: string[];
  openNow?: boolean;
  weekdayDescriptions?: string[];
  cuisineType?: string; // Cleaned Korean description (e.g., "라멘", "스시")
}
