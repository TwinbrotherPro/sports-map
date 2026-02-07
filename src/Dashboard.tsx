import { styled } from "@mui/material/styles";
import * as leaflet from "leaflet";
import * as decoding from "polyline-encoded";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import convex from "@turf/convex";
import { points } from "@turf/helpers";
import { ActivityOverlay } from "./components/ActivityOverlay";
import { GroupedActivityOverlay } from "./components/GroupedActivityOverlay";
import { LocationCircle } from "./components/LocationCircle";
import { Profile } from "./components/Profile";
import { ControlMenu } from "./components/Control";
import { CountryHighlights } from "./components/CountryHighlights";
import { GroupedActivitiesAutoZoom } from "./components/GroupedActivitiesAutoZoom";
import { Activity } from "./model/ActivityModel";

const PREFIX = "Dashboard";

const classes = {
  parent: `${PREFIX}-parent`,
  marker: `${PREFIX}-marker`,
  control: `${PREFIX}-control`,
  button: `${PREFIX}-button`,
  profile: `${PREFIX}-profile`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")(() => ({
  height: "100%",
  [`& .${classes.parent}`]: {},

  // In use?
  [`& .${classes.marker}`]: { color: "green", textAlign: "left" },
}));

function ActivityMaker({
  activity,
  activityIndex,
  currentActivityIndex,
  setCurrentActivityIndex,
  isMarkersDisabled,
  isHeatMapEnabled,
  isGroupActivitiesMode,
  groupedActivityIds,
  toggleActivityInGroup,
  sequenceNumber,
}: {
  activity: Activity;
  activityIndex: string;
  currentActivityIndex: string | null;
  setCurrentActivityIndex: (id: string | null) => void;
  isMarkersDisabled: boolean;
  isHeatMapEnabled: boolean;
  isGroupActivitiesMode: boolean;
  groupedActivityIds: Set<string>;
  toggleActivityInGroup: (activityId: string) => void;
  sequenceNumber?: number;
}) {
  const map = useMap();
  const onClickHandler = {
    click: (event) => {
      if (isGroupActivitiesMode) {
        // GROUP MODE: Toggle activity in/out of group
        event.originalEvent?.stopPropagation();  // Prevent map pan
        toggleActivityInGroup(activity.id);
      } else {
        // NORMAL MODE: Zoom and select
        map.flyToBounds(decoding.decode(activity.map.summary_polyline), {
          animate: true,
          duration: 1,
        });
        setCurrentActivityIndex(activityIndex);
      }
    },
  };

  const isGrouped = groupedActivityIds.has(activity.id);
  const isSelected = currentActivityIndex === activityIndex;

  if (!activity.map.summary_polyline) {
    return null;
  }

  const orangeIcon = new leaflet.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const darkerOrangeIcon = new leaflet.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Create purple icon for grouped activities
  const purpleIcon = new leaflet.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Create numbered icon for grouped activities with sequence numbers
  let numberedIcon = null;
  if (isGrouped && sequenceNumber) {
    numberedIcon = new leaflet.DivIcon({
      html: `
        <div class="numbered-marker">
          <div class="marker-pin"></div>
          <span class="marker-number">${sequenceNumber}</span>
        </div>
      `,
      className: 'numbered-marker-container',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  }

  // Icon selection priority (highest to lowest):
  // 1. Grouped + Has Sequence Number → DivIcon with number (purple marker + white number)
  // 2. Grouped + No Sequence → Purple icon (fallback if sequence calc fails)
  // 3. Currently Selected (not grouped) → Red icon (normal selection behavior)
  // 4. Default → Orange icon (normal unselected state)
  const iconToUse =
    (isGrouped && sequenceNumber && numberedIcon) ? numberedIcon      // Priority 1: Grouped + numbered
    : isGrouped ? purpleIcon                          // Priority 2: Grouped (no number)
    : isSelected ? darkerOrangeIcon  // Priority 3: Currently selected
    : orangeIcon;                                     // Priority 4: Default

  return (
    <Fragment key={activity.id}>
      <Polyline
        positions={decoding.decode(activity.map.summary_polyline)}
        pathOptions={{
          color: isGrouped ? "#7C3AED" : isSelected ? "#D43F00" : "#FC4C02",
          opacity:
            !isHeatMapEnabled || isGrouped || isSelected
              ? 1.0
              : 0.4,
          weight:
            !isHeatMapEnabled || isGrouped || isSelected ? 3 : 5,
        }}
        eventHandlers={onClickHandler}
      />
      {!isMarkersDisabled && (
        <Marker
          position={activity.start_latlng}
          eventHandlers={onClickHandler}
          icon={iconToUse}
        ></Marker>
      )}
    </Fragment>
  );
}

function Dashboard({
  activities,
  athlete,
  loadPreviousYear,
  hasMoreYears,
  isFetchingYear,
  loadedYears,
}: {
  activities: Activity[];
  athlete: any;
  loadPreviousYear: () => void;
  hasMoreYears: boolean;
  isFetchingYear: boolean;
  loadedYears: number[];
}) {
  const [currentActivityIndex, setCurrentActivityIndex] = useState<
    string | null
  >(null);
  const [currentActivity, setCurrentActivity] = useState<{
    id: string;
    name: string;
    kudosCount: number;
    startDate: Date;
    distance: number;
    elapsedTime: number;
    type: string;
  } | null>(null);
  const [isHeatMapEnabled, setIsHeatMapEnabled] = useState(false);
  const [isMarkersDisabled, setIsMarkersDisabled] = useState(false);
  const [isGroupActivitiesMode, setIsGroupActivitiesMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [groupedActivityIds, setGroupedActivityIds] = useState<Set<string>>(
    new Set()
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleActivityInGroup = (activityId: string) => {
    setGroupedActivityIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(activityId)) {
        newSet.delete(activityId);
      } else {
        newSet.add(activityId);
      }
      return newSet;
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const clearGroupedActivities = () => {
    setGroupedActivityIds(new Set());
  };

  // Helper function to sample points from a larger array
  const samplePoints = (
    pointsArray: Array<[number, number]>,
    maxPoints: number
  ): Array<[number, number]> => {
    if (pointsArray.length <= maxPoints) return pointsArray;
    const step = Math.ceil(pointsArray.length / maxPoints);
    return pointsArray.filter((_, index) => index % step === 0);
  };

  const groupedActivitiesSequence = useMemo(() => {
    const grouped = activities.filter((a) => groupedActivityIds.has(a.id));
    const sorted = grouped.sort(
      (a, b) =>
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    );
    return sorted.reduce((map, activity, index) => {
      map.set(activity.id, index + 1);
      return map;
    }, new Map<string, number>());
  }, [activities, groupedActivityIds]);

  const groupedBoundary = useMemo(() => {
    if (groupedActivityIds.size < 3) return null; // Need at least 3 points

    const groupedActivities = activities.filter((a) =>
      groupedActivityIds.has(a.id)
    );

    // Use ALL polyline points for accurate boundary
    const allPoints: [number, number][] = groupedActivities.flatMap((a) => {
      if (!a.map?.summary_polyline) return [];
      try {
        return decoding.decode(a.map.summary_polyline);
      } catch (e) {
        console.warn(`Failed to decode polyline for activity ${a.id}:`, e);
        return [];
      }
    });

    if (allPoints.length < 3) return null;

    // Performance optimization: Sample points if too many
    const sampledPoints =
      allPoints.length > 500 ? samplePoints(allPoints, 500) : allPoints;

    // Convert to Turf.js format [lng, lat]
    const turfPoints = points(
      sampledPoints.map(([lat, lng]) => [lng, lat])
    );

    const start = performance.now();
    const hull = convex(turfPoints);
    const duration = performance.now() - start;

    if (duration > 100) {
      console.warn(`Boundary calculation took ${duration}ms`);
    }

    // Convert back to Leaflet format [lat, lng]
    if (hull && hull.geometry.coordinates[0]) {
      const coords = hull.geometry.coordinates[0].map(
        ([lng, lat]) => [lat, lng] as [number, number]
      );
      return coords;
    }

    return null;
  }, [groupedActivityIds, activities]) as [number, number][] | null;

  const outerBounds = activities.map((activity) => activity.start_latlng);
  const leafletBounds = leaflet.latLngBounds(outerBounds);

  // Edge case: Remove stale grouped activity IDs when activities change (pagination)
  // This handles the case where grouped activities are filtered out by year selector
  useEffect(() => {
    const visibleIds = new Set(activities.map((a) => a.id));
    const staleGrouped = Array.from(groupedActivityIds).filter(
      (id) => !visibleIds.has(id)
    );

    if (staleGrouped.length > 0) {
      setGroupedActivityIds((prev) => {
        const newSet = new Set(prev);
        staleGrouped.forEach((id) => newSet.delete(id));
        return newSet;
      });
    }
  }, [activities, groupedActivityIds]);

  // Edge case: Clear current activity when grouping is active
  // Decision: Purple (grouped) takes precedence over red (selected)
  // When user enters group mode or adds activities to a group, clear single activity selection
  useEffect(() => {
    if (groupedActivityIds.size > 0 && currentActivityIndex) {
      setCurrentActivityIndex(null);
      setCurrentActivity(null);
    }
  }, [groupedActivityIds.size, currentActivityIndex]);

  useEffect(() => {
    const activity = activities.find(
      (activity) => activity.id === currentActivityIndex
    );
    if (activity) {
      setCurrentActivity({
        distance: activity.distance,
        elapsedTime: activity.elapsed_time,
        id: activity.id,
        kudosCount: activity.kudos_count,
        name: activity.name,
        startDate: activity.start_date,
        type: activity.type,
      });
    } else {
      setCurrentActivity(null);
    }
  }, [currentActivityIndex, activities]);

  const markers = activities.map((activity) => (
    <ActivityMaker
      activity={activity}
      activityIndex={activity.id}
      currentActivityIndex={currentActivityIndex}
      setCurrentActivityIndex={setCurrentActivityIndex}
      isMarkersDisabled={isMarkersDisabled}
      isHeatMapEnabled={isHeatMapEnabled}
      isGroupActivitiesMode={isGroupActivitiesMode}
      groupedActivityIds={groupedActivityIds}
      toggleActivityInGroup={toggleActivityInGroup}
      sequenceNumber={groupedActivitiesSequence.get(activity.id)}
    />
  ));

  console.log(activities);

  const groupedActivities = activities.filter((a) =>
    groupedActivityIds.has(a.id)
  );

  return (
    <Root>
      {groupedActivityIds.size > 0 && (
        <GroupedActivityOverlay
          groupedActivities={groupedActivities}
          onClose={clearGroupedActivities}
        />
      )}
      {groupedActivityIds.size === 0 && currentActivity && (
        <ActivityOverlay
          activity={currentActivity}
          setCurrentActivityIndex={setCurrentActivityIndex}
        />
      )}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
        integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
        crossOrigin=""
      />
      <MapContainer
        bounds={leafletBounds}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        // Load unprefixed css class
        className="mapid"
        worldCopyJump={false}
        maxBoundsViscosity={1.0}
        maxBounds={[
          [-90, -180],
          [90, 180],
        ]}
        minZoom={2}
      >
        <CountryHighlights activities={activities} />
        <LocationCircle />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers}
        {groupedBoundary && (
          <Polygon
            positions={groupedBoundary}
            pathOptions={{
              color: "#9333EA",
              fillColor: "#9333EA",
              fillOpacity: 0.15,
              weight: 2,
            }}
          />
        )}
        <Profile athlete={athlete} />
        <GroupedActivitiesAutoZoom
          groupedActivityIds={groupedActivityIds}
          activities={activities}
        />
        <ControlMenu
          outerBounds={outerBounds}
          setCurrentActivityIndex={setCurrentActivityIndex}
          isMarkersDisabled={isMarkersDisabled}
          setIsMarkersDisabled={setIsMarkersDisabled}
          isHeatMapEnabled={isHeatMapEnabled}
          setIsHeatMapEnabled={setIsHeatMapEnabled}
          isGroupActivitiesMode={isGroupActivitiesMode}
          setIsGroupActivitiesMode={setIsGroupActivitiesMode}
          groupedActivityIds={groupedActivityIds}
          clearGroupedActivities={clearGroupedActivities}
          loadPreviousYear={loadPreviousYear}
          hasMoreYears={hasMoreYears}
          isFetchingYear={isFetchingYear}
          loadedYears={loadedYears}
        />
      </MapContainer>
    </Root>
  );
}

export default Dashboard;
