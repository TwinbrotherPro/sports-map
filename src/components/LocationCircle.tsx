import { Circle } from "react-leaflet";
import { useGeoLocation } from "../hooks/useGeoLocation";

export function LocationCircle() {
  const [position] = useGeoLocation(true);

  return position ? (
    <Circle
      center={position}
      pathOptions={{
        color: "red",
        fillColor: "blue",
        weight: 10,
        fill: true,
      }}
      radius={5}
    />
  ) : null;
}
