import { useState, useEffect } from "react";

/**
 * Hook to load country/territory GeoJSON data from public directory.
 *
 * Loads the countries-subunits-50m.geojson file which contains 293 subunits
 * (territories and countries, with overseas territories separated).
 *
 * @returns GeoJSON FeatureCollection or null if not loaded yet
 */
export function useCountriesData(): GeoJSON.FeatureCollection | null {
  const [countriesData, setCountriesData] =
    useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/data/countries-subunits-50m.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => setCountriesData(data))
      .catch((error) => {
        console.error("Failed to load countries data:", error);
      });
  }, []);

  return countriesData;
}
