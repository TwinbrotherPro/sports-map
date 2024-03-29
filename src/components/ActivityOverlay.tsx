import { Fade, IconButton, Modal } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FavoriteBorder } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";
import { useState } from "react";
import { useAuthAthlete } from "../hooks/useAuthAthlete";
import { useGetDetailedActivity } from "../hooks/useGetDetailedActivity";

const PREFIX = "ActivityOverlay";

const classes = {
  overlay: `${PREFIX}-overlay`,
  closeIcon: `${PREFIX}-closeIcon`,
  headline: `${PREFIX}-headline`,
  heading: `${PREFIX}-heading`,
  favorites: `${PREFIX}-favorites`,
  favoritesIcon: `${PREFIX}-favoritesIcon`,
  stravaBackLink: `${PREFIX}-stravaBackLink`,
  primaryImage: `${PREFIX}-primaryImage`,
  details: `${PREFIX}-details`,
  stats: `${PREFIX}-stats`,
  modalImg: `${PREFIX}-modalImg`,
};

const Root = styled("div")(() => ({
  [`&.${classes.overlay}`]: {
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
    ["@media (min-width:700px)"]: {
      width: "350px",
      height: "100%",
    },
    display: "flex",
    flexDirection: "column",
  },

  [`& .${classes.closeIcon}`]: {
    position: "absolute",
    pading: "5px",
    float: "left",
  },

  [`& .${classes.headline}`]: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    color: "#FC4C02",
    borderBottom: "2px solid #FC4C02",
    margin: "8px 0",
    paddingBottom: "8px",
    justifyContent: "center",
  },

  [`& .${classes.heading}`]: {
    marginRight: "5px",
  },

  [`& .${classes.favorites}`]: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    color: "#FC4C02 ",
    opacity: "0.7",
  },

  [`& .${classes.favoritesIcon}`]: {
    marginRight: "2px",
  },

  [`& .${classes.stravaBackLink}`]: {
    "& a:link, a:visited": {
      color: "#FC4C02",
      textDecoration: "none",
    },
    "& a:hover": {
      color: "#ca3e02",
      textDecoration: "none",
    },
    marginTop: "15px",
  },

  [`& .${classes.primaryImage}`]: {
    width: "50%",
    ["@media (min-width:700px)"]: {
      width: "330px",
      maxHeight: "330px",
      marginTop: "5px",
      height: "100%",
    },
    maxWidth: "100%",
    objectFit: "cover",
    overflow: "hidden",
    borderRadius: "10px",
    boxShadow: "0px 0px 5px #333333",
  },

  [`& .${classes.details}`]: {
    ["@media (min-width:700px)"]: {
      flexDirection: "column",
    },
    textAlign: "center",
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
    flex: "1",
  },

  [`& .${classes.stats}`]: {
    ["@media (min-width:700px)"]: {
      width: "100%",
    },
    width: "50%",
    margin: "auto",
  },
}));

const ModalImg = styled("img")({
  margin: "auto",
  left: "0",
  right: "0",
  top: "0",
  bottom: "0",
  position: "absolute",
});

export function ActivityOverlay({
  activity,
  setCurrentActivityIndex,
}: {
  activity?: {
    id: string;
    name: string;
    kudosCount: number;
    startDate: Date;
    distance: number;
    elapsedTime: number;
    type: string;
  };
  setCurrentActivityIndex;
}) {
  const { accessToken, status } = useAuthAthlete();
  const { detailedActivity, activityStatus, error } = useGetDetailedActivity(
    activity.id,
    accessToken
  );

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const handleClose = () => setModalIsOpen(false);
  const handleClick = () => setModalIsOpen(!modalIsOpen); // TODO Find better way to handle open and close

  return (
    <Root className={classes.overlay}>
      <IconButton
        className={classes.closeIcon}
        onClick={() => {
          setCurrentActivityIndex(null);
        }}
        size="large"
      >
        <CloseIcon />
      </IconButton>
      <div className={classes.headline}>
        <div className={classes.heading}>{activity.name}</div>
        <div className={classes.favorites}>
          <FavoriteBorder
            className={classes.favoritesIcon}
            fontSize="inherit"
          />
          <div>{activity.kudosCount}</div>
        </div>
      </div>
      <div className={classes.details}>
        <div className={classes.stats}>
          <div>Type: {activity.type}</div>
          <div>
            Start: {moment(activity.startDate).format("DD.MM.YYYY hh:mm A")}
          </div>
          <div>
            {Number.parseFloat((activity.distance / 1000).toString()).toFixed(
              2
            )}{" "}
            km
          </div>
          <div>
            {Number.parseFloat((activity.elapsedTime / 60).toString()).toFixed(
              1
            )}{" "}
            minutes
          </div>
          {detailedActivity && (
            <div>
              Total elevation: {detailedActivity.total_elevation_gain} m
            </div>
          )}
          {detailedActivity && <div>{detailedActivity.description}</div>}
        </div>
        {detailedActivity && detailedActivity.photos.count > 0 && (
          <div
            className={classes.primaryImage}
            style={{
              backgroundImage:
                "url(" + detailedActivity.photos.primary.urls["600"] + ")",
            }}
            onClick={handleClick}
          >
            <Modal
              open={modalIsOpen}
              onClose={handleClose}
              closeAfterTransition
            >
              <Fade in={modalIsOpen}>
                <ModalImg
                  src={detailedActivity.photos.primary.urls["600"]}
                  className={classes.modalImg}
                />
              </Fade>
            </Modal>
          </div>
        )}
      </div>
      <div className={classes.stravaBackLink}>
        <a
          href={`https://www.strava.com/activities/${activity.id}`}
          target="_blank"
        >
          View on Strava
        </a>
      </div>
    </Root>
  );
}
