import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { devSecret, prodSecret } from "./credentials";
import axios, { AxiosRequestConfig } from "axios";
import { ATHLETE_PATH, STRAVA_BASE_PATH } from "./config";

admin.initializeApp();

const app = express();
const stravaAuthProxy = (secret: string) =>
  createProxyMiddleware({
    target: "https://www.strava.com",
    changeOrigin: true,
    pathRewrite: { "^/dev": "" },
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.path = proxyReq.path.replace("NONE", secret);
    },
  });

app.use("/oauth", stravaAuthProxy(prodSecret));
app.use("/dev/oauth", stravaAuthProxy(devSecret));
exports.stravaproxy = functions.https.onRequest(app);
exports.tokenExchange = functions.https.onRequest(async (req, res) => {
  // Call strava /athlete
  const config: AxiosRequestConfig = {
    baseURL: STRAVA_BASE_PATH,
    headers: { Authorization: `${req.get("Authorization")}` },
    method: "get",
  };

  const response = await axios.get(`/${ATHLETE_PATH}`, config);

  console.log(response.status, response.data);

  // Create user if not yet exists
  await admin.auth().createUser({
    email: "blinddog@hotmail.de",
    photoURL: response.data.profile,
  });

  res.status(200).send();
});
