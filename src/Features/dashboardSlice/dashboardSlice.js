import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { imsAxios } from "../../axiosInterceptor";

const initialState = {
  summaryDate: "",
  masterSummary: [
    { title: "Components", value: "", date: "", link: "/material" },
    { title: "Products", value: "", date: "", link: "/masters/products/fg" },
    {
      title: "Projects",
      value: "",
      date: "",
      link: "/master/reports/projects",
    },
    { title: "Vendors", value: "", date: "", link: "/vendor" },
  ],
  transactionSummary: [
    { title: "Rejection", date: "", value: "" },
    { title: "MFG", date: "", value: "" },
    { title: "Consumption", date: "", value: "" },
    { title: "Purchase Orders", value: "", link: "/manage-po" },
  ],
  gatePassSummary: [
    { title: "Gatepass", value: "", date: "" },
    { title: "RGP", value: "", date: "" },
    { title: "NRGP", value: "", date: "" },
    { title: "Challan", value: "" },
  ],
  minSummary: [
    { title: "PO MIN", value: "", date: "", key: "poMin" },
    { title: "Without PO MIN", value: "", date: "", key: "withoutPoMin" },
    { title: "JW MIN", value: "", date: "", key: "jwMin" },
  ],
  pendingTransactionSummary: [
    { title: "Pending PO", value: "" },
    { title: "Pending JW PO", value: "" },
    { title: "Pending PPR", value: "" },
    { title: "Pending FG", value: "" },
    { title: "Pending MR Approval", value: "" },
  ],
  mfgProducts: [],
  loading: {
    master: false,
    transactions: false,
    gatePass: false,
    min: false,
    pendingSummary: false,
  },
  error: null,
};

export const fetchMasterSummary = createAsyncThunk(
  "dashboard/fetchMasterSummary",
  async (_, { rejectWithValue }) => {
    try {
      const response = await imsAxios.post("/tranCount/master_counts");
      const { data } = response;
      if (data?.code === 200) {
        return [
          {
            title: "Components",
            value: data.data.totalComponents,
            date: data.data.lastComponent,
            link: "/material",
          },
          {
            title: "Products",
            value: data.data.totalProducts,
            date: data.data.lastProduct,
            link: "/masters/products/fg",
          },
          {
            title: "Projects",
            date: data.data.lastProject,
            value: data.data.totalProjects,
            link: "/master/reports/projects",
          },
          {
            title: "Vendors",
            date: data.data.lastVendor,
            value: data.data.totalVendors,
            link: "/vendor",
          },
        ];
      }
      return rejectWithValue(
        data?.message?.msg || "Failed to load master summary"
      );
    } catch (e) {
      return rejectWithValue("Failed to load master summary");
    }
  }
);

export const fetchTransactionsSummary = createAsyncThunk(
  "dashboard/fetchTransactionsSummary",
  async (date, { rejectWithValue }) => {
    try {
      const response = await imsAxios.post(
        `/tranCount/transaction_counts/transaction`,
        { data: date }
      );
      const { data } = response;
      if (data?.code === 200) {
        return [
          {
            title: "Rejection",
            value: data.data.totalRejection,
            date: data.data.lastRejection,
          },
          { title: "MFG", value: data.data.totalMFG, date: data.data.lastMFG },
          {
            title: "Consumption",
            value: data.data.totalConsumption,
            date: data.data.lastConsumption,
          },
          {
            title: "Purchase Orders",
            value: data.data.totalPO,
            date: data.data.lastPO,
            link: "/manage-po",
          },
        ];
      }
      return rejectWithValue(
        data?.message?.msg || "Failed to load transactions"
      );
    } catch (e) {
      return rejectWithValue("Failed to load transactions");
    }
  }
);

export const fetchGatePassSummary = createAsyncThunk(
  "dashboard/fetchGatePassSummary",
  async (date, { rejectWithValue }) => {
    try {
      const response = await imsAxios.post(`/tranCount/transaction_counts/GP`, {
        data: date,
      });
      const { data } = response;
      if (data?.code === 200) {
        return [
          { title: "Gatepass", value: data.data.totalGatePass },
          { title: "RGP", date: data.data.lastRGP, value: data.data.totalRGP },
          {
            title: "NRGP",
            date: data.data.lastNRGP,
            value: data.data.totalNRGP,
          },
          {
            title: "Challan",
            date: data.data.lastDCchallan,
            value: data.data.totalRGP_DCchallan,
          },
        ];
      }
      return rejectWithValue(data?.message?.msg || "Failed to load gate pass");
    } catch (e) {
      return rejectWithValue("Failed to load gate pass");
    }
  }
);

