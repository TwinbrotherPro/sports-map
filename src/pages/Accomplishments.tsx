import { Alert, Button, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import moment from "moment";
import { StatCard } from "../components/StatCard";
import { AuthenticatedPage } from "../components/AuthenticatedPage";
import { ActivitySymbol } from "../components/ActivitySymbol";

const PageContainer = styled("div")({
  height: "100%",
  overflow: "auto",
  backgroundColor: "#f5f5f5",
});

const ContentWrapper = styled("div")({
  maxWidth: "1200px",
  margin: "0 auto",
  padding: "20px",
  paddingBottom: "20px",

  "@media (max-width: 700px)": {
    padding: "15px",
  },
});

const PageHeader = styled("div")({
  marginBottom: "24px",
  textAlign: "center",
});

const PageTitle = styled("h1")({
  fontSize: "32px",
  fontWeight: 700,
  color: "#FC4C02",
  marginBottom: "8px",
  margin: 0,
});

const DateRange = styled("div")({
  fontSize: "16px",
  color: "#666",
  marginTop: "8px",
});

const StatsGrid = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "16px",
  marginBottom: "32px",

  "@media (max-width: 700px)": {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
});

const SectionTitle = styled("h2")({
  fontSize: "20px",
  fontWeight: 600,
  color: "#FC4C02",
  marginBottom: "16px",
  marginTop: "32px",
  paddingBottom: "8px",
  borderBottom: "2px solid rgba(252, 76, 2, 0.3)",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
});

const ActivityTypeList = styled("div")({
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
});

const ActivityTypeItem = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "12px 0",
  borderBottom: "1px solid #f0f0f0",

  "&:last-child": {
    borderBottom: "none",
  },
});

const ActivityTypeLeft = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "12px",
});

const ActivityTypeIcon = styled("div")({
  color: "#FC4C02",
  display: "flex",
  alignItems: "center",
  fontSize: "24px",
});

const ActivityTypeName = styled("div")({
  fontSize: "16px",
  fontWeight: 500,
  color: "#333",
});

const ActivityTypeStats = styled("div")({
  textAlign: "right",
  fontSize: "14px",
  color: "#666",
});

const LoadMoreButton = styled(Button)({
  backgroundColor: "#FC4C02",
  color: "white",
  padding: "12px 32px",
  fontSize: "14px",
  fontWeight: 400,
  margin: "24px auto",
  display: "block",

  "&:hover": {
    backgroundColor: "#ca3e02",
  },

  "&:disabled": {
    backgroundColor: "#ccc",
  },
});

