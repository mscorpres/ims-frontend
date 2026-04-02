import { configureStore } from "@reduxjs/toolkit";
import login from "./loginSlice/loginSlice";
import logoutSlice from "./loginSlice/logoutSlice";

export const Store = configureStore({
  reducer: {
    login: login,
    logout: logoutSlice,
  },
});
