import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";

export function useGeoLocation(watch: boolean) {
  const map = useMap();
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    map.locate({ setView: false, watch });
    console.log("render2");

    return () => {
      map.stopLocate();
    };
  }, [map, watch]);

  map.on("locationfound", (event) => {
    console.log("Location found");
    setPosition(event.latlng);
  });

  map.on("locationerror", (event) => {
    console.log("Location Error");
    setPosition(null);
    setError(event.message);
  });

  return [position, error];
}
