import { Button, makeStyles } from "@material-ui/core";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import FavoriteBorder from "@material-ui/icons/FavoriteBorder";
import * as leaflet from "leaflet";
import moment from "moment";
import * as decoding from "polyline-encoded";
import { Fragment, useState } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { Screenshot } from "./screenshot";

const useStyles = makeStyles(() => ({
  parent: {},
  marker: { color: "green", textAlign: "left" }, // In use?
  control: {
    paddingRight: "50%",
  },
  button: { margin: 5 },
  stravaBackLink: {
    "& a:link, a:visited": {
      color: "#FC4C02",
      textDecoration: "none",
    },
    "& a:hover": {
      color: "#ca3e02",
      textDecoration: "none",
    },
  },
  headline: {
    display: "flex",
    flexDirection: "row",
    color: "#FC4C02",
    borderBottom: "1px solid #FC4C02",
  },
  heading: {
    marginRight: "5px",
    fontWeight: "bold",
  },
  favorites: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    color: "#FC4C02 ",
    opacity: "0.7",
  },
  favoritesIcon: {
    marginRight: "2px",
  },
  profile: {
    margin: "5px",
    opacity: "0.85",
    "& img": {
      borderRadius: "50%",
    },
  },
}));

const typeColors = {
  // TODO
  Hike: "blue",
  Run: "green",
  Ride: "red",
};

function ActivityMaker({
  activity,
  activityIndex,
  currentActivityIndex,
  setCurrentActivityIndex,
  isMarkersDisabled,
  isHeatMapEnabled,
}) {
  const classes = useStyles();

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
        >
          <Popup>
            <div>
              <div className={classes.headline}>
                <div className={classes.heading}>{activity.name}</div>
                <div className={classes.favorites}>
                  <FavoriteBorder
                    className={classes.favoritesIcon}
                    fontSize="inherit"
                  />
                  <div>{activity.kudos_count}</div>
                </div>
              </div>
              <div>
                {moment(activity.start_date).format("DD.MM.YYYY hh:mm A")}
              </div>
              <div>
                {Number.parseFloat(
                  (activity.distance / 1000).toString()
                ).toFixed(2)}{" "}
                km
              </div>
              <div>
                {Number.parseFloat(
                  (activity.elapsed_time / 60).toString()
                ).toFixed(1)}{" "}
                minutes
              </div>
              <div className={classes.stravaBackLink}>
                <a
                  href={`https://www.strava.com/activities/${activity.id}`}
                  target="_blank"
                >
                  View on Strava
                </a>
              </div>
            </div>
          </Popup>
        </Marker>
      )}
    </Fragment>
  );
}

function Profile({ athlete }) {
  const classes = useStyles();
  return (
    <div className={"leaflet-top leaflet-right profile " + classes.profile}>
      <img src={athlete.profile} alt="Profile Image" />
    </div>
  );
}

function ControlMenu({
  outerBounds,
  currentActivityIndex,
  setCurrentActivityIndex,
  activities,
  isMarkersDisabled,
  setIsMarkersDisabled,
  isHeatMapEnabled,
  setIsHeatMapEnabled,
}) {
  const classes = useStyles();
  const classNames = `leaflet-bottom leaflet-right control ${classes.control}`;
  const map = useMap();

  const onClickBack = () => {
    map.flyToBounds(outerBounds, { animate: true, duration: 1.5 });
    setCurrentActivityIndex(null);
  };

  const onClickNext = () => {
    let current;
    if (
      currentActivityIndex === null ||
      currentActivityIndex + 1 >= activities.length
    ) {
      current = 0;
    } else {
      current = currentActivityIndex + 1;
    }
    map.flyToBounds(decoding.decode(activities[current].map.summary_polyline), {
      animate: true,
      duration: 1,
    });
    setCurrentActivityIndex(current);
  };

  return (
    <div className={classNames}>
      <div className="leaflet-control">
        <Button variant="contained" color="secondary" onClick={onClickBack}>
          Zoom out
        </Button>
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          startIcon={<NavigateNextIcon />}
          onClick={onClickNext}
        >
          Next
        </Button>
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          onClick={() => {
            setIsMarkersDisabled(!isMarkersDisabled);
          }}
        >
          {isMarkersDisabled ? "Enable Markers" : "Disable Markers"}
        </Button>
        <Button
          variant="contained"
          color="secondary"
          className={classes.button}
          onClick={() => {
            setIsHeatMapEnabled(!isHeatMapEnabled);
          }}
        >
          {isHeatMapEnabled ? "Disable Heatmap" : "Enable Heatmap"}
        </Button>
      </div>
    </div>
  );
}

function Dashboard({ activities, athlete }) {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(null);
  const [isHeatMapEnabled, setIsHeatMapEnabled] = useState(false);
  const outerBounds = activities.map((activity) => activity.start_latlng);
  const leafletBounds = leaflet.latLngBounds(outerBounds);
  const [isMarkersDisabled, setIsMarkersDisabled] = useState(false);

  console.log(isHeatMapEnabled, "heatmapMode");

  const markers = activities.map((activity, index) => (
    <ActivityMaker
      activity={activity}
      activityIndex={index}
      currentActivityIndex={currentActivityIndex}
      setCurrentActivityIndex={setCurrentActivityIndex}
      isMarkersDisabled={isMarkersDisabled}
      isHeatMapEnabled={isHeatMapEnabled}
    />
  ));

  console.log(activities);

  return (
    <>
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
          activities={activities}
          outerBounds={outerBounds}
          currentActivityIndex={currentActivityIndex}
          setCurrentActivityIndex={setCurrentActivityIndex}
          isMarkersDisabled={isMarkersDisabled}
          setIsMarkersDisabled={setIsMarkersDisabled}
          isHeatMapEnabled={isHeatMapEnabled}
          setIsHeatMapEnabled={setIsHeatMapEnabled}
        />
      </MapContainer>
    </>
  );
}

export default Dashboard;
