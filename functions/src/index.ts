import * as functions from "firebase-functions";
import * as express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { devSecret, prodSecret } from "./credentials";

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
