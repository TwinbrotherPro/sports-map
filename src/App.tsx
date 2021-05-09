import {
  BottomNavigation,
  BottomNavigationAction,
  makeStyles,
} from "@material-ui/core";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Route, Router, Switch } from "react-router";
import { createBrowserHistory } from "history";
import AddActivityButton from "./AddActivityButton";
import "./App.css";
import compatibleWithStrava from "./misc/api_logo_cptblWith_strava_horiz_gray.svg";
import RestoreIcon from "@material-ui/icons/Restore";

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
        <BottomNavigation value="Recents" className={classes.footer} showLabels>
          <BottomNavigationAction label="Recents" icon={<RestoreIcon />} />
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
