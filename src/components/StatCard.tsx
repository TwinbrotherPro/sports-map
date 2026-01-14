import { styled } from "@mui/material/styles";

const CardContainer = styled("div")(({ theme }) => ({
  backgroundColor: "white",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "120px",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",

  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15)",
  },
}));

const StatValue = styled("div")({
  fontSize: "32px",
  fontWeight: 700,
  color: "#FC4C02",
  marginBottom: "8px",
  lineHeight: 1,
});

const StatLabel = styled("div")({
  fontSize: "14px",
  fontWeight: 500,
  color: "#666",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  textAlign: "center",
});

const StatSubtext = styled("div")({
  fontSize: "12px",
  color: "#999",
  marginTop: "4px",
});

interface StatCardProps {
  value: string | number;
  label: string;
  subtext?: string;
}

export function StatCard({ value, label, subtext }: StatCardProps) {
  return (
    <CardContainer>
      <StatValue>{value}</StatValue>
      <StatLabel>{label}</StatLabel>
      {subtext && <StatSubtext>{subtext}</StatSubtext>}
    </CardContainer>
  );
}
