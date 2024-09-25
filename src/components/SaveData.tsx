import { CircularProgress } from "@mui/material";
import { useActivites } from "../hooks/useActivities";
import { useAuthAthlete } from "../hooks/useAuthAthlete";
import { fireBaseApp, signIn, useAuthUser } from "../hooks/useAuthUser";
import { doc, getFirestore, writeBatch } from "firebase/firestore";
import styled from "@emotion/styled";

const db = getFirestore(fireBaseApp);

const SaveDataDialog = styled("div")(() => ({
  position: "absolute",
  height: "35%",
  width: "100%",
  minWidth: "350px",
  backgroundColor: "white",
  right: "0px",
  zIndex: 1001,
  boxShadow: "-5px 7px 10px 0px grey",
  boxSizing: "border-box",
  padding: "10px 5px",
  bottom: "0px",
  marginBottom: "10px",
}));

export function SaveData() {
  const { accessToken, status: athleteStatus} = useAuthAthlete();
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
    athleteStatus === "loading" ||
    activityStatus === "loading"
  ) {
    return <CircularProgress size={10} />;
  }

  // TODO success screen
  // TODO Privacy statement
  return (
    <SaveDataDialog>
      <p>
        Do you want to store your data under the following Privacy Policy on our
        servers?
      </p>
      <div onClick={onSaveData}>Store</div>
    </SaveDataDialog>
  );
}
