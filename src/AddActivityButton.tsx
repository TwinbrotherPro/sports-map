import { CircularProgress, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useQuery } from "react-query";
import { MainPane } from "./components/MainPane";
import getConfig from "./config/config";
import Dashboard from "./Dashboard";
import { useAuthAthlete } from "./hooks/useAuthAthlete";
import { ReactComponent as ConnectButton } from "./misc/btn_strava_connectwith_orange.svg";

const PREFIX = "AddActivityButton";

const classes = {
  donate: `${PREFIX}-donate`,
};

const StyledFade = styled(Fade)({
  [`& .${classes.donate}`]: {
    marginLeft: " auto",
    marginRight: " auto",
    width: "193px",
    height: "48px",
  },
});

function AddActivityButton() {
  const config = getConfig();

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
          <ConnectButton className={classes.donate}>Donate</ConnectButton>
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
      <StyledFade timeout={100000}>
        <Dashboard activities={activities} athlete={athlete} />
      </StyledFade>
    );
  }

  return null;
}

export default AddActivityButton;
