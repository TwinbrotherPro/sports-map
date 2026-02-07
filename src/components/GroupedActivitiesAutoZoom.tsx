import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import * as decoding from 'polyline-encoded';
import { Activity } from '../model/ActivityModel';

interface GroupedActivitiesAutoZoomProps {
  groupedActivityIds: Set<string>;
  activities: Activity[];
}

export function GroupedActivitiesAutoZoom({
  groupedActivityIds,
  activities
}: GroupedActivitiesAutoZoomProps) {
  const map = useMap();

  useEffect(() => {
    if (groupedActivityIds.size === 0) return;

    const groupedActivities = activities.filter(a =>
      groupedActivityIds.has(a.id)
    );

    // Use polyline points for accurate bounds (not just start positions)
    const allPoints = groupedActivities.flatMap(a =>
      a.map?.summary_polyline
        ? decoding.decode(a.map.summary_polyline)
        : []
    );

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.flyToBounds(bounds, {
        animate: true,
        duration: 1,
        padding: [50, 50] // Add padding for better view
      });
    }
  }, [groupedActivityIds, activities, map]);

  return null; // No visual component, just effects
}
