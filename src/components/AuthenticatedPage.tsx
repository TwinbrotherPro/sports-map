import { CircularProgress } from "@mui/material";
import { MainPane } from "./MainPane";
import getConfig from "../config/config";
import { useAuthAthlete } from "../hooks/useAuthAthlete";
import { useActivities } from "../hooks/useActivities";
import { ReactComponent as ConnectButton } from "../misc/btn_strava_connectwith_orange.svg";
import { Activity } from "../model/ActivityModel";
import { Athlete } from "../model/AthleteModel";

interface AuthenticatedPageProps {
  description?: string;
  path?: string;
  children: (props: {
    activities: Activity[];
    athlete: Athlete;
    nextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
  }) => React.ReactNode;
}

export function AuthenticatedPage({
  description,
  path,
  children,
}: AuthenticatedPageProps) {
  const config = getConfig();
  const { accessToken, athlete, status } = useAuthAthlete();
  const {
    activities,
    activityStatus,
    error,
    nextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useActivities(accessToken);

  // Not authenticated - show connect button
  if (!accessToken) {
    return (
      <MainPane>
        <p>
          {description ||
            "Connect your Strava account to view your activities."}
          <br />
          <i>
            Everything is client based, nothing is stored on a third party
            server
          </i>
        </p>
        <a href={config.stravaLink(path)}>
          <ConnectButton style={{ width: "193px", height: "48px" }} />
        </a>
      </MainPane>
    );
  }

  // Loading
  if (activityStatus === "pending" || status === "pending") {
    return (
      <MainPane>
        <CircularProgress sx={{ color: "#FC4C02" }} />
      </MainPane>
    );
  }

  // Error
  if (activityStatus === "error" || status === "error") {
    return (
      <MainPane>
        <span>Error: {(error as any)?.message}</span>
      </MainPane>
    );
  }

  // Authenticated and loaded - render children
  if (activities) {
    return (
      <>
        {children({
          activities,
          athlete,
          nextPage,
          hasNextPage,
          isFetchingNextPage,
        })}
      </>
    );
  }

  return null;
}
