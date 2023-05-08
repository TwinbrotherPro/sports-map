import { alpha, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import * as leaflet from "leaflet";
import * as decoding from "polyline-encoded";
import { Fragment, useEffect, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMap,
} from "react-leaflet";
import { Screenshot } from "./screenshot";
import { ActivityOverlay } from "./components/ActivityOverlay";

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

  [`& .${classes.profile}`]: {
    margin: "5px",
    opacity: "0.70",
    "& img": {
      borderRadius: "50%",
    },
  },
}));

const Control = styled("div")(({ theme }) => ({
  paddingRight: "50%",
  backgroundColor: alpha(theme.palette.info.light, 0.5),
}));

const ControlButton = styled(Button)(({ theme }) => ({
  margin: 5,
  backgroundColor: theme.palette.primary.dark,
}));

function ActivityMaker({
  activity,
  activityIndex,
  currentActivityIndex,
  setCurrentActivityIndex,
  isMarkersDisabled,
  isHeatMapEnabled,
}) {
  const map = useMap();
  const onClickHandler = {
    click: (event) => {
      map.flyToBounds(decoding.decode(activity.map.summary_polyline), {
        animate: true,
        duration: 1,
      });
      setCurrentActivityIndex(activityIndex);
    },
  };

  if (!activity.map.summary_polyline) {
    return null;
  }

  const blueIcon = new leaflet.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const redIcon = new leaflet.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
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
          color: currentActivityIndex === activityIndex ? "#CB2B3E" : "#2A81CB",
          opacity:
            !isHeatMapEnabled || currentActivityIndex === activityIndex
              ? 1.0
              : 0.4,
          weight:
            !isHeatMapEnabled || currentActivityIndex === activityIndex ? 3 : 5,
        }}
        eventHandlers={onClickHandler}
      />
      {!isMarkersDisabled && (
        <Marker
          position={activity.start_latlng}
          eventHandlers={onClickHandler}
          icon={currentActivityIndex === activityIndex ? redIcon : blueIcon}
        ></Marker>
      )}
    </Fragment>
  );
}

function Profile({ athlete }) {
  return (
    <div className={"leaflet-top leaflet-right profile " + classes.profile}>
      <img src={athlete.profile} alt="Profile Image" />
    </div>
  );
}

function ControlMenu({
  outerBounds,
  setCurrentActivityIndex,
  isMarkersDisabled,
  setIsMarkersDisabled,
  isHeatMapEnabled,
  setIsHeatMapEnabled,
}) {
  const classNames = `leaflet-bottom leaflet-control`;
  const map = useMap();

  const onClickBack = () => {
    map.flyToBounds(outerBounds, { animate: true, duration: 1.5 });
    setCurrentActivityIndex(null);
  };

  return (
    <Control className={classNames}>
      <ControlButton variant="contained" onClick={onClickBack} size="small">
        Zoom out
      </ControlButton>
      <ControlButton
        variant="contained"
        size="small"
        onClick={() => {
          setIsMarkersDisabled(!isMarkersDisabled);
        }}
      >
        {isMarkersDisabled ? "Enable Markers" : "Disable Markers"}
      </ControlButton>
      <ControlButton
        size="small"
        variant="contained"
        onClick={() => {
          setIsHeatMapEnabled(!isHeatMapEnabled);
        }}
      >
        {isHeatMapEnabled ? "Disable Heatmap" : "Enable Heatmap"}
      </ControlButton>
      <ControlButton size="small" variant="contained">
        Save Data
      </ControlButton>
    </Control>
  );
}

function Dashboard({ activities, athlete }) {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(null);
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
  const outerBounds = activities.map((activity) => activity.start_latlng);
  const leafletBounds = leaflet.latLngBounds(outerBounds);
  const [isMarkersDisabled, setIsMarkersDisabled] = useState(false);

  useEffect(() => {
    const activity = activities.find(
      (activity) => activity.id === currentActivityIndex
    );
    console.log("test", activity);
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
  }, [currentActivityIndex]);

  console.log(isHeatMapEnabled, "heatmapMode");

  const markers = activities.map((activity) => (
    <ActivityMaker
      activity={activity}
      activityIndex={activity.id}
      currentActivityIndex={currentActivityIndex}
      setCurrentActivityIndex={setCurrentActivityIndex}
      isMarkersDisabled={isMarkersDisabled}
      isHeatMapEnabled={isHeatMapEnabled}
    />
  ));

  console.log(activities);

  return (
    <Root>
      {currentActivity && (
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
        // Load unprefixed css class
        className="mapid"
      >
        <Screenshot />
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers}
        <Profile athlete={athlete} />
        <ControlMenu
          outerBounds={outerBounds}
          setCurrentActivityIndex={setCurrentActivityIndex}
          isMarkersDisabled={isMarkersDisabled}
          setIsMarkersDisabled={setIsMarkersDisabled}
          isHeatMapEnabled={isHeatMapEnabled}
          setIsHeatMapEnabled={setIsHeatMapEnabled}
        />
      </MapContainer>
    </Root>
  );
}

export default Dashboard;
