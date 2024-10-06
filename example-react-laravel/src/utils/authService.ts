export const getAccessToken = () => {
  const accessToken = localStorage.getItem("access-token") || "";
  return accessToken;
};

export const setAccessToken = (token: string) => {
  localStorage.setItem("access-token", token);
};

export const getRefreshToken = () => {
  const refreshToken = localStorage.getItem("refresh-token") || "";
  return refreshToken;
};

export const setRefreshToken = (refreshToken: string) => {
  localStorage.setItem("refresh-token", refreshToken);
};

export const clearAuthToken = () => {
  localStorage.removeItem("access-token");
  localStorage.removeItem("refresh-token");
};
