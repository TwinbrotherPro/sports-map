import * as functions from "firebase-functions";
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { devSecret, prodSecret } from "./credentials";
import axios, { AxiosRequestConfig } from "axios";
import { ATHLETE_PATH, STRAVA_BASE_PATH } from "./config";
import { getFirestore } from "firebase-admin/firestore";
import { v4 } from "uuid";

admin.initializeApp();
const db = getFirestore();

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
exports.tokenExchangeSecondGen = onRequest({ cors: true }, async (req, res) => {
  // Call strava /athlete
  const config: AxiosRequestConfig = {
    baseURL: STRAVA_BASE_PATH,
    headers: { Authorization: `${req.get("Authorization")}` },
    method: "get",
  };

  try {
    const response = await axios.get(`/${ATHLETE_PATH}`, config);

    const usefulData = {
      stravaId: response.data.id,
      name: `${response.data.firstname} ${response.data.lastname}`,
      photoUrl: response.data.profile || "",
    };

    console.log(response.status, response.data); // TODO remove once not needed anymore

    // Check if user exists
    const usersRef = db.collection("users");
    const snapshot = await usersRef
      .where("stravaId", "==", usefulData.stravaId)
      .get();
    let httpStatus;
    let uuid;
    if (snapshot.empty) {
      uuid = await createUser(
        usefulData.stravaId,
        usefulData.photoUrl,
        usefulData.name
      );
      httpStatus = 201;
    } else {
      uuid = snapshot.docs[0].id;
      httpStatus = 200;
    }

    const customToken = await admin.auth().createCustomToken(uuid);
    res.status(httpStatus).json({ customToken }).send();
  } catch (error: any) {
    if (
      axios.isAxiosError(error) &&
      error.response &&
      error.response.status === 401
    ) {
      res.status(401).send();
    } else {
      res.status(500).send();
    }
  }
});

async function createUser(stravaId: string, photoUrl: string, name: string) {
  const uuid = v4();

  // Create user in auth
  await admin.auth().createUser({
    photoURL: photoUrl,
    uid: uuid,
  });

  // Create user in db
  const userRef = db.collection("users").doc(uuid);
  await userRef.set({
    photoURL: photoUrl,
    stravaId,
    name,
  });

  return uuid;
}
