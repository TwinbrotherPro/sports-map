import { useInfiniteQuery } from '@tanstack/react-query';
import moment from 'moment';

/**
 * Fetches activities year by year, starting from the current year.
 * Each "page" represents a full year of activities.
 */
export function useActivities(accessToken: string) {
  const currentYear = new Date().getFullYear();

  const {
    data,
    status: activityStatus,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["activities"],
    queryFn: async ({ pageParam: year }) => {
      const yearStart = moment(`${year}-01-01`).startOf('day').unix();
      const yearEnd = moment(`${year}-12-31`).endOf('day').unix();

      // Fetch all activities for this year (internal pagination for high-volume athletes)
      let allActivities: any[] = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await fetch(
          `https://www.strava.com/api/v3/athlete/activities?after=${yearStart}&before=${yearEnd}&per_page=200&page=${page}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch activities: ${response.statusText}`);
        }

        const activities = await response.json();
        allActivities = [...allActivities, ...activities];
        hasMore = activities.length === 200;
        page++;
      }

      return allActivities;
    },
    initialPageParam: currentYear,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      // Stop at 2008 (Strava launch year)
      if (lastPageParam <= 2008) return undefined;

      // Always allow loading previous year
      return lastPageParam - 1;
    },
    enabled: !!accessToken,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Flatten all pages into a single array
  const activities = data?.pages.flatMap(page => page) ?? [];

  // Extract loaded years from pageParams (sorted descending)
  const loadedYears = ((data?.pageParams as number[]) ?? []).sort((a, b) => b - a);

  return {
    activities,
    activityStatus,
    error,
    loadPreviousYear: fetchNextPage,
    hasMoreYears: hasNextPage,
    isFetchingYear: isFetchingNextPage,
    loadedYears,
  };
}