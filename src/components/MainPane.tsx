import { Box, Paper, styled } from "@mui/material";
import { Suspense, PropsWithChildren } from "react";

const AuthorizeBox = styled(Paper)({
  textAlign: "center",
  padding: "10px",
  height: "70%",
  display: "flex",
  flex: "auto",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
  maxWidth: "75%",
});

export function MainPane({ children }: PropsWithChildren<{}>) {
  return (
    <Suspense fallback={<div>Loading ...</div>}>
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <AuthorizeBox elevation={3}>{children}</AuthorizeBox>
      </Box>
    </Suspense>
  );
}
