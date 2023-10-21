import { CircularProgress } from "@mui/material";
import { useActivites } from "../hooks/useActivities";
import { useAuthAthlete } from "../hooks/useAuthAthlete";
import { fireBaseApp, signIn, useAuthUser } from "../hooks/useAuthUser";
import { doc, getFirestore, writeBatch } from "firebase/firestore";

const db = getFirestore(fireBaseApp);

export function SaveData() {
  const { accessToken, status: athleteStatus } = useAuthAthlete();
  const { userToken } = useAuthUser(accessToken);
  const { activities, activityStatus } = useActivites(accessToken);

  const onSaveData = async () => {
    const user = await signIn(userToken);

    const batch = writeBatch(db);
    activities.forEach((activity) => {
      batch.set(
        doc(db, "users", user.uid, "activities", `${activity.id}`),
        activity
      );
    });
    await batch.commit();
  };

  // TODO gray out until data is loaded
  if (
    athleteStatus === "idle" ||
    athleteStatus === "loading" ||
    activityStatus === "idle" ||
    activityStatus === "loading"
  ) {
    return <CircularProgress size={10} />;
  }

  return <div onClick={onSaveData}>Save Data</div>;
}
