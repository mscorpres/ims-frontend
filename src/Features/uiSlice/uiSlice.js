import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showNotifications: false,
  showMessageNotifications: false,
  showTickets: false,
  showSetting: false,
  showSwitchModule: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleNotifications: (state) => {
      state.showNotifications = !state.showNotifications;
      if (state.showNotifications) {
        state.showMessageNotifications = false;
      }
    },
    setShowNotifications: (state, action) => {
      state.showNotifications = action.payload;
      if (action.payload) {
        state.showMessageNotifications = false;
      }
    },
    toggleMessageNotifications: (state) => {
      state.showMessageNotifications = !state.showMessageNotifications;
      if (state.showMessageNotifications) {
        state.showNotifications = false;
      }
    },
    setShowMessageNotifications: (state, action) => {
      state.showMessageNotifications = action.payload;
      if (action.payload) {
        state.showNotifications = false;
      }
    },
    setShowTickets: (state, action) => {
      state.showTickets = action.payload;
    },
    setShowSetting: (state, action) => {
      state.showSetting = action.payload;
    },
    setShowSwitchModule: (state, action) => {
      state.showSwitchModule = action.payload;
    },
  },
});

export const {
  toggleNotifications,
  setShowNotifications,
  toggleMessageNotifications,
  setShowMessageNotifications,
  setShowTickets,
  setShowSetting,
  setShowSwitchModule,
} = uiSlice.actions;

export default uiSlice.reducer;

