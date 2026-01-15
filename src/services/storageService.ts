import { SavedLocation } from '../types/geo';

const STORAGE_KEY = 'geoanalyzer_saved_locations';

export const storageService = {
  getLocations: (): SavedLocation[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Error reading storage", e);
      return [];
    }
  },

  saveLocation: (location: SavedLocation): SavedLocation[] => {
    const locations = storageService.getLocations();
    // Check if already exists roughly (by coords) to avoid duplicates or update
    const existingIndex = locations.findIndex(l => 
      Math.abs(l.coords.lat - location.coords.lat) < 0.0001 && 
      Math.abs(l.coords.lon - location.coords.lon) < 0.0001
    );

    let newLocations;
    if (existingIndex >= 0) {
        newLocations = [...locations];
        newLocations[existingIndex] = { ...newLocations[existingIndex], ...location };
    } else {
        newLocations = [location, ...locations];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newLocations));
    return newLocations;
  },

  deleteLocation: (id: string): SavedLocation[] => {
    const locations = storageService.getLocations().filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    return locations;
  },

  updateNote: (id: string, note: string): SavedLocation[] => {
    const locations = storageService.getLocations().map(l => 
      l.id === id ? { ...l, note } : l
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    return locations;
  }
};
