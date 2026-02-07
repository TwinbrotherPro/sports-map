import { Button, Chip, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";

const YearSelectorContainer = styled("div")<{ compact?: boolean }>(
  ({ compact }) => ({
    display: "flex",
    flexWrap: "wrap",
    gap: compact ? "6px" : "8px",
    alignItems: "center",
  })
);

const YearChip = styled(Chip)<{ compact?: boolean }>(({ compact }) => ({
  backgroundColor: "#FC4C02",
  color: "white",
  fontWeight: 500,
  fontSize: compact ? "11px" : "13px",
  height: compact ? "24px" : "28px",

  "& .MuiChip-label": {
    padding: compact ? "0 8px" : "0 10px",
  },
}));

const LoadYearButton = styled(Button)<{ compact?: boolean }>(({ compact }) => ({
  backgroundColor: "white",
  color: "#FC4C02",
  border: "1px solid #FC4C02",
  fontSize: compact ? "11px" : "13px",
  padding: compact ? "2px 8px" : "4px 12px",
  minWidth: "auto",
  height: compact ? "24px" : "28px",
  textTransform: "none",

  "&:hover": {
    backgroundColor: "rgba(252, 76, 2, 0.08)",
  },

  "&:disabled": {
    borderColor: "#ccc",
    color: "#ccc",
  },
}));

interface YearSelectorProps {
  loadedYears: number[];
  onLoadPreviousYear: () => void;
  hasMoreYears: boolean;
  isFetchingYear: boolean;
  compact?: boolean;
}

export function YearSelector({
  loadedYears,
  onLoadPreviousYear,
  hasMoreYears,
  isFetchingYear,
  compact = false,
}: YearSelectorProps) {
  const nextYearToLoad =
    loadedYears.length > 0
      ? Math.min(...loadedYears) - 1
      : new Date().getFullYear();

  return (
    <YearSelectorContainer compact={compact}>
      {loadedYears.map((year) => (
        <YearChip key={year} label={year} size="small" compact={compact} />
      ))}
      {hasMoreYears && (
        <LoadYearButton
          onClick={onLoadPreviousYear}
          disabled={isFetchingYear}
          size="small"
          compact={compact}
        >
          {isFetchingYear ? (
            <CircularProgress size={compact ? 12 : 14} sx={{ color: "#FC4C02" }} />
          ) : (
            `+ ${nextYearToLoad}`
          )}
        </LoadYearButton>
      )}
    </YearSelectorContainer>
  );
}
