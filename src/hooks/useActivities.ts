import { useQuery } from '@tanstack/react-query';

/**
 * If no activity call has been made yet, this hooks expects "accessToken" to be part of the URL query
 *
 * Once an activity call has been made it returns the cached activity data.
 *
 */
export function useActivites(accessToken: string) {
  const {
    data: activities,
    status: activityStatus,
    error,
  } = useQuery(
    ["activityList"],
    async () => {
      const tenYearsBefore = await import("moment").then((moment) =>
        moment.default().subtract(10, "year").unix()
      );
      let currentPage = 1;
      let activities = [];
      let continuePaging = true;
      while (continuePaging) {
        const response = await fetch(
          `https://www.strava.com/api/v3/athlete/activities?after=${tenYearsBefore}&per_page=100&page=${currentPage}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const activityPage = await response.json();
        activities.push(...activityPage);
        currentPage++;
        continuePaging = activityPage.length === 100;
      }
      return activities;
    },
    { enabled: !!accessToken, refetchOnWindowFocus: false }
  );

  return { activities, activityStatus, error }; // TODO type activity
}
