import {
  BottomNavigation,
  BottomNavigationAction,
  makeStyles,
} from "@material-ui/core";
import { QueryClient, QueryClientProvider } from "react-query";
import { Route, Router, Switch } from "react-router";
import { createBrowserHistory } from "history";
import AddActivityButton from "./AddActivityButton";
import "./App.css";
import compatibleWithStrava from "./misc/api_logo_cptblWith_strava_horiz_gray.svg";
import GithubIcon from "@material-ui/icons/GitHub";
import InfoIcon from "@material-ui/icons/Info";
import SettingsBackupRestoreIcon from "@material-ui/icons/SettingsBackupRestore";
import { useState } from "react";

const queryClient = new QueryClient();

const useStyles = makeStyles({
  app: {
    height: "100%",
    boxShadow: "3",
    backgroundColor: "#f0f0f0",
    display: "flex",
    flexDirection: "column",
  },
  footer: {},
  banner: {
    alignItems: "right",
  },
});

function App() {
  const classes = useStyles();

  const customHistory = createBrowserHistory();

  const [navigationValue, setNavigationValue] = useState(0);

  return (
    <div className={classes.app}>
      <QueryClientProvider client={queryClient}>
        <Router history={customHistory}>
          <Switch>
            <Route path="/">
              <AddActivityButton />
            </Route>
          </Switch>
        </Router>
        <BottomNavigation
          value={navigationValue}
          className={classes.footer}
          showLabels
          onChange={(_, newValue) => {
            switch (newValue) {
              case 0:
                setNavigationValue(newValue);
                customHistory.push("/");
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
            }
          }}
        >
          <BottomNavigationAction
            label="Home"
            icon={<SettingsBackupRestoreIcon />}
          />
          <BottomNavigationAction label="About" icon={<InfoIcon />} />
          <BottomNavigationAction label="Code" icon={<GithubIcon />} />
        </BottomNavigation>
        <div className={classes.banner}>
          <img
            src={compatibleWithStrava}
            style={{ height: "40px", float: "right" }}
            alt="compatibleWithStrava"
          />
        </div>
      </QueryClientProvider>
    </div>
  );
}

export default App;
