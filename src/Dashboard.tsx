import { styled } from "@mui/material/styles";
import * as leaflet from "leaflet";
import * as decoding from "polyline-encoded";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
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

  const isGrouped = groupedActivityIds.has(activity.id);
  const isSelected = currentActivityIndex === activityIndex;

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
          icon={isGrouped ? purpleIcon : isSelected ? darkerOrangeIcon : orangeIcon}
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

  const outerBounds = activities.map((activity) => activity.start_latlng);
  const leafletBounds = leaflet.latLngBounds(outerBounds);

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