export const fetchMinSummary = createAsyncThunk(
  "dashboard/fetchMinSummary",
  async (date, { rejectWithValue }) => {
    try {
      const response = await imsAxios.post(
        `/tranCount/transaction_counts/MIN`,
        { data: date }
      );
      const { data } = response;
      if (data?.code === 200) {
        return [
          {
            title: "PO MIN",
            date: data.data.lastMin,
            value: data.data.totalPOMin,
          },
          {
            title: "Without PO MIN",
            date: data.data.lastNormalMin,
            value: data.data.totalNormalMIN,
          },
          {
            title: "JW MIN",
            date: data.data.lastJWMin,
            value: data.data.totalJWMin,
            key: "jwMin",
          },
        ];
      }
      return rejectWithValue(data?.message?.msg || "Failed to load MIN");
    } catch (e) {
      return rejectWithValue("Failed to load MIN");
    }
  }
);

export const fetchPendingSummary = createAsyncThunk(
  "dashboard/fetchPendingSummary",
  async (date, { rejectWithValue }) => {
    try {
      const response = await imsAxios.post(`/tranCount/pending_counts`, {
        data: date,
      });
      const { data } = response;
      if (data?.code === 200) {
        return [
          { title: "Pending PO", value: data.data.pendingPO },
          { title: "Pending JW PO", value: data.data.pendingJW_PO },
          { title: "Pending PPR", value: data.data.pendingPPR },
          { title: "Pending FG", value: data.data.pendingFG },
          { title: "Pending MR Approval", value: data.data.pendingMRapproval },
        ];
      }
      return rejectWithValue(
        data?.message?.msg || "Failed to load pending summary"
      );
    } catch (e) {
      return rejectWithValue("Failed to load pending summary");
    }
  }
);

export const fetchMfgProducts = createAsyncThunk(
  "dashboard/fetchMfgProducts",
  async (date, { rejectWithValue }) => {
    try {
      const response = await imsAxios.post(`/tranCount/top_mfg_products`, {
        data: date,
      });
      const { data } = response;
      if (data?.code === 200) {
        return (data.data.topProducts || []).map((item) => ({
          sku: item.productSku,
          qty: item.totalmfgQuantity,
          product: item.productName,
        }));
      }
      return rejectWithValue(
        data?.message?.msg || "Failed to load mfg products"
      );
    } catch (e) {
      return rejectWithValue("Failed to load mfg products");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setSummaryDate(state, action) {
      state.summaryDate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMasterSummary.pending, (state) => {
        state.loading.master = true;
      })
      .addCase(fetchMasterSummary.fulfilled, (state, action) => {
        state.loading.master = false;
        state.masterSummary = action.payload;
      })
      .addCase(fetchMasterSummary.rejected, (state, action) => {
        state.loading.master = false;
        state.error = action.payload;
      })

      .addCase(fetchTransactionsSummary.pending, (state) => {
        state.loading.transactions = true;
      })
      .addCase(fetchTransactionsSummary.fulfilled, (state, action) => {
        state.loading.transactions = false;
        state.transactionSummary = action.payload;
      })
      .addCase(fetchTransactionsSummary.rejected, (state, action) => {
        state.loading.transactions = false;
        state.error = action.payload;
      })

      .addCase(fetchGatePassSummary.pending, (state) => {
        state.loading.gatePass = true;
      })
      .addCase(fetchGatePassSummary.fulfilled, (state, action) => {
        state.loading.gatePass = false;
        state.gatePassSummary = action.payload;
      })
      .addCase(fetchGatePassSummary.rejected, (state, action) => {
        state.loading.gatePass = false;
        state.error = action.payload;
      })

      .addCase(fetchMinSummary.pending, (state) => {
        state.loading.min = true;
      })
      .addCase(fetchMinSummary.fulfilled, (state, action) => {
        state.loading.min = false;
        state.minSummary = action.payload;
      })
      .addCase(fetchMinSummary.rejected, (state, action) => {
        state.loading.min = false;
        state.error = action.payload;
      })

      .addCase(fetchPendingSummary.pending, (state) => {
        state.loading.pendingSummary = true;
      })
      .addCase(fetchPendingSummary.fulfilled, (state, action) => {
        state.loading.pendingSummary = false;
        state.pendingTransactionSummary = action.payload;
      })
      .addCase(fetchPendingSummary.rejected, (state, action) => {
        state.loading.pendingSummary = false;
        state.error = action.payload;
      })

      .addCase(fetchMfgProducts.fulfilled, (state, action) => {
        state.mfgProducts = action.payload || [];
      });
  },
});

export const { setSummaryDate } = dashboardSlice.actions;
export default dashboardSlice.reducer;
