import styled from "@emotion/styled";

const ActivitySymbolBox = styled("span")(() => ({
    fontSize: "x-large"   
  }));

export function ActivitySymbol({ activityType }: { activityType: string }) {
    switch (activityType.toLowerCase()) {
        case "hike":
            return (<ActivitySymbolBox role="img" aria-label="hike">🏃</ActivitySymbolBox>);
        case "ride":
            return (<ActivitySymbolBox role="img" aria-label="ride">🚴‍♀️</ActivitySymbolBox>);
        case "run":
            return (<ActivitySymbolBox role="img" aria-label="run">🏃</ActivitySymbolBox>);
        case "walk":
            return (<ActivitySymbolBox role="img" aria-label="walk">🚶‍♀️</ActivitySymbolBox>);
        case "alpineski":
            return (<ActivitySymbolBox role="img" aria-label="alpineski">⛷️</ActivitySymbolBox>);
        case "canoeing":
            return (<ActivitySymbolBox role="img" aria-label="canoeing">🚣‍♀️</ActivitySymbolBox>);

        default:
            return (<ActivitySymbolBox role="img" aria-label="+1">👍</ActivitySymbolBox>)
    }

}