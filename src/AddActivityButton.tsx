import {
  ButtonBase,
  CircularProgress,
  Fade,
  makeStyles,
} from "@material-ui/core";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import { MainPane } from "./components/MainPane";
import getConfig from "./config/config";
import Dashboard from "./Dashboard";
import { useAuthAthlete } from "./hooks/useAuthAthlete";
import connectButton from "./misc/btn_strava_connectwith_orange.svg";

const useStyles = makeStyles({
  donate: {
    marginLeft: " auto",
    marginRight: " auto",
    backgroundImage: `url(${connectButton})`,
    width: "193px",
    height: "48px",
  },
});

function AddActivityButton() {
  const config = getConfig();
  const classes = useStyles();

  const { accessToken, athlete, status } = useAuthAthlete();

  const {
    data: activities,
    status: activityStatus,
    error,
  } = useQuery(
    "activityList",
    async () => {
      const tenYearsBefore = await import("moment").then((moment) =>
        moment.default().subtract(10, "year").unix()
      );
      let currentPage = 1;
      let activities = [];
      let continuePaging = true;
      while (continuePaging) {
        const response = await fetch(
          `https://www.strava.com/api/v3/athlete/activities?after=${tenYearsBefore}&per_page=100&page=${currentPage}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const activityPage = await response.json();
        activities.push(...activityPage);
        currentPage++;
        continuePaging = activityPage.length === 100;
      }
      return activities;
    },
    { enabled: !!accessToken, refetchOnWindowFocus: false }
  );

  if (!accessToken) {
    return (
      <MainPane>
        <p>
          Shows your activities of the last year on a global map visualisation.
        </p>
        <a href={config.stravaLink}>
          <ButtonBase className={classes.donate}></ButtonBase>{" "}
        </a>
      </MainPane>
    );
  }

  if (
    activityStatus === "loading" ||
    activityStatus === "idle" ||
    status === "loading" ||
    status === "idle"
  ) {
    return (
      <MainPane>
        <CircularProgress />
      </MainPane>
    );
  }

  if (activityStatus === "error" || status === "error") {
    return (
      <MainPane>
        <span>Error: {(error as any).message}</span>
      </MainPane>
    );
  }

  if (activities) {
    return (
      <Fade timeout={100000}>
        <Dashboard activities={activities} athlete={athlete} />
      </Fade>
    );
  }

  return null;
}

export default AddActivityButton;
