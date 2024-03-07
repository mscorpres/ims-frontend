import { configureStore } from "@reduxjs/toolkit";
import login from "./loginSlice/loginSlice";

export const Store = configureStore({
  reducer: {
    login: login,
  },
});
