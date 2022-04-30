import { IconButton, makeStyles } from "@material-ui/core";
import { FavoriteBorder } from "@material-ui/icons";
import CloseIcon from "@material-ui/icons/Close";
import moment from "moment";

const useStyles = makeStyles(() => ({
  overlay: {
    position: "absolute",
    height: "35%",
    width: "100%",
    minWidth: "350px",
    backgroundColor: "white",
    right: "0px",
    zIndex: 10000,
    boxShadow: "-5px 7px 10px 0px grey",
    boxSizing: "border-box",
    padding: "5px",
    bottom: "0px",
    ["@media (min-width:700px)"]: {
      width: "350px",
      height: "100%",
    },
  },
  main: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
    alignItems: "center",
    marginTop: "20px",
  },
  closeIcon: {
    position: "absolute",
    margin: "15px",
    float: "left",
  },
  headline: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    color: "#FC4C02",
    borderBottom: "2px solid #FC4C02",
    margin: "8px 0",
    paddingBottom: "8px",
    justifyContent: "center",
  },
  heading: {
    marginRight: "5px",
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
}));

export function ActivityOverlay({
  activity,
  setCurrentActivityIndex,
}: {
  activity?: {
    id: string;
    name: string;
    kudosCount: number;
    startDate: Date;
    distance: number;
    elapsedTime: number;
  };
  setCurrentActivityIndex;
}) {
  const classes = useStyles();

  if (!activity) {
    return null;
  }

  return (
    <div className={classes.overlay}>
      <IconButton
        className={classes.closeIcon}
        onClick={() => {
          setCurrentActivityIndex(null);
        }}
      >
        <CloseIcon />
      </IconButton>
      <div className={classes.main}>
        <div className={classes.headline}>
          <div className={classes.heading}>{activity.name}</div>
          <div className={classes.favorites}>
            <FavoriteBorder
              className={classes.favoritesIcon}
              fontSize="inherit"
            />
            <div>{activity.kudosCount}</div>
          </div>
        </div>
        <div>{moment(activity.startDate).format("DD.MM.YYYY hh:mm A")}</div>
        <div>
          {Number.parseFloat((activity.distance / 1000).toString()).toFixed(2)}{" "}
          km
        </div>
        <div>
          {Number.parseFloat((activity.elapsedTime / 60).toString()).toFixed(1)}{" "}
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
    </div>
  );
}
