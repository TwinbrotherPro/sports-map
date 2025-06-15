import { useInfiniteQuery } from '@tanstack/react-query';

/**
 * If no activity call has been made yet, this hooks expects "accessToken" to be part of the URL query
 *
 * Once an activity call has been made it returns the cached activity data.
 *
 */
export function useActivities(accessToken: string) {
  const {
    data,
    status: activityStatus,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["activities"],
    queryFn: async ({ pageParam = 1 }) => {
      const today = await import("moment").then((moment) =>
        moment.default().unix()
      );

      const response = await fetch(
        `https://www.strava.com/api/v3/athlete/activities?before=${today}&per_page=100&page=${pageParam}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.statusText}`);
      }

      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      // If the last page has 100 items, there might be more pages
      return lastPage.length === 100 ? pages.length + 1 : undefined;
    },
    enabled: !!accessToken,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Flatten all pages into a single array
  const activities = data?.pages.flatMap(page => page) ?? [];

  return {
    activities,
    activityStatus,
    error,
    nextPage: fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  };
}