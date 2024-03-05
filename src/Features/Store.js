import { configureStore } from "@reduxjs/toolkit";
import login from "./loginSlice.js/loginSlice";

export const Store = configureStore({
  reducer: {
    login: login,
  },
});
