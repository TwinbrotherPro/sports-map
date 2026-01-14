import styled from "@emotion/styled";

const ActivitySymbolBox = styled("span")(() => ({
    fontSize: "x-large"   
  }));

export function ActivitySymbol({ activityType }: { activityType: string }) {
    switch (activityType.toLowerCase()) {
        case "run":
            return (<ActivitySymbolBox role="img" aria-label="run">🏃</ActivitySymbolBox>);
        case "ride":
            return (<ActivitySymbolBox role="img" aria-label="ride">🚴</ActivitySymbolBox>);
        case "walk":
            return (<ActivitySymbolBox role="img" aria-label="walk">🚶</ActivitySymbolBox>);
        case "hike":
            return (<ActivitySymbolBox role="img" aria-label="hike">🥾</ActivitySymbolBox>);
        case "swim":
            return (<ActivitySymbolBox role="img" aria-label="swim">🏊</ActivitySymbolBox>);
        case "alpineski":
            return (<ActivitySymbolBox role="img" aria-label="alpineski">⛷️</ActivitySymbolBox>);
        case "backcountryski":
            return (<ActivitySymbolBox role="img" aria-label="backcountryski">⛷️</ActivitySymbolBox>);
        case "nordicski":
            return (<ActivitySymbolBox role="img" aria-label="nordicski">⛷️</ActivitySymbolBox>);
        case "snowboard":
            return (<ActivitySymbolBox role="img" aria-label="snowboard">🏂</ActivitySymbolBox>);
        case "iceskate":
            return (<ActivitySymbolBox role="img" aria-label="iceskate">⛸️</ActivitySymbolBox>);
        case "inlineskate":
            return (<ActivitySymbolBox role="img" aria-label="inlineskate">⛸️</ActivitySymbolBox>);
        case "rollerski":
            return (<ActivitySymbolBox role="img" aria-label="rollerski">⛷️</ActivitySymbolBox>);
        case "canoeing":
            return (<ActivitySymbolBox role="img" aria-label="canoeing">🛶</ActivitySymbolBox>);
        case "kayaking":
            return (<ActivitySymbolBox role="img" aria-label="kayaking">🛶</ActivitySymbolBox>);
        case "rowing":
            return (<ActivitySymbolBox role="img" aria-label="rowing">🚣</ActivitySymbolBox>);
        case "standuppaddling":
            return (<ActivitySymbolBox role="img" aria-label="standuppaddling">🏄</ActivitySymbolBox>);
        case "surfing":
            return (<ActivitySymbolBox role="img" aria-label="surfing">🏄</ActivitySymbolBox>);
        case "kitesurf":
            return (<ActivitySymbolBox role="img" aria-label="kitesurf">🪁</ActivitySymbolBox>);
        case "windsurf":
            return (<ActivitySymbolBox role="img" aria-label="windsurf">🏄</ActivitySymbolBox>);
        case "sail":
            return (<ActivitySymbolBox role="img" aria-label="sail">⛵</ActivitySymbolBox>);
        case "rockclimbing":
            return (<ActivitySymbolBox role="img" aria-label="rockclimbing">🧗</ActivitySymbolBox>);
        case "weighttraining":
            return (<ActivitySymbolBox role="img" aria-label="weighttraining">🏋️</ActivitySymbolBox>);
        case "workout":
            return (<ActivitySymbolBox role="img" aria-label="workout">💪</ActivitySymbolBox>);
        case "crossfit":
            return (<ActivitySymbolBox role="img" aria-label="crossfit">🏋️</ActivitySymbolBox>);
        case "yoga":
            return (<ActivitySymbolBox role="img" aria-label="yoga">🧘</ActivitySymbolBox>);
        case "elliptical":
            return (<ActivitySymbolBox role="img" aria-label="elliptical">🏃</ActivitySymbolBox>);
        case "stairstepper":
            return (<ActivitySymbolBox role="img" aria-label="stairstepper">🪜</ActivitySymbolBox>);
        case "golf":
            return (<ActivitySymbolBox role="img" aria-label="golf">⛳</ActivitySymbolBox>);
        case "soccer":
            return (<ActivitySymbolBox role="img" aria-label="soccer">⚽</ActivitySymbolBox>);
        case "skateboard":
            return (<ActivitySymbolBox role="img" aria-label="skateboard">🛹</ActivitySymbolBox>);
        case "snowshoe":
            return (<ActivitySymbolBox role="img" aria-label="snowshoe">🥾</ActivitySymbolBox>);
        case "ebikeride":
            return (<ActivitySymbolBox role="img" aria-label="ebikeride">🚴</ActivitySymbolBox>);
        case "virtualride":
            return (<ActivitySymbolBox role="img" aria-label="virtualride">🚴</ActivitySymbolBox>);
        case "virtualrun":
            return (<ActivitySymbolBox role="img" aria-label="virtualrun">🏃</ActivitySymbolBox>);
        case "handcycle":
            return (<ActivitySymbolBox role="img" aria-label="handcycle">🚴</ActivitySymbolBox>);
        case "wheelchair":
            return (<ActivitySymbolBox role="img" aria-label="wheelchair">♿</ActivitySymbolBox>);
        case "velomobile":
            return (<ActivitySymbolBox role="img" aria-label="velomobile">🚲</ActivitySymbolBox>);

        default:
            return (<ActivitySymbolBox role="img" aria-label="+1">👍</ActivitySymbolBox>)
    }

}