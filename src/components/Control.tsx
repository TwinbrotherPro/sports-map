import { alpha, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useMap } from "react-leaflet";
import { useGeoLocation } from "../hooks/useGeoLocation";
import { useAuthAthlete } from "../hooks/useAuthAthlete";
import { SaveData } from "./SaveData";
import { useState } from "react";

const Control = styled("div")(({ theme }) => ({
  backgroundColor: alpha(theme.palette.info.light, 0.5),
}));
const ControlButton = styled(Button)(({ theme }) => ({
  margin: 5,
  backgroundColor: theme.palette.primary.dark,
  pointerEvents: "auto",
}));

export function ControlMenu({
  outerBounds,
  setCurrentActivityIndex,
  isMarkersDisabled,
  setIsMarkersDisabled,
  isHeatMapEnabled,
  setIsHeatMapEnabled,
  setNextPage,
  hasNextPage,
}) {
  const classNames = `leaflet-control leaflet-bottom`;

  const map = useMap();
  useAuthAthlete();
  const [position, error] = useGeoLocation(false);

  const [isSaveDataVisible, setSaveDataIsVisible] = useState(false);

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
    <Control className={classNames}>
      <ControlButton variant="contained" onClick={onClickBack} size="small">
        Zoom out
      </ControlButton>
      {!error && (
        <ControlButton variant="contained" onClick={onClickZoomIn} size="small">
          Zoom in
        </ControlButton>
      )}
      <ControlButton
        variant="contained"
        size="small"
        onClick={() => {
          setIsMarkersDisabled(!isMarkersDisabled);
        }}
      >
        {isMarkersDisabled ? "Enable Markers" : "Disable Markers"}
      </ControlButton>
      <ControlButton
        size="small"
        variant="contained"
        onClick={() => {
          setIsHeatMapEnabled(!isHeatMapEnabled);
        }}
      >
        {isHeatMapEnabled ? "Disable Heatmap" : "Enable Heatmap"}
      </ControlButton>

      {hasNextPage && <ControlButton
        size="small"
        variant="contained"
        onClick={() => {
          setNextPage();
        }}
      >
        Next Page
      </ControlButton>}

      {false && (
        <ControlButton
          size="small"
          variant="contained"
          onClick={onClickSaveData}
        >
          Save Data
        </ControlButton>
      )}
      {isSaveDataVisible && <SaveData />}
    </Control>
  );
}
