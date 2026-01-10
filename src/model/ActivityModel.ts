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

export type DetailedActivity = {
  device_name?: string;
  total_elevation_gain?: number;
  description?: string;
  map?: {
    polyline: string;
  };
  photos?: {
    count: number;
    primary?: {
      urls: {
        [key: string]: string;
      };
    };
  };
};
