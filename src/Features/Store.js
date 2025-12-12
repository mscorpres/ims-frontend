import { configureStore } from "@reduxjs/toolkit";
import login from "./loginSlice/loginSlice";
import dashboard from "./dashboardSlice/dashboardSlice";
import ui from "./uiSlice/uiSlice";

export const Store = configureStore({
  reducer: {
    login: login,
    dashboard: dashboard,
    ui: ui,
  },
});
