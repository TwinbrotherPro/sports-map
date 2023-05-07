import {
  ButtonBase,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { MainPane } from "../components/MainPane";
import favIcon from "../misc/favicon.png";

const PREFIX = "Credits";
const classes = {};
const StyledMainPane = styled(MainPane)({});

export function Credits() {
  return (
    <StyledMainPane>
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
    </StyledMainPane>
  );
}
