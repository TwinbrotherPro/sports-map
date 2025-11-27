import { Button, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PlaceIcon from "@mui/icons-material/Place";
import MapIcon from "@mui/icons-material/Map";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMap } from "react-leaflet";
import { useGeoLocation } from "../hooks/useGeoLocation";
import { useAuthAthlete } from "../hooks/useAuthAthlete";
import { SaveData } from "./SaveData";
import { useState } from "react";

const ControlContainer = styled("div")<{ isMinimized?: boolean }>(
  ({ isMinimized }) => ({
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "8px",
    padding: isMinimized ? "4px" : "10px",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
    maxWidth: isMinimized ? "auto" : "200px",
    minWidth: isMinimized ? "32px" : "auto",
    position: "relative",
    margin: "10px",
    zIndex: 10000,
    pointerEvents: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: isMinimized ? "center" : "stretch",
    justifyContent: isMinimized ? "center" : "flex-start",

    "@media (max-width: 700px)": {
      maxWidth: isMinimized ? "auto" : "calc(100% - 40px)",
      backgroundColor: "rgba(255, 255, 255, 0.98)",
      margin: "10px",
    },
  })
);

const ControlButtonGroup = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  marginBottom: "12px",

  "&:last-child": {
    marginBottom: 0,
  },
});

const GroupLabel = styled("div")({
  color: "#FC4C02",
  fontSize: "12px",
  fontWeight: 600,
  marginBottom: "6px",
  paddingBottom: "4px",
  borderBottom: "1px solid rgba(252, 76, 2, 0.3)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

const ControlButton = styled(Button)({
  pointerEvents: "auto",
  backgroundColor: "#FC4C02",
  color: "white",

  "&:hover": {
    backgroundColor: "#ca3e02",
  },

  "&.toggle-active": {
    backgroundColor: "#FC4C02",
    color: "white",
    "&:hover": {
      backgroundColor: "#ca3e02",
    },
  },

  "&.toggle-inactive": {
    backgroundColor: "white",
    color: "#FC4C02",
    border: "1px solid #FC4C02",
    "&:hover": {
      backgroundColor: "rgba(252, 76, 2, 0.08)",
    },
  },
});

const CollapseButton = styled(IconButton)({
  position: "absolute",
  top: "5px",
  right: "5px",
  padding: "4px",
  color: "#FC4C02",
  zIndex: 10,
  pointerEvents: "auto",
  "&:hover": {
    backgroundColor: "rgba(252, 76, 2, 0.08)",
  },
});

const ExpandButton = styled(IconButton)({
  padding: "4px",
  color: "#FC4C02",
  pointerEvents: "auto",
  "&:hover": {
    backgroundColor: "rgba(252, 76, 2, 0.08)",
  },
});

export function ControlMenu({
  outerBounds,
  setCurrentActivityIndex,
  isMarkersDisabled,
  setIsMarkersDisabled,
  isHeatMapEnabled,
  setIsHeatMapEnabled,
  setNextPage,
  hasNextPage,
  isFetchingNextPage,
}) {
  const classNames = `leaflet-control leaflet-top leaflet-left`;

  const map = useMap();
  useAuthAthlete();
  const [position, error] = useGeoLocation(false);

  const [isSaveDataVisible, setSaveDataIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const onClickSaveData = () => {
    setSaveDataIsVisible(!isSaveDataVisible);
  };

  const onClickBack = () => {
    map.flyToBounds(outerBounds, { animate: true, duration: 1.5 });
    setCurrentActivityIndex(null);
  };

  const onClickZoomIn = () => {
    if (!error) {
      map.flyTo(position, 16, { animate: true, duration: 1.5 });
    }
  };

  return (
    <ControlContainer className={classNames} isMinimized={isMinimized}>
      {isMinimized ? (
        <ExpandButton
          size="small"
          onClick={() => setIsMinimized(false)}
          aria-label="Expand controls"
        >
          <ExpandMoreIcon fontSize="small" />
        </ExpandButton>
      ) : (
        <>
          <CollapseButton
            size="small"
            onClick={() => setIsMinimized(true)}
            aria-label="Collapse controls"
          >
            <ExpandLessIcon fontSize="small" />
          </CollapseButton>

          <ControlButtonGroup>
            <GroupLabel>Navigation</GroupLabel>
            <ControlButton
              variant="contained"
              onClick={onClickBack}
              size="small"
              fullWidth
              startIcon={<ZoomOutMapIcon />}
            >
              Zoom Out
            </ControlButton>
            {!error && (
              <ControlButton
                variant="contained"
                onClick={onClickZoomIn}
                size="small"
                fullWidth
                startIcon={<MyLocationIcon />}
              >
                Zoom In
              </ControlButton>
            )}
          </ControlButtonGroup>

          <ControlButtonGroup>
            <GroupLabel>Display</GroupLabel>
            <ControlButton
              variant="contained"
              size="small"
              fullWidth
              className={
                isMarkersDisabled ? "toggle-inactive" : "toggle-active"
              }
              onClick={() => setIsMarkersDisabled(!isMarkersDisabled)}
              startIcon={<PlaceIcon />}
            >
              {isMarkersDisabled ? "Show Markers" : "Hide Markers"}
            </ControlButton>
            <ControlButton
              variant="contained"
              size="small"
              fullWidth
              className={isHeatMapEnabled ? "toggle-active" : "toggle-inactive"}
              onClick={() => setIsHeatMapEnabled(!isHeatMapEnabled)}
              startIcon={<MapIcon />}
            >
              {isHeatMapEnabled ? "Hide Heatmap" : "Show Heatmap"}
            </ControlButton>
          </ControlButtonGroup>

          {hasNextPage && (
            <ControlButtonGroup>
              <GroupLabel>Data</GroupLabel>
              <ControlButton
                size="small"
                variant="contained"
                fullWidth
                onClick={() => setNextPage()}
                disabled={isFetchingNextPage}
                startIcon={<NavigateNextIcon />}
              >
                {isFetchingNextPage ? "Loading..." : "Next Page"}
              </ControlButton>
            </ControlButtonGroup>
          )}

          {false && (
            <ControlButtonGroup>
              <ControlButton
                size="small"
                variant="contained"
                fullWidth
                onClick={onClickSaveData}
              >
                Save Data
              </ControlButton>
            </ControlButtonGroup>
          )}
        </>
      )}

      {isSaveDataVisible && <SaveData />}
    </ControlContainer>
  );
}
