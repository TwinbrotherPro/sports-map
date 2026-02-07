import { styled } from "@mui/material/styles";
import LinearProgress from "@mui/material/LinearProgress";

interface CountriesProgressCardProps {
  visitedCount: number;
  totalCount: number;
  percentage: string;
  visitedCountries: Array<{ name: string; continent: string }>;
  continentBreakdown: Record<string, number>;
}

const ProgressCard = styled("div")({
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  minHeight: "200px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  },
});

const CardTitle = styled("div")({
  fontSize: "14px",
  fontWeight: 600,
  color: "#FC4C02",
  textTransform: "uppercase",
  letterSpacing: "1px",
  marginBottom: "8px",
});

const StatsDisplay = styled("div")({
  fontSize: "28px",
  fontWeight: "bold",
  color: "#FC4C02",
  marginBottom: "4px",
});

const StatsSubtext = styled("div")({
  fontSize: "11px",
  color: "#999",
  marginBottom: "8px",
});

const ProgressBarContainer = styled("div")({
  marginBottom: "12px",
});

const SectionTitle = styled("div")({
  fontSize: "11px",
  fontWeight: 600,
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  marginTop: "4px",
  marginBottom: "6px",
});

const ContinentBreakdown = styled("div")({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
  gap: "6px",
  marginBottom: "10px",
});

const ContinentItem = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "4px 8px",
  backgroundColor: "#f5f5f5",
  borderRadius: "4px",
  fontSize: "11px",
  color: "#666",
});

const ContinentName = styled("span")({
  fontWeight: 500,
});

const ContinentCount = styled("span")({
  fontWeight: "bold",
  color: "#FC4C02",
});

const CountryList = styled("div")({
  maxHeight: "120px",
  overflowY: "auto",
  display: "flex",
  flexWrap: "wrap",
  gap: "4px",
  padding: "4px 0",
  "&::-webkit-scrollbar": {
    width: "4px",
  },
  "&::-webkit-scrollbar-track": {
    background: "#f1f1f1",
    borderRadius: "2px",
  },
  "&::-webkit-scrollbar-thumb": {
    background: "#FC4C02",
    borderRadius: "2px",
  },
  "&::-webkit-scrollbar-thumb:hover": {
    background: "#e04302",
  },
});

const CountryChip = styled("span")({
  display: "inline-block",
  padding: "3px 8px",
  backgroundColor: "#f5f5f5",
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  fontSize: "10px",
  color: "#333",
  fontWeight: 500,
});

/**
 * CountriesProgressCard displays a progress bar showing countries visited.
 *
 * Features:
 * - Progress bar with percentage and count
 * - Breakdown by continent
 * - Scrollable list of visited countries
 */
export function CountriesProgressCard({
  visitedCount,
  totalCount,
  percentage,
  visitedCountries,
  continentBreakdown,
}: CountriesProgressCardProps) {
  const progressValue = parseFloat(percentage);

  return (
    <ProgressCard>
      <div>
        <CardTitle>Countries Visited</CardTitle>
        <StatsDisplay>
          {visitedCount}/{totalCount}
        </StatsDisplay>
        <StatsSubtext>{percentage}% of all territories</StatsSubtext>
      </div>

      <ProgressBarContainer>
        <LinearProgress
          variant="determinate"
          value={Math.min(progressValue, 100)}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "#e0e0e0",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "#FC4C02",
              borderRadius: 4,
            },
          }}
        />
      </ProgressBarContainer>

      {Object.keys(continentBreakdown).length > 0 && (
        <>
          <SectionTitle>By Continent</SectionTitle>
          <ContinentBreakdown>
            {Object.entries(continentBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([continent, count]) => (
                <ContinentItem key={continent}>
                  <ContinentName>{continent}</ContinentName>
                  <ContinentCount>{count}</ContinentCount>
                </ContinentItem>
              ))}
          </ContinentBreakdown>
        </>
      )}

      {visitedCountries.length > 0 && (
        <>
          <SectionTitle>Territories</SectionTitle>
          <CountryList>
            {visitedCountries.map((country) => (
              <CountryChip key={country.name}>{country.name}</CountryChip>
            ))}
          </CountryList>
        </>
      )}
    </ProgressCard>
  );
}
