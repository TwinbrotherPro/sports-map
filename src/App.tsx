import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import {
  createTheme,
  styled,
  ThemeProvider,
  responsiveFontSizes,
} from "@mui/material/styles";
import GithubIcon from "@mui/icons-material/GitHub";
import InfoIcon from "@mui/icons-material/Info";
import LoyalityIcon from "@mui/icons-material/Loyalty";
import SettingsBackupRestoreIcon from "@mui/icons-material/SettingsBackupRestore";
import { lazy, Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { Credits } from "./credits/Credits";
import compatibleWithStrava from "./misc/api_logo_cptblWith_strava_horiz_gray.svg"; // FIX tsc error?

const PREFIX = "App";

const classes = {
  app: `${PREFIX}-app`,
  footer: `${PREFIX}-footer`,
  banner: `${PREFIX}-banner`,
};

const Root = styled("div")({
  [`&.${classes.app}`]: {
    height: "100%",
    boxShadow: "3",
    backgroundColor: "#f0f0f0",
    display: "flex",
    flexDirection: "column",
  },
  [`& .${classes.footer}`]: {},
  [`& .${classes.banner}`]: {
    alignItems: "right",
    backgroundColor: "white",
  },
});

const queryClient = new QueryClient();

let theme = createTheme();
theme = responsiveFontSizes(theme);

const bottomNavigationList = ["/", "/about", "/github", "/credits"];

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [navigationValue, setNavigationValue] = useState(
    bottomNavigationList.findIndex((element) => element === location.pathname)
  );

  const AddActivityButton = lazy(() => import("./AddActivityButton"));

  return (
    //<div>Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a></div>
    <ThemeProvider theme={theme}>
      <Root className={classes.app}>
        <div className={classes.banner}>
          <img
            src={compatibleWithStrava}
            width="247px"
            height="40px"
            style={{ height: "40px", float: "right" }}
            alt="compatibleWithStrava"
          />
        </div>
        <QueryClientProvider client={queryClient}>
          <Routes>
            <Route
              path="/"
              element={
                <Suspense fallback={<div>Loading ...</div>}>
                  <AddActivityButton />
                </Suspense>
              }
            />
            <Route path="/credits" element={<Credits />} />
          </Routes>
          <BottomNavigation
            value={navigationValue}
            className={classes.footer}
            showLabels
            onChange={(_, newValue) => {
              switch (newValue) {
                case 0:
                  setNavigationValue(newValue);
                  navigate("/");
                  break;
                case 1:
                  setNavigationValue(-1);
                  window.open("https://philippkraus.me", "_blank");
                  break;
                case 2:
                  setNavigationValue(-1);
                  window.open(
                    "https://github.com/TwinbrotherPro/sports-map",
                    "_blank"
                  );
                  break;
                case 3:
                  setNavigationValue(newValue);
                  navigate("/credits");
                  break;
              }
            }}
          >
            <BottomNavigationAction
              label="Home"
              icon={<SettingsBackupRestoreIcon />}
            />
            <BottomNavigationAction label="About" icon={<InfoIcon />} />
            <BottomNavigationAction label="Code" icon={<GithubIcon />} />
            <BottomNavigationAction label="Credits" icon={<LoyalityIcon />} />
          </BottomNavigation>
        </QueryClientProvider>
      </Root>
    </ThemeProvider>
  );
}

export default App;
