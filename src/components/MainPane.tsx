import { Box, makeStyles, Paper } from "@material-ui/core";
import { Suspense, PropsWithChildren } from "react";

export function MainPane({ children }: PropsWithChildren<{}>) {
  const classes = useStyles();

  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <Paper elevation={3} className={classes.authorizeBox}>
          {children}
        </Paper>
      </Box>
    </Suspense>
  );
}

const useStyles = makeStyles({
  authorizeBox: {
    textAlign: "center",
    padding: "10px",
    height: "70%",
    display: "flex",
    flex: "auto",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    maxWidth: "75%",
  },
});
