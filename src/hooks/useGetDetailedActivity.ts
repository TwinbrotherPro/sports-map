import { useQuery } from "react-query";

export function useGetDetailedActivity(id: string, accessToken: string) {
  const {
    data: detailedActivity,
    status: activityStatus,
    error,
  } = useQuery(
    `detailedActivity${id}`,
    async () => {
      const response = await fetch(
        `https://www.strava.com/api/v3/activities/${id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      return await response.json();
    },
    {
      enabled: !!accessToken,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  return { detailedActivity, activityStatus, error };
}
