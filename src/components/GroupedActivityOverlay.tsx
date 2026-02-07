import { IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import moment from "moment";
import { useQueries } from "@tanstack/react-query";
import { Activity } from "../model/ActivityModel";
import { useAuthAthlete } from "../hooks/useAuthAthlete";

const PREFIX = "GroupedActivityOverlay";

const classes = {
  overlay: `${PREFIX}-overlay`,
  closeIcon: `${PREFIX}-closeIcon`,
  headline: `${PREFIX}-headline`,
  heading: `${PREFIX}-heading`,
  details: `${PREFIX}-details`,
  stats: `${PREFIX}-stats`,
};

const CloseButton = styled(IconButton)({
  position: "absolute",
  top: "10px",
  left: "5px",
  padding: "4px",
  color: "#9333EA",
  pointerEvents: "auto",
  "&:hover": {
    backgroundColor: "rgba(147, 51, 234, 0.08)",
  },
});

const Footer = styled("div")(() => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "baseline",
  marginTop: "15px",
}));

const Root = styled("div")(() => ({
  [`&.${classes.overlay}`]: {
    position: "absolute",
    height: "35%",
    width: "100%",
    minWidth: "350px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    right: "0px",
    zIndex: 1001,
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
    borderRadius: "8px",
    boxSizing: "border-box",
    padding: "10px",
    bottom: "0px",
    marginBottom: "10px",
    marginLeft: "10px",
    "@media (min-width:700px)": {
      width: "350px",
      height: "100%",
    },
    display: "flex",
    flexDirection: "column",
  },

  [`& .${classes.closeIcon}`]: {
    position: "absolute",
    pading: "5px",
    float: "left",
  },

  [`& .${classes.headline}`]: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    color: "#9333EA",
    borderBottom: "1px solid rgba(147, 51, 234, 0.3)",
    margin: "8px 0",
    paddingBottom: "8px",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: 600,
    alignItems: "center",
    gap: "8px",
  },

  [`& .${classes.heading}`]: {
    marginRight: "5px",
  },

  [`& .${classes.details}`]: {
    "@media (min-width:700px)": {
      flexDirection: "column",
    },
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    flex: "1",
  },

  [`& .${classes.stats}`]: {
    "@media (min-width:700px)": {
      width: "100%",
    },
    width: "100%",
    margin: "auto",
  },
}));

export function GroupedActivityOverlay({
  groupedActivities,
  onClose,
}: {
  groupedActivities: Activity[];
  onClose: () => void;
}) {
  const { accessToken } = useAuthAthlete();

  // Fetch detailed activities using useQueries
  const detailedActivitiesQueries = useQueries({
    queries: groupedActivities.map((activity) => ({
      queryKey: ["detailedActivity", activity.id],
      queryFn: async () => {
        const response = await fetch(
          `https://www.strava.com/api/v3/activities/${activity.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch detailed activity");
        return response.json();
      },
      enabled: !!accessToken && !!activity.id,
      staleTime: 1000 * 60 * 60, // 1 hour
    })),
  });

  // Calculate aggregate statistics
  const totalDistance = groupedActivities.reduce(
    (sum, a) => sum + a.distance,
    0
  );
  const totalTime = groupedActivities.reduce(
    (sum, a) => sum + a.elapsed_time,
    0
  );

  const dates = groupedActivities.map((a) => new Date(a.start_date));
  const startDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const endDate = new Date(Math.max(...dates.map((d) => d.getTime())));

  const activityCount = groupedActivities.length;

  // Calculate elevation statistics
  const allLoaded = detailedActivitiesQueries.every((q) => q.isSuccess);
  const anyLoading = detailedActivitiesQueries.some((q) => q.isLoading);
  const anyError = detailedActivitiesQueries.some((q) => q.isError);

  const totalElevation = detailedActivitiesQueries
    .filter((q) => q.isSuccess && q.data)
    .reduce((sum, q) => sum + (q.data.total_elevation_gain || 0), 0);

  return (
    <Root className={classes.overlay}>
      <CloseButton onClick={onClose} size="small">
        <CloseIcon />
      </CloseButton>
      <div className={classes.headline}>
        <GroupWorkIcon fontSize="small" />
        <div className={classes.heading}>Activity Group</div>
      </div>
      <div className={classes.details}>
        <div className={classes.stats}>
          <div>
            <strong>Activities:</strong> {activityCount}
          </div>
          <div>
            <strong>Total Distance:</strong>{" "}
            {Number.parseFloat((totalDistance / 1000).toString()).toFixed(2)} km
          </div>
          <div>
            <strong>Total Time:</strong>{" "}
            {Number.parseFloat((totalTime / 3600).toString()).toFixed(1)} hours
          </div>
          <div>
            <strong>Total Elevation:</strong>{" "}
            {anyLoading && "Loading..."}
            {anyError && "Error loading"}
            {allLoaded && `${totalElevation.toFixed(0)} m`}
          </div>
          <div>
            <strong>Date Range:</strong>{" "}
            {moment(startDate).format("DD.MM.YYYY")} -{" "}
            {moment(endDate).format("DD.MM.YYYY")}
          </div>
        </div>
      </div>
      <Footer>
        <span></span>
      </Footer>
    </Root>
  );
}
