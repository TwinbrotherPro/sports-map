const NODE_ENV = process.env["NODE_ENV"];

function getConfig() {
  console.log(NODE_ENV);
  return {
    stravaLink:
      NODE_ENV === "development"
        ? "https://www.strava.com/oauth/authorize?client_id=59296&response_type=code&redirect_uri=http://localhost:3000/&approval_prompt=force&scope=activity:read_all"
        : "https://www.strava.com/oauth/authorize?client_id=58846&response_type=code&redirect_uri=https://strava-dashboard-368b0.web.app/&approval_prompt=force&scope=activity:read_all",

    stravaAuth: (code) => {
      return NODE_ENV === "development"
        ? `https://us-central1-strava-dashboard-368b0.cloudfunctions.net/stravaproxy/dev/oauth/token?client_id=59296&client_secret=NONE&code=${code}&grant_type=authorization_code`
        : `https://us-central1-strava-dashboard-368b0.cloudfunctions.net/stravaproxy/oauth/token?client_id=58846&client_secret=NONE&code=${code}&grant_type=authorization_code`;
    },
  };
}

export default getConfig;
