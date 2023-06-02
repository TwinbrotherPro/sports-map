import styled from "@emotion/styled";

const ProfileBox = styled("div")(() => ({
  margin: "5px",
  opacity: "0.70",
  "& img": {
    borderRadius: "50%",
  },
}));

export function Profile({ athlete }) {
  return (
    <ProfileBox className={"leaflet-top leaflet-right profile"}>
      <img src={athlete.profile} alt="Profile Image" />
    </ProfileBox>
  );
}
