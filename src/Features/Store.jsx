import { configureStore } from "@reduxjs/toolkit";
import login from "./loginSlice/loginSlice.js";

export const Store = configureStore({
  reducer: {
    login: login,
  },
});
