import React, { useEffect } from "react";
import { Box, Container } from "@mui/material";
import HeaderComponent from "../../components/headerComponent";
import { Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import { getAccessToken, getRefreshToken } from "../../utils/authService";

const MainLayout = () => {
  const { isAuth, getInfoMe } = useAuth();

  useEffect(() => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    if (!!accessToken && !!refreshToken) {
      getInfoMe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <HeaderComponent isAuth={isAuth} />
      <Container fixed>
        <Outlet />
      </Container>
    </Box>
  );
};

export default MainLayout;
