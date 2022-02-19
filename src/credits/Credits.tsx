import {
  ButtonBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import { MainPane } from "../components/MainPane";
import favIcon from "../misc/favicon.png";

const useStyles = makeStyles({});

export function Credits() {
  const classes = useStyles();

  return (
    <MainPane>
      <List>
        <ListItem>
          <ListItemIcon>
            <img src={favIcon} alt="Runner" />
          </ListItemIcon>
          <ListItemText>
            <ButtonBase
              onClick={() => {
                window.open(
                  "https://www.flaticon.com/free-icons/run",
                  "_blank"
                );
              }}
            >
              Run icons created by Freepik - Flaticon
            </ButtonBase>
          </ListItemText>
        </ListItem>
      </List>
    </MainPane>
  );
}
