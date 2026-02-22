export const getAuth = () => {
  const data = localStorage.getItem("auth");
  return data ? JSON.parse(data) : null;
};

export const getToken = () => {
  const auth = getAuth();
  return auth?.token || null;
};

export const getRole = () => {
  const auth = getAuth();
  return auth?.role || null;
};

export const logoutUser = () => {
  localStorage.removeItem("auth");
};
