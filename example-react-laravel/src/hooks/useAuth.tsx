import { useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const useAuth = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [infoUser, setUserInfo] = useState({});

  const getInfoMe = async () => {
    try {
      const response = await axiosInstance.get("/me");
      if (response.status === 200) {
        setUserInfo(response.data);
        setIsAuth(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return {
    isAuth,
    infoUser,
    getInfoMe,
  };
};

export default useAuth;
