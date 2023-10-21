import { CircularProgress, Fade } from "@mui/material";
import { styled } from "@mui/material/styles";
import { MainPane } from "./components/MainPane";
import getConfig from "./config/config";
import Dashboard from "./Dashboard";
import { useAuthAthlete } from "./hooks/useAuthAthlete";
import { ReactComponent as ConnectButton } from "./misc/btn_strava_connectwith_orange.svg";
import { useActivites } from "./hooks/useActivities";

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

  const { activities, activityStatus, error } = useActivites(accessToken);

  if (!accessToken) {
    return (
      <MainPane>
        <p>
          Shows your activities of the last year on a global map visualisation.
        </p>
        <a href={config.stravaLink}>
          <ConnectButton className={classes.donate} />
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
