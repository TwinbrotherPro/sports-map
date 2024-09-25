import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from "react-router-dom";
import getConfig from "../config/config";

/**
 * If no auth call has been made yet, this hooks expects "code" to be part of the URL query
 *
 * Once an auth call has been made it returns the cached auth data.
 *
 */
export function useAuthAthlete() {
  const [searchParams, setSearchParams] = useSearchParams();
  const authCode = searchParams.get("code");
  if (authCode) {
    setSearchParams({});
  }

  const { data, status } = useQuery(
    ["stravaAuth"],
    async () => {
      const response = await fetch(getConfig().stravaAuth(authCode), {
        method: "POST",
      });
      return response.json();
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
      enabled: !!authCode, // Implement one-time fetch if Strava Quota exceeds
    }
  );

  console.log("data", data);
  const accessToken = data?.access_token;
  const athlete = data?.athlete;

  return { accessToken, athlete, status };
}
