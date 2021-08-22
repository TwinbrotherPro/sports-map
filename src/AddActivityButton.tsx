import {
  Button,
  ButtonBase,
  CircularProgress,
  Container,
  Fade,
  makeStyles,
  Paper,
} from "@material-ui/core";
import moment from "moment";
import { useQuery } from "react-query";
import { useLocation } from "react-router";
import getConfig from "./config/config";
import Dashboard from "./Dashboard";
import Box from "@material-ui/core/Box";
import connectButton from "./misc/btn_strava_connectwith_orange.svg";

const useStyles = makeStyles({
  donate: {
    marginLeft: " auto",
    marginRight: " auto",
    backgroundImage: `url(${connectButton})`,
    width: "193px",
    height: "48px",
  },
  authorizeBox: {
    textAlign: "center",
    padding: "10px",
    height: "70%",
    display: "flex",
    flex: "auto",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    maxWidth: "75%",
  },
});

function AddActivityButton() {
  const config = getConfig();
  const classes = useStyles();

  const queryParams = new URLSearchParams(useLocation().search);
  const authCode = queryParams.get("code");
  console.log(authCode);

  const { data, status } = useQuery(
    "stravaAuth",
    async () => {
      const response = await fetch(getConfig().stravaAuth(authCode), {
        method: "POST",
      });
      return response.json();
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      enabled: !!authCode,
    }
  );

  console.log(data);
  const accessToken = data?.access_token;

  const {
    data: activities,
    status: activityStatus,
    error,
  } = useQuery(
    "detailedActivities",
    async () => {
      const yearBefore = moment().subtract(1, "year").unix();
      let currentPage = 1;
      let activities = [];
      let continuePaging = true;
      while (continuePaging) {
        const response = await fetch(
          `https://www.strava.com/api/v3/athlete/activities?after=${yearBefore}&per_page=100&page=${currentPage}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const activityPage = await response.json();
        activities.push(...activityPage);
        currentPage++;
        continuePaging = activityPage.length === 100;
      }
      console.log(activities);
      return activities;
    },
    { enabled: !!accessToken, refetchOnWindowFocus: false }
  );

  if (!accessToken) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Paper elevation={3} className={classes.authorizeBox}>
          <p>
            Shows your activities of the last year on a global map
            visualisation.
          </p>
          <a href={config.stravaLink}>
            <ButtonBase className={classes.donate}></ButtonBase>{" "}
          </a>
        </Paper>
      </Box>
    );
  }

  if (
    activityStatus === "loading" ||
    activityStatus === "idle" ||
    status === "loading" ||
    status === "idle"
  ) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Paper elevation={3} className={classes.authorizeBox}>
          <CircularProgress />
        </Paper>
      </Box>
    );
  }

  if (activityStatus === "error" || status === "error") {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Paper elevation={3} className={classes.authorizeBox}>
          <span>Error: {(error as any).message}</span>
        </Paper>
      </Box>
    );
  }

  if (activities) {
    console.log(accessToken);
    return (
      <Fade timeout={100000}>
        <Dashboard activities={activities} />
      </Fade>
    );
  }

  return null;
}

export default AddActivityButton;
