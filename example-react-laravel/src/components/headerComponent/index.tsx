import React from "react";
import { Box, Button, Container } from "@mui/material";
import { makeStyles } from "@mui/styles";
import { useNavigate } from "react-router-dom";

const useStyles = makeStyles({
  link: {
    display: "block",
    fontSize: 24,
    textDecoration: "none",
    color: "black",
    "&:hover": {
      color: "white",
    },
  },
});

interface IProps {
  isAuth: boolean;
}

const HeaderComponent = ({ isAuth }: IProps) => {
  const classes = useStyles();
  const navigate = useNavigate();

  const handleLogout = () => {};

  return (
    <Box
      sx={{
        backgroundColor: "#66c0db",
        height: 70,
      }}
    >
      <Container fixed>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: 70,
            justifyContent: "space-between",
          }}
        >
          <a href="/" className={classes.link}>
            Home
          </a>
          {isAuth ? (
            <Button
              variant="outlined"
              sx={{
                color: "black",
              }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          ) : (
            <Button
              variant="outlined"
              sx={{
                color: "black",
              }}
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default HeaderComponent;
