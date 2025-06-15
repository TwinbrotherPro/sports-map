import {
  ButtonBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { MainPane } from "../components/MainPane";
import favIcon from "../misc/favicon.png";


export function Credits() {
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
