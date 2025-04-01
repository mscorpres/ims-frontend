import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { imsAxios } from "../../axiosInterceptor";
let fav =
  typeof JSON.parse(localStorage.getItem("loggedInUser"))?.favPages == "string"
    ? JSON.parse(JSON.parse(localStorage.getItem("loggedInUser"))?.favPages)
    : JSON.parse(localStorage.getItem("loggedInUser"))?.favPages;

const initialState = {
  user: JSON.parse(localStorage.getItem("loggedInUser"))
    ? {
        ...JSON.parse(localStorage.getItem("loggedInUser")),
        favPages: fav,
        company_branch: JSON.parse(localStorage.getItem("otherData"))
          ?.company_branch,
        session:
          JSON.parse(localStorage.getItem("otherData"))?.session ?? "25-26",
        passwordChanged: "C",
        showlegal:
          JSON.parse(localStorage.getItem("loggedInUser"))?.department ===
          "legal"
            ? true
            : false,
      }
    : null,
  testPages: JSON.parse(localStorage.getItem("otherData"))?.testPages,
  editVBT: JSON.parse(localStorage.getItem("editVBT")),

  notifications: JSON.parse(localStorage.getItem("userNotifications")) ?? [],
  editINV: JSON.parse(localStorage.getItem("editINV")),
  currentLinks: JSON.parse(localStorage.getItem("currentLinks")),
  mobileConfirmed: JSON.parse(localStorage.getItem("loggedInUser"))
    ?.mobileConfirmed,
  emailConfirmed: JSON.parse(localStorage.getItem("loggedInUser"))
    ?.emailConfirmed,
  loading: false,
  token: null,
  message: "",
  userDepartment: "",
  settings: JSON.parse(localStorage.getItem("imsSettings")) ?? null,
};
// export const loginAuth = createAsyncThunk(
//   "auth/login",
//   async (user, thunkAPI) => {
//     try {
//       const { data } = await imsAxios.post("/auth/signin", {
//         username: user.username,
//         password: user.password,
//       });
//       if (data.code == 200) {
//         localStorage.setItem(
//           "loggedInUser",
//           JSON.stringify({
//             userName: data.data.username,
//             token: data.data.token,
//             phone: data.data.crn_mobile,
//             email: data.data.crn_email,
//             department: data.data.department,
//             id: data.data.crn_id,
//             favPages: data.data.fav_pages,
//             type: data.data.crn_type,
//             mobileConfirmed: data.data.other.m_v,
//             emailConfirmed: data.data.other.e_v,
//             passwordChanged: data.data.other.c_p ?? "C",
//             showlegal: data.data.department === "legal" ? true : false,
//             settings: data.data.settings,
//           })
//         );
//         localStorage.setItem(
//           "otherData",
//           JSON.stringify({
//             company_branch: "BRMSC012",
//             session: "23-24",
//             setting: data.data.settings,
//           })
//         );
//         imsAxios.defaults.headers["x-csrf-token"] = data.data.token;
//         imsAxios.defaults.headers["Company-Branch"] = "BRMSC012";
//         return await {
//           ...data.data,
//           session: "23-24",
//           company_branch: "BRMSC012",
//         };
//       } else {
//         return thunkAPI.rejectWithValue(data.message);
//       }
//     } catch (err) {
//       const { message } = err.response.data;
//       return thunkAPI.rejectWithValue(message);
//     }
//   }
// );

const loginSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state, action) => {
      let otherData = JSON.parse(localStorage.getItem("otherData"));
      otherData = { ...otherData, currentLink: state.user.currentLink };
      state.user = null;
      state.message = "User Logged Out!";
      localStorage.removeItem("loggedInUser");
      localStorage.setItem("otherData", JSON.stringify(otherData));
      toast.info("User Logged Out!");
    },
    addNotification: (state, action) => {
      state.notifications = [
        ...state.notifications,
        action.payload.newNotification,
      ];
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (not) => not.conversationId != action.payload.conversationId
      );
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    setUserDepartment: (state, action) => {
      state.userDepartment = action.payload;
    },
    setFavourites: (state, action) => {
      if (state.user != null) {
        state.user = { ...state.user, favPages: action.payload };
        localStorage.setItem(
          "loggedInUser",
          JSON.stringify({
            ...state.user,
            favPages: action.payload,
          })
        );
      }
    },
    setTestPages: (state, action) => {
      let obj = JSON.parse(localStorage.getItem("otherData"));
      // let testPages = obj.testPages;
      state.testPages = action.payload;

      localStorage.setItem(
        "otherData",
        JSON.stringify({
          ...obj,
          testPages: action.payload,
        })
      );
    },
    setCurrentLinks: (state, action) => {
      state.currentLinks = action.payload;

      localStorage.setItem("currentLinks", JSON.stringify(action.payload));
    },
    setCompanyBranch: (state, action) => {
      window.location.reload(true);
      imsAxios.defaults.headers["Company-Branch"] = action.payload;
      // clientAxios.defaults.headers["Company-Branch"] = action.payload;
      let user = state.user;
      user = { ...user, company_branch: action.payload };
      state.user = user;
      localStorage.setItem(
        "otherData",
        JSON.stringify({ company_branch: user.company_branch })
      );
    },
    setSession: (state, action) => {
      // window.location.reload(true);
      imsAxios.defaults.headers["Session"] = action.payload;
      //  Axios.defaults.headers["Session"] = action.payload;
      let user = state.user;
      user = { ...user, session: action.payload };
      state.user = user;
      localStorage.setItem(
        "otherData",
        JSON.stringify({ session: user.session })
      );
    },
    setCurrentLink: (state, action) => {
      state.user = { ...state.user, currentLink: action.payload };
    },
    setUser: (state, action) => {
      let obj = { ...state.user, ...action.payload };
      state.user = obj;
      localStorage.setItem("loggedInUser", JSON.stringify(obj));
      localStorage.setItem(
        "otherData",
        JSON.stringify({
          company_branch: "BRMSC012",
          session: "23-24",
        })
      );
    },
    setSettings: (state, action) => {
      let obj = { ...state.settings, ...action.payload };
      state.settings = obj;
      localStorage.setItem("imsSettings", JSON.stringify(obj));
    },
  },
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(loginAuth.pending, (state) => {
  //       state.user = null;
  //       state.token = null;
  //       state.loading = true;
  //       state.isEditVBT = false;
  //       state.isEditINV = false;
  //     })
  //     .addCase(loginAuth.fulfilled, (state, action) => {
  //       state.user = {
  //         email: action.payload.crn_email,
  //         phone: action.payload.crn_mobile,
  //         userName: action.payload.username,
  //         token: action.payload.token,
  //         favPages: JSON.parse(action.payload.fav_pages),
  //         type: action.payload.crn_type,
  //         mobileConfirmed: action.payload.other.m_v,
  //         emailConfirmed: action.payload.other.e_v,
  //         passwordChanged: action.payload.other.c_p ?? "C",
  //         session: action.payload.session,
  //         company_branch: JSON.parse(localStorage.getItem("otherData"))
  //           ?.company_branch,
  //         currentLink: JSON.parse(localStorage.getItem("otherData"))
  //           ?.currentLink,
  //         id: action.payload.crn_id,
  //         showlegal: action.payload.department === "legal" ? true : false,
  //       };
  //       state.loading = false;
  //       state.message = "User Logged in";
  //     })
  //     .addCase(loginAuth.rejected, (state, action) => {
  //       toast.error(action.payload);
  //       state.message = action.payload;
  //       state.loading = false;
  //     });
  // },
});

export const selectUserDepartment = (state) => state;

export const {
  logout,
  addNotification,
  removeNotification,
  setNotifications,
  setFavourites,
  setTestPages,
  setCurrentLinks,
  setCompanyBranch,
  setCurrentLink,
  setUser,
  setSession,
  setUserDepartment,
  setSettings,
} = loginSlice.actions;
export default loginSlice.reducer;
