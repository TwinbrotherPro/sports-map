import { LatLngExpression } from "leaflet";

export type Activity = {
  id: string;
  start_latlng: LatLngExpression;
  map: {
    summary_polyline: any;
  };
  distance: number;
  elapsed_time: number;
  kudos_count: number;
  name: string;
  start_date: Date;
  type: string;
};
