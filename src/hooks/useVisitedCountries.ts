import { useMemo } from "react";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import { Activity } from "../model/ActivityModel";

/**
 * Custom hook to detect which countries/territories have been visited based on activity start points.
 *
 * Uses an optimized territory-first loop approach:
 * - Iterates through each territory/subunit in the GeoJSON data
 * - For each territory, checks if ANY activity start point falls within its borders
 * - Early exits once a match is found for that territory
 * - Treats overseas territories separately (e.g., French Guiana is separate from France)
 *
 * @param activities - Array of Strava activities with start_latlng coordinates
 * @param countriesData - GeoJSON FeatureCollection of country/territory boundaries
 * @returns Set of SU_A3 subunit codes where activities have started
 */
export function useVisitedCountries(
  activities: Activity[],
  countriesData: GeoJSON.FeatureCollection | null
): Set<string> {
  return useMemo(() => {
    // Return empty set if data isn't ready
    if (!countriesData || !activities || activities.length === 0) {
      return new Set<string>();
    }

    const visited = new Set<string>();

    // Optimization: Loop through territories/subunits first (outer loop)
    // This allows us to break as soon as we find ANY activity in that territory
    for (const feature of countriesData.features) {
      // Extract subunit code from properties (SU_A3 is the unique identifier for subunits)
      const subunitCode = feature.properties?.SU_A3;

      if (!subunitCode) {
        continue; // Skip features without subunit codes
      }

      // Check if any activity starts in this territory
      for (const activity of activities) {
        // Validate start_latlng exists and is a valid array
        if (!activity.start_latlng || !Array.isArray(activity.start_latlng)) {
          continue;
        }

        const [lat, lng] = activity.start_latlng;

        // Skip invalid coordinates
        if (
          lat == null ||
          lng == null ||
          isNaN(Number(lat)) ||
          isNaN(Number(lng))
        ) {
          continue;
        }

        try {
          // Create a GeoJSON point (note: GeoJSON uses [lng, lat] order, not [lat, lng])
          const pt = point([Number(lng), Number(lat)]);

          // Check if this point is within the territory's geometry
          if (booleanPointInPolygon(pt, feature as any)) {
            visited.add(subunitCode);
            break; // Found a match, move to next territory (early exit optimization)
          }
        } catch (error) {
          console.log("Error in point-in-polygon", error);
          continue;
        }
      }
    }

    return visited;
  }, [activities, countriesData]);
}
