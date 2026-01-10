import styled from "@emotion/styled";

const DeviceBadge = styled("span")<{ bgColor: string }>(({ bgColor }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
  backgroundColor: bgColor,
  color: "white",
  padding: "3px 8px",
  borderRadius: "4px",
  fontSize: "12px",
  fontWeight: 500,
  marginLeft: "4px",
  whiteSpace: "nowrap",
}));

const DeviceEmoji = styled("span")({
  fontSize: "14px",
});

function getDeviceInfo(deviceName: string) {
  const lower = deviceName.toLowerCase();

  if (lower.includes("garmin")) {
    return { brand: "Garmin", color: "#007CC3", emoji: "⌚" };
  }
  if (lower.includes("strava")) {
    return { brand: "Strava", color: "#FC4C02", emoji: "📱" };
  }
  if (lower.includes("apple watch")) {
    return { brand: "Apple", color: "#000000", emoji: "" };
  }
  if (lower.includes("wahoo")) {
    return { brand: "Wahoo", color: "#0099FF", emoji: "🚴" };
  }
  if (lower.includes("polar")) {
    return { brand: "Polar", color: "#ED1B23", emoji: "⌚" };
  }

  // Default - seamless styling
  return { brand: "Other", color: "#666666", emoji: "📱" };
}

export function DeviceLabel({ deviceName }: { deviceName: string }) {
  const { brand, color, emoji } = getDeviceInfo(deviceName);

  return (
    <DeviceBadge bgColor={color}>
      {emoji && (
        <DeviceEmoji role="img" aria-label={brand}>
          {emoji}
        </DeviceEmoji>
      )}
      {deviceName}
    </DeviceBadge>
  );
}
