import { SimpleMapScreenshoter } from "leaflet-simple-map-screenshoter";
import { useEffect } from "react";
import { useMap } from "react-leaflet";

export function Screenshot() {
  const map = useMap();
  useEffect(() => {
    new SimpleMapScreenshoter({
      screenName: "sportsmap-picture",
      hideElementsWithSelectors: [".leaflet-control"],
    }).addTo(map);
  }, []);

  return null;
}
