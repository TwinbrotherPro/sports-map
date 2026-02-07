import { useEffect, useState } from 'react';
import { GeoJSON, useMap } from 'react-leaflet';
import { PathOptions } from 'leaflet';
import { Activity } from '../model/ActivityModel';
import { useCountriesData } from '../hooks/useCountriesData';
import { useVisitedCountries } from '../hooks/useVisitedCountries';

interface CountryHighlightsProps {
  activities: Activity[];
  maxZoomLevel?: number;
}

/**
 * CountryHighlights component displays country/territory borders on the map,
 * highlighting territories where activities have been tracked.
 *
 * Features:
 * - Loads medium-resolution (~50m) map subunits GeoJSON data
 * - Treats overseas territories separately (e.g., French Guiana separate from France)
 * - Highlights visited territories with Strava orange fill and border
 * - Only visible at zoom levels <= maxZoomLevel (default: 5)
 * - Renders below activity polylines and markers for proper layering
 *
 * @param activities - Array of Strava activities
 * @param maxZoomLevel - Maximum zoom level to show highlights (default: 5)
 */
export function CountryHighlights({
  activities,
  maxZoomLevel = 5,
}: CountryHighlightsProps) {
  const map = useMap();
  const countriesData = useCountriesData(); // Use shared hook
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());
  const visitedCountries = useVisitedCountries(activities, countriesData);

  // Track zoom level changes
  useEffect(() => {
    const handleZoom = () => {
      setCurrentZoom(map.getZoom());
    };

    // Listen to zoomend event (not zoom) to avoid flickering during animation
    map.on('zoomend', handleZoom);

    // Cleanup listener on unmount
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map]);

  // Don't render if:
  // 1. Country data hasn't loaded yet
  // 2. Zoom level is too high (too zoomed in)
  if (!countriesData || currentZoom > maxZoomLevel) {
    return null;
  }

  // Style function for territory features
  const styleFeature = (feature: any): PathOptions => {
    const subunitCode = feature.properties?.SU_A3;
    const isVisited = subunitCode && visitedCountries.has(subunitCode);

    return {
      fillColor: isVisited ? '#FC4C02' : 'transparent', // Strava orange or invisible
      fillOpacity: isVisited ? 0.15 : 0, // Light transparency for visited
      color: '#FC4C02', // Border color (Strava orange)
      weight: isVisited ? 2 : 0, // 2px border for visited, no border otherwise
      opacity: isVisited ? 0.6 : 0, // 60% opacity for visible borders
    };
  };

  return (
    <GeoJSON
      data={countriesData}
      style={styleFeature}
      // Use tilePane to render above base tiles but below activity overlays
      // Leaflet pane z-index order: tilePane (200) < overlayPane (400) < markerPane (600)
      pane="tilePane"
    />
  );
}
