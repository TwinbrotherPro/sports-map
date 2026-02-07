import { IconButton, Button, CircularProgress, Tooltip, Alert } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import { Download as DownloadIcon, Info as InfoIcon } from "@mui/icons-material";
import moment from "moment";
import { useQueries } from "@tanstack/react-query";
import { Activity } from "../model/ActivityModel";
import { useAuthAthlete } from "../hooks/useAuthAthlete";
import { useState } from "react";
import html2canvas from "html2canvas";

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
  justifyContent: "center",
  alignItems: "center",
  marginTop: "15px",
  gap: "8px",
}));

const ErrorAlert = styled(Alert)({
  marginTop: "12px",
  fontSize: "0.85rem",
  padding: "8px 12px",
  wordBreak: "break-word",
});

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

type ExportErrorType = "MAP_CONTAINER_NOT_FOUND" | "BLOB_CREATION_FAILED" | "CORS" | "CANVAS" | "UNKNOWN" | null;

const getErrorMessage = (errorType: ExportErrorType): string => {
  const messages: Record<Exclude<ExportErrorType, null>, string> = {
    CORS: `Unable to export due to map tile restrictions. Try these alternatives instead:
• Mac: Cmd + Shift + 4
• Windows/Linux: Win + Shift + S
• Mobile: Use your device's screenshot button`,

    MAP_CONTAINER_NOT_FOUND: "Export failed: Map container not found. Try refreshing the page.",

    BLOB_CREATION_FAILED: "Export failed: Could not create image. Please use your browser's screenshot feature instead.",

    CANVAS: `Export failed: Canvas rendering error. Try these alternatives:
• Mac: Cmd + Shift + 4
• Windows/Linux: Win + Shift + S
• Mobile: Use your device's screenshot button`,

    UNKNOWN: `Export failed. Please try using your browser's screenshot feature instead:
• Mac: Cmd + Shift + 4
• Windows/Linux: Win + Shift + S
• Mobile: Use your device's screenshot button`,
  };

  return messages[errorType] || messages.UNKNOWN;
};

const getErrorSeverity = (errorType: ExportErrorType): "error" | "info" => {
  return errorType === "CORS" ? "info" : "error";
};

const detectErrorType = (error: unknown): ExportErrorType => {
  if (error instanceof Error) {
    if (error.message.includes("CORS") || error.name === "SecurityError") {
      return "CORS";
    }
    if (error.message.includes("canvas")) {
      return "CANVAS";
    }
  }
  return "UNKNOWN";
};

export function GroupedActivityOverlay({
  groupedActivities,
  onClose,
}: {
  groupedActivities: Activity[];
  onClose: () => void;
}) {
  const { accessToken } = useAuthAthlete();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<ExportErrorType>(null);

  const handleExportImage = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const mapContainer = document.querySelector(".mapid");
      if (!mapContainer) {
        console.error("Map container not found");
        setExportError("MAP_CONTAINER_NOT_FOUND");
        return;
      }

      const canvas = await html2canvas(mapContainer as HTMLElement, {
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#FFFFFF",
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          setExportError("BLOB_CREATION_FAILED");
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `activity-group-${moment().format("YYYY-MM-DD-HHmmss")}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } catch (error) {
      console.error("Export failed:", error);
      const errorType = detectErrorType(error);
      setExportError(errorType);
    } finally {
      setIsExporting(false);
    }
  };

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

  // Edge case handling:
  // - 0 activities: Handled by Dashboard (returns null before rendering overlay)
  // - 1 activity: Shows in grouped overlay (consistent UI, easier than switching views)
  // - 2 activities: Shows overlay, but boundary won't appear (convex hull needs 3+ points)
  // - 3+ activities: Full functionality including boundary

  // Calculate elevation statistics
  const allLoaded = detailedActivitiesQueries.every((q) => q.isSuccess);
  const anyLoading = detailedActivitiesQueries.some((q) => q.isLoading);
  const anyError = detailedActivitiesQueries.some((q) => q.isError);

  const totalElevation = detailedActivitiesQueries
    .filter((q) => q.isSuccess && q.data)
    .reduce((sum, q) => sum + (q.data.total_elevation_gain || 0), 0);

  // Edge case: Defensive check for no activities (shouldn't happen due to Dashboard check)
  if (!groupedActivities || groupedActivities.length === 0) {
    return null;
  }

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
        <Button
          variant="contained"
          startIcon={isExporting ? <CircularProgress size={16} /> : <DownloadIcon />}
          onClick={handleExportImage}
          disabled={isExporting}
          size="small"
          sx={{ mt: 2 }}
        >
          {isExporting ? "Exporting..." : "Download Image"}
        </Button>
        <Tooltip title="Download a screenshot of the grouped activities and map. Note: Some browsers may have CORS restrictions preventing export. Use your browser's built-in screenshot feature as a fallback.">
          <InfoIcon
            fontSize="small"
            sx={{ color: "#9333EA", cursor: "help", opacity: 0.7 }}
          />
        </Tooltip>
      </Footer>
      {exportError && (
        <ErrorAlert severity={getErrorSeverity(exportError)} onClose={() => setExportError(null)}>
          {getErrorMessage(exportError)}
        </ErrorAlert>
      )}
    </Root>
  );
}
