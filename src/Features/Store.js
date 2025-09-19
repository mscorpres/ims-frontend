import { configureStore } from "@reduxjs/toolkit";
import login from "./loginSlice/loginSlice";
import dashboard from "./dashboardSlice/dashboardSlice";
import createPo from "../new/features/procurement/POSlice";

export const Store = configureStore({
  reducer: {
    login: login,
    dashboard: dashboard,
    createPo: createPo,
  },
});
