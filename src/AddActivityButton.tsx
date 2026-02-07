import { Fade } from "@mui/material";
import { styled } from "@mui/material/styles";
import Dashboard from "./Dashboard";
import { AuthenticatedPage } from "./components/AuthenticatedPage";

const StyledFade = styled(Fade)({});

function AddActivityButton() {
  return (
    <AuthenticatedPage description="Shows your activities of the last year on a global map visualisation.">
      {({ activities, athlete, loadPreviousYear, hasMoreYears, isFetchingYear, loadedYears }) => (
        <StyledFade timeout={100000}>
          <Dashboard
            activities={activities}
            athlete={athlete}
            loadPreviousYear={loadPreviousYear}
            hasMoreYears={hasMoreYears}
            isFetchingYear={isFetchingYear}
            loadedYears={loadedYears}
          />
        </StyledFade>
      )}
    </AuthenticatedPage>
  );
}

export default AddActivityButton;
