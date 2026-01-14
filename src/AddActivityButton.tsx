import { Fade } from "@mui/material";
import { styled } from "@mui/material/styles";
import Dashboard from "./Dashboard";
import { AuthenticatedPage } from "./components/AuthenticatedPage";

const StyledFade = styled(Fade)({});

function AddActivityButton() {
  return (
    <AuthenticatedPage description="Shows your activities of the last year on a global map visualisation.">
      {({ activities, athlete, nextPage, hasNextPage, isFetchingNextPage }) => (
        <StyledFade timeout={100000}>
          <Dashboard
            activities={activities}
            athlete={athlete}
            setNextPage={nextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />
        </StyledFade>
      )}
    </AuthenticatedPage>
  );
}

export default AddActivityButton;
