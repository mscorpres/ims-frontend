import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// @ts-ignore
import { imsAxios } from "../../../axiosInterceptor";

type Option = { label: string; value: string };

type CommonState = {
  // Vendor data
  vendorOptions: Option[];
  vendorLoading: boolean;
  vendorError?: string;

  // Cost center data
  costCenterOptions: Option[];
  costCenterLoading: boolean;
  costCenterError?: string;

  // Project data
  projectOptions: Option[];
  projectLoading: boolean;
  projectError?: string;

  // User data
  userOptions: Option[];
  userLoading: boolean;
  userError?: string;

  // Branch data
  branchOptions: Option[];
  branchLoading: boolean;
  branchError?: string;
};

const initialState: CommonState = {
  vendorOptions: [],
  vendorLoading: false,
  vendorError: undefined,

  costCenterOptions: [],
  costCenterLoading: false,
  costCenterError: undefined,

  projectOptions: [],
  projectLoading: false,
  projectError: undefined,

  userOptions: [],
  userLoading: false,
  userError: undefined,

  branchOptions: [],
  branchLoading: false,
  branchError: undefined,
};

// Async thunks for fetching common data
export const fetchVendors = createAsyncThunk<Option[], string>(
  "common/fetchVendors",
  async (query: string) => {
    const { data } = await imsAxios.get(`/backend/vendor/options`, {
      params: { q: query },
    });
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.map((v: any) => ({
      label: v.label ?? v.name,
      value: v.value ?? v.id,
    }));
  }
);

export const fetchCostCenters = createAsyncThunk<Option[], string>(
  "common/fetchCostCenters",
  async (query: string) => {
    const { data } = await imsAxios.get(`/backend/costcenter/options`, {
      params: { q: query },
    });
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.map((v: any) => ({
      label: v.label ?? v.name,
      value: v.value ?? v.id,
    }));
  }
);

export const fetchProjects = createAsyncThunk<Option[], string>(
  "common/fetchProjects",
  async (query: string) => {
    const { data } = await imsAxios.get(`/backend/project/options`, {
      params: { q: query },
    });
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.map((v: any) => ({
      label: v.label ?? v.name,
      value: v.value ?? v.id,
    }));
  }
);

export const fetchUsers = createAsyncThunk<Option[], string>(
  "common/fetchUsers",
  async (query: string) => {
    const { data } = await imsAxios.get(`/backend/user/options`, {
      params: { q: query },
    });
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.map((v: any) => ({
      label: v.label ?? v.name,
      value: v.value ?? v.id,
    }));
  }
);

export const fetchBranches = createAsyncThunk<Option[], string>(
  "common/fetchBranches",
  async (query: string) => {
    const { data } = await imsAxios.get(`/backend/branch/options`, {
      params: { q: query },
    });
    const list = Array.isArray(data?.data) ? data.data : [];
    return list.map((v: any) => ({
      label: v.label ?? v.name,
      value: v.value ?? v.id,
    }));
  }
);

const commonSlice = createSlice({
  name: "common",
  initialState,
  reducers: {
    clearVendorOptions: (state) => {
      state.vendorOptions = [];
    },
    clearCostCenterOptions: (state) => {
      state.costCenterOptions = [];
    },
    clearProjectOptions: (state) => {
      state.projectOptions = [];
    },
    clearUserOptions: (state) => {
      state.userOptions = [];
    },
    clearBranchOptions: (state) => {
      state.branchOptions = [];
    },
  },
  extraReducers: (builder) => {
    // Vendor reducers
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.vendorLoading = true;
        state.vendorError = undefined;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.vendorLoading = false;
        state.vendorOptions = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.vendorLoading = false;
        state.vendorError = action.error.message;
      })

      // Cost center reducers
      .addCase(fetchCostCenters.pending, (state) => {
        state.costCenterLoading = true;
        state.costCenterError = undefined;
      })
      .addCase(fetchCostCenters.fulfilled, (state, action) => {
        state.costCenterLoading = false;
        state.costCenterOptions = action.payload;
      })
      .addCase(fetchCostCenters.rejected, (state, action) => {
        state.costCenterLoading = false;
        state.costCenterError = action.error.message;
      })

      // Project reducers
      .addCase(fetchProjects.pending, (state) => {
        state.projectLoading = true;
        state.projectError = undefined;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.projectLoading = false;
        state.projectOptions = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.projectLoading = false;
        state.projectError = action.error.message;
      })

      // User reducers
      .addCase(fetchUsers.pending, (state) => {
        state.userLoading = true;
        state.userError = undefined;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.userLoading = false;
        state.userOptions = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.userLoading = false;
        state.userError = action.error.message;
      })

      // Branch reducers
      .addCase(fetchBranches.pending, (state) => {
        state.branchLoading = true;
        state.branchError = undefined;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.branchLoading = false;
        state.branchOptions = action.payload;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.branchLoading = false;
        state.branchError = action.error.message;
      });
  },
});

export const {
  clearVendorOptions,
  clearCostCenterOptions,
  clearProjectOptions,
  clearUserOptions,
  clearBranchOptions,
} = commonSlice.actions;

export default commonSlice.reducer;