export function Accomplishments() {
  return (
    <AuthenticatedPage
      description="View your accomplishments and activity statistics."
      path="accomplishments"
    >
      {({ activities, nextPage, hasNextPage, isFetchingNextPage }) => {
        // No activities
        if (!activities || activities.length === 0) {
          return (
            <PageContainer>
              <ContentWrapper>
                <Alert severity="info">
                  No activities found. Start tracking your workouts on Strava!
                </Alert>
              </ContentWrapper>
            </PageContainer>
          );
        }

        // Calculate statistics
        const totalDistance =
          activities.reduce((sum, a) => sum + a.distance, 0) / 1000; // km
        const totalTime =
          activities.reduce((sum, a) => sum + a.elapsed_time, 0) / 3600; // hours
        const totalActivities = activities.length;
        const avgDistance = totalDistance / totalActivities;
        const avgTime = (totalTime * 60) / totalActivities; // minutes

        // Date range
        const dates = activities.map((a) => new Date(a.start_date).getTime());
        const earliestDate = moment(Math.min(...dates));
        const latestDate = moment(Math.max(...dates));
        const timeSpan = moment.duration(latestDate.diff(earliestDate));
        const years = timeSpan.years();
        const months = timeSpan.months();

        let timeSpanText = "";
        if (years > 0) {
          timeSpanText = `${years} year${years > 1 ? "s" : ""}`;
          if (months > 0) {
            timeSpanText += `, ${months} month${months > 1 ? "s" : ""}`;
          }
        } else if (months > 0) {
          timeSpanText = `${months} month${months > 1 ? "s" : ""}`;
        } else {
          const days = timeSpan.days();
          timeSpanText = `${days} day${days > 1 ? "s" : ""}`;
        }

        // Activity breakdown by type
        const activityByType = activities.reduce((acc, activity) => {
          const type = activity.type;
          if (!acc[type]) {
            acc[type] = {
              count: 0,
              distance: 0,
              time: 0,
            };
          }
          acc[type].count += 1;
          acc[type].distance += activity.distance;
          acc[type].time += activity.elapsed_time;
          return acc;
        }, {} as Record<string, { count: number; distance: number; time: number }>);

        // Sort by count descending
        const sortedActivityTypes = Object.entries(activityByType).sort(
          ([, a], [, b]) =>
            (b as { count: number }).count - (a as { count: number }).count
        );

        return (
          <PageContainer>
            <ContentWrapper>
              <PageHeader>
                <PageTitle>Your Accomplishments</PageTitle>
                <DateRange>
                  {earliestDate.format("MMM YYYY")} -{" "}
                  {latestDate.format("MMM YYYY")}
                  {timeSpanText && ` (${timeSpanText})`}
                </DateRange>
              </PageHeader>

              {hasNextPage && (
                <Alert severity="warning" sx={{ marginBottom: "24px" }}>
                  Showing stats for {totalActivities} activities. Load more for
                  a complete overview.
                </Alert>
              )}

              <StatsGrid>
                <StatCard
                  value={totalDistance.toFixed(1)}
                  label="Total Distance"
                  subtext="kilometers"
                />
                <StatCard
                  value={totalTime.toFixed(1)}
                  label="Total Time"
                  subtext="hours"
                />
                <StatCard
                  value={totalActivities}
                  label="Total Activities"
                  subtext="workouts"
                />
                <StatCard
                  value={avgDistance.toFixed(1)}
                  label="Avg Distance"
                  subtext="km per activity"
                />
                <StatCard
                  value={avgTime.toFixed(0)}
                  label="Avg Duration"
                  subtext="minutes"
                />
              </StatsGrid>

              <SectionTitle>Activity Breakdown</SectionTitle>
              <ActivityTypeList>
                {sortedActivityTypes.map(([type, stats]) => {
                  const typedStats = stats as {
                    count: number;
                    distance: number;
                    time: number;
                  };
                  return (
                    <ActivityTypeItem key={type}>
                      <ActivityTypeLeft>
                        <ActivityTypeIcon>
                          <ActivitySymbol activityType={type} />
                        </ActivityTypeIcon>
                        <ActivityTypeName>{type}</ActivityTypeName>
                      </ActivityTypeLeft>
                      <ActivityTypeStats>
                        <div>{typedStats.count} activities</div>
                        <div>{(typedStats.distance / 1000).toFixed(1)} km</div>
                        <div>{(typedStats.time / 3600).toFixed(1)} hrs</div>
                      </ActivityTypeStats>
                    </ActivityTypeItem>
                  );
                })}
              </ActivityTypeList>

              {hasNextPage && (
                <LoadMoreButton
                  onClick={() => nextPage()}
                  disabled={isFetchingNextPage}
                  //endIcon={isFetchingNextPage ? null : <NavigateNextIcon />}
                >
                  {isFetchingNextPage ? (
                    <>
                      <CircularProgress
                        size={20}
                        sx={{ color: "white", marginRight: "8px" }}
                      />
                      Loading...
                    </>
                  ) : (
                    "Load More Activities"
                  )}
                </LoadMoreButton>
              )}
            </ContentWrapper>
          </PageContainer>
        );
      }}
    </AuthenticatedPage>
  );
}
