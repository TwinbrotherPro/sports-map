import { Button, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PlaceIcon from "@mui/icons-material/Place";
import MapIcon from "@mui/icons-material/Map";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useMap } from "react-leaflet";
import { useGeoLocation } from "../hooks/useGeoLocation";
import { useAuthAthlete } from "../hooks/useAuthAthlete";
import { useDraggablePosition } from "../hooks/useDraggablePosition";
import { useState } from "react";
import { YearSelector } from "./YearSelector";

const ControlContainer = styled("div")<{ isMinimized?: boolean }>(
  ({ isMinimized }) => ({
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "8px",
    padding: isMinimized ? "0 0 4px 0" : "0",
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.15)",
    maxWidth: isMinimized ? "auto" : "200px",
    minWidth: isMinimized ? "32px" : "auto",
    position: "relative",
    pointerEvents: "auto",
    display: "flex",
    flexDirection: "column",
    alignItems: isMinimized ? "center" : "stretch",
    justifyContent: "flex-start",

    "@media (max-width: 700px)": {
      maxWidth: isMinimized ? "auto" : "calc(100% - 40px)",
      backgroundColor: "rgba(255, 255, 255, 0.98)",
    },
  })
);

const ControlButtonGroup = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  marginBottom: "12px",
  padding: "0 10px",

  "&:last-child": {
    marginBottom: 0,
    paddingBottom: "10px",
  },

  "&:first-of-type": {
    paddingTop: "10px",
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
  top: "13px",
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
  margin: "0 4px 0 4px",
  color: "#FC4C02",
  pointerEvents: "auto",
  "&:hover": {
    backgroundColor: "rgba(252, 76, 2, 0.08)",
  },
});

const ControlWrapper = styled("div")<{
  isDragging?: boolean;
}>(({ isDragging }) => ({
  position: "fixed",
  zIndex: 10000,
  pointerEvents: "auto",
  willChange: "transform",
  boxShadow: isDragging ? "0px 4px 12px rgba(0, 0, 0, 0.25)" : "none",
  userSelect: isDragging ? "none" : "auto",
}));

const DragHandle = styled("div")<{
  isDragging?: boolean;
  isMinimized?: boolean;
}>(({ isDragging, isMinimized }) => ({
  height: isMinimized ? "12px" : "8px",
  width: "100%",
  backgroundColor: isDragging
    ? "rgba(252, 76, 2, 0.3)"
    : "rgba(252, 76, 2, 0.15)",
  cursor: isDragging ? "grabbing" : "grab",
  userSelect: "none",
  touchAction: "none",
  borderRadius: "8px 8px 0 0",
  transition: "background-color 0.15s ease",
  marginBottom: isMinimized ? "4px" : "8px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "&:hover": {
    backgroundColor: "rgba(252, 76, 2, 0.25)",
  },
  "&:active": {
    backgroundColor: "rgba(252, 76, 2, 0.35)",
  },
  "&::after": {
    content: '""',
    width: "30px",
    height: "3px",
    backgroundColor: "rgba(252, 76, 2, 0.4)",
    borderRadius: "2px",
  },
}));

export function ControlMenu({
  outerBounds,
  setCurrentActivityIndex,
  isMarkersDisabled,
  setIsMarkersDisabled,
  isHeatMapEnabled,
  setIsHeatMapEnabled,
  loadPreviousYear,
  hasMoreYears,
  isFetchingYear,
  loadedYears,
}) {
  const map = useMap();
  useAuthAthlete();
  const [position, error] = useGeoLocation(false);

  const [isMinimized, setIsMinimized] = useState(false);

  // Draggable position hook
  const {
    position: dragPosition,
    isDragging,
    handlers,
    containerRef,
  } = useDraggablePosition({ x: 10, y: 10 });

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
    <ControlWrapper
      ref={containerRef}
      style={{
        transform: `translate(${dragPosition.x}px, ${dragPosition.y}px)`,
      }}
      isDragging={isDragging}
    >
      <ControlContainer isMinimized={isMinimized}>
        {isMinimized ? (
          <>
            <DragHandle
              onPointerDown={handlers.onPointerDown}
              isDragging={isDragging}
              isMinimized={true}
            />
            <ExpandButton
              size="small"
              onClick={() => setIsMinimized(false)}
              aria-label="Expand controls"
            >
              <ExpandMoreIcon fontSize="small" />
            </ExpandButton>
          </>
        ) : (
          <>
            <DragHandle
              onPointerDown={handlers.onPointerDown}
              isDragging={isDragging}
              isMinimized={false}
            />
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
                className={
                  isHeatMapEnabled ? "toggle-active" : "toggle-inactive"
                }
                onClick={() => setIsHeatMapEnabled(!isHeatMapEnabled)}
                startIcon={<MapIcon />}
              >
                {isHeatMapEnabled ? "Hide Heatmap" : "Show Heatmap"}
              </ControlButton>
            </ControlButtonGroup>

            <ControlButtonGroup>
              <GroupLabel>Years Loaded</GroupLabel>
              <YearSelector
                loadedYears={loadedYears}
                onLoadPreviousYear={loadPreviousYear}
                hasMoreYears={hasMoreYears}
                isFetchingYear={isFetchingYear}
                compact={true}
              />
            </ControlButtonGroup>
          </>
        )}
      </ControlContainer>
    </ControlWrapper>
  );
}
