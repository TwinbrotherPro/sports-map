import { initializeApp, FirebaseOptions } from "firebase/app";
import { getAuth, signInWithCustomToken } from "firebase/auth";

import getConfig from "../config/config";
import { useQuery } from '@tanstack/react-query';

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyBHc_cV0u0BlbIMU9HBw1CsbWaZupHW0p0",
  authDomain: "strava-dashboard-368b0.firebaseapp.com",
  databaseURL:
    "https://strava-dashboard-368b0-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "strava-dashboard-368b0",
  storageBucket: "strava-dashboard-368b0.appspot.com",
  messagingSenderId: "432310382933",
  appId: "1:432310382933:web:d78d8aff13af4759333fdc",
};

export const fireBaseApp = initializeApp(firebaseConfig);

export function useAuthUser(stravaToken?: string) {
  const { data, status } = useQuery({
    queryKey: ["userAuth"],
    queryFn: async () => {
      const endpoint = getConfig().tokenExchange;
      const request: RequestInfo = new Request(new URL(endpoint), {
        method: "GET",
        headers: new Headers({ Authorization: "Bearer " + stravaToken }),
      });

      const response = await fetch(request);
      const body = await response.json();
      return body.customToken;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled: !!stravaToken,
  });

  return { userToken: data, status };
}

export async function signIn(userToken: string) {
  const auth = getAuth();
  const response = await signInWithCustomToken(auth, userToken);
  console.log(response.user.uid);
  return response.user;
}
