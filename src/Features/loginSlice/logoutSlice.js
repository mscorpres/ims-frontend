import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { imsAxios } from "../../axiosInterceptor";

export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();

      const existingBranchData =
        JSON.parse(localStorage.getItem("otherData") || "{}") || {};

      const currentLink =
        state.login?.user?.currentLink ??
        existingBranchData?.currentLink ??
        window.location.pathname;

      await imsAxios.post("/auth/logout");

      const branchData = { ...existingBranchData, currentLink };
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("newToken");
      localStorage.removeItem("imsSettings");
      localStorage.removeItem("switchInProgress");
      localStorage.setItem("otherData", JSON.stringify(branchData));
      window.location.replace("/login");
      return true;
    } catch (err) {
      return rejectWithValue(err.message || "Logout failed");
    }
  },
);

const initialState = {
  user: JSON.parse(localStorage.getItem("loggedInUser")) || null,
  loading: false,
  message: "",
  error: null,
};

const logoutSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // (keep other sync reducers here if needed)
  },
  extraReducers: (builder) => {
    builder

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.message = "";
        state.error = null;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.message = "User Logged Out!";
      })

      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default logoutSlice.reducer;
