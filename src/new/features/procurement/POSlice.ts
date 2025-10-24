import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// @ts-ignore
import { imsAxios } from "../../../axiosInterceptor";
import { ManagePOTableType } from "../../pages/procurement/POType";
import {
  Address,
  Item,
  POState,
  Vendor,
} from "@/new/features/procurement/POType";

export const initialState: any = {
  vendor: null,
  loading: false,
  billTo: { line1: "" },
  shipTo: { line1: "" },
  items: [],
  poType: "N",
  vendorType: "v01",
  managePOList: [],
  managePOLoading: false,

  // Action states
  printLoading: false,
  downloadLoading: false,
  componentData: null,
  componentLoading: false,
  poLogs: [],
  poLogsLoading: false,
  poDetails: null,
  poDetailsLoading: false,
  showCancelPO: null,
  showViewSidebar: false,
  showUploadDoc: null,
  showEditPO: null,

  // Action loading states
  actionLoading: {
    print: false,
    download: false,
    cancel: false,
    view: false,
    edit: false,
    upload: false,
  },

  // Edit PO Modal states
  vendorOptions: [],
  costCenterOptions: [],
  billingAddresses: [],
  shippingAddresses: [],
  vendorBranches: [],
  vendorAddress: null,
  billingAddress: null,
  shippingAddress: null,
  vendorOptionsLoading: false,
  costCenterOptionsLoading: false,
  billingAddressesLoading: false,
  shippingAddressesLoading: false,
  vendorBranchesLoading: false,
  vendorAddressLoading: false,
  billingAddressLoading: false,
  shippingAddressLoading: false,
  updatePOLoading: false,
};

export const submitPo = createAsyncThunk<void, void>(
  "po/submitPo",
  async (_, { getState }) => {
    const st = (getState() as any).po as POState;
    await imsAxios.post(`/backend/po/create`, {
      vendorId: st.vendor?.id,
      remarks: st.vendor?.remarks,
    });
  }
);

export const fetchManagePO = createAsyncThunk<
  ManagePOTableType[],
  { data: any; wise: string }
>("po/fetchManagePO", async (payload: { data: any; wise: string }) => {
  console.log(payload);
  const { data } = await imsAxios.post(`/purchaseOrder/fetchPendingData4PO`, {
    data: payload.data,
    wise: payload.wise,
  });
  return data.data;
});
export const fetchCompletedPO = createAsyncThunk<
  any[],
  { data: any; wise: string }
>("po/fetchCompletedPO", async (payload: { data: any; wise: string }) => {

  const { data } = await imsAxios.post(`/purchaseOrder/fetchCompletePO`, {
    data: payload.data,
    wise: payload.wise,
  });
  return data.data;
});

export const printPO = createAsyncThunk<string, string>(
  "po/printPO",
  async (poid: string) => {
    const { data } = await imsAxios.post("/poPrint", { poid });
    return data.data.buffer.data;
  }
);

export const downloadPO = createAsyncThunk<string, string>(
  "po/downloadPO",
  async (poid: string) => {
    const { data } = await imsAxios.post("/poPrint", { poid });
    return data.data.buffer.data;
  }
);

export const checkPOStatus = createAsyncThunk<string, string>(
  "po/checkPOStatus",
  async (poid: string) => {
    const { data } = await imsAxios.post("/purchaseOrder/fetchStatus4PO", {
      purchaseOrder: poid,
    });
    if (data.code === 200) {
      return poid;
    } else {
      throw new Error("PO is already cancelled");
    }
  }
);

export const fetchComponentData = createAsyncThunk<
  any,
  { poid: string; status: string }
>("po/fetchComponentData", async ({ poid, status }) => {
  const { data } = await imsAxios.post("/purchaseOrder/fetchComponentList4PO", {
    poid,
  });
  if (data.code === 200) {
    const components = data.data.map((row: any, index: number) => ({
      ...row,
      id: index,
    }));
    return { poid, components, status };
  } else {
    throw new Error(data.message);
  }
});



export const fetchPOLogs = createAsyncThunk<any[], string>(
  "po/fetchPOLogs",
  async (po_id: string) => {
    const { data } = await imsAxios.post("/purchaseOthers/pologs", { po_id });
    if (data.code === "200" || data.code === 200) {
      return data.data.reverse();
    } else {
      throw new Error("Failed to fetch PO logs");
    }
  }
);

export const fetchPODetails = createAsyncThunk<any, string>(
  "po/fetchPODetails",
  async (poid: string) => {
    const { data, message } = await imsAxios.post(
      "/purchaseOrder/fetchData4Update",
      {
        pono: poid.replaceAll("_", "/"),
      }
    );
    if (data?.code === 200) {
      return {
        ...data.data.bill,
        materials: data.data.materials,
        ...data.data.ship,
        ...data.data.vendor[0],
      };
    } else {
      throw new Error(data?.message || message);
    }
  }
);

// Edit PO Modal API calls
export const fetchVendorOptions = createAsyncThunk<any[], string>(
  "po/fetchVendorOptions",
  async (search: string) => {
    const { data } = await imsAxios.post("/backend/vendorList", { search });
    return data.map((vendor: any) => ({
      label: vendor.text,
      value: vendor.id,
    }));
  }
);

export const fetchCostCenterOptions = createAsyncThunk<any[], string>(
  "po/fetchCostCenterOptions",
  async (search: string) => {
    const { data } = await imsAxios.post("/backend/costCenterList", { search });
    return data.map((center: any) => ({
      label: center.text,
      value: center.id,
    }));
  }
);

export const fetchBillingAddresses = createAsyncThunk<any[], void>(
  "po/fetchBillingAddresses",
  async () => {
    const { data } = await imsAxios.post("/backend/billingAddressList", {
      search: "",
    });
    return data.map((d: any) => ({
      text: d.text,
      value: d.id,
    }));
  }
);

export const fetchShippingAddresses = createAsyncThunk<any[], void>(
  "po/fetchShippingAddresses",
  async () => {
    const { data } = await imsAxios.post("/backend/shipingAddressList", {
      searchInput: "",
    });
    return data.map((d: any) => ({
      text: d.text,
      value: d.id,
    }));
  }
);

export const fetchVendorBranches = createAsyncThunk<any[], string>(
  "po/fetchVendorBranches",
  async (vendorCode: string) => {
    const { data } = await imsAxios.post("/backend/vendorBranchList", {
      vendorcode: vendorCode,
    });
    if (data.code === 200) {
      return data.data.map((row: any) => ({
        text: row.text,
        value: row.id,
      }));
    } else {
      throw new Error(data.message.msg);
    }
  }
);

export const fetchVendorAddress = createAsyncThunk<
  any,
  { vendorcode: string; branchcode: string }
>("po/fetchVendorAddress", async ({ vendorcode, branchcode }) => {
  const { data } = await imsAxios.post("backend/vendorAddress", {
    vendorcode,
    branchcode,
  });
  if (data.code === 200) {
    return {
      address: data.data.address.replaceAll("<br>", "\n"),
      gstin: data.data.gstin,
      pan: data.data.pan,
    };
  } else {
    throw new Error(data.message.msg);
  }
});

export const fetchBillingAddress = createAsyncThunk<any, string>(
  "po/fetchBillingAddress",
  async (billingCode: string) => {
    const { data } = await imsAxios.post("/backend/billingAddress", {
      billing_code: billingCode,
    });
    return {
      gstin: data?.data?.gstin,
      pan: data?.data?.pan,
      address: data.data?.address.replaceAll("<br>", "\n"),
    };
  }
);

export const fetchShippingAddress = createAsyncThunk<any, string>(
  "po/fetchShippingAddress",
  async (shippingCode: string) => {
    const { data } = await imsAxios.post("/backend/shippingAddress", {
      shipping_code: shippingCode,
    });
    return {
      gstin: data?.data.gstin,
      pan: data?.data.pan,
      address: data.data?.address.replaceAll("<br>", "\n"),
    };
  }
);

// Update PO Data - Save API from EditPO.jsx
export const updatePOData = createAsyncThunk<any, any>(
  "po/updatePOData",
  async (poData: any) => {
    const { data } = await imsAxios.post(
      "/purchaseOrder/updateData4Update",
      poData
    );
    if (data.code === 200) {
      return { success: true, message: data.message, data: data.data };
    } else {
      throw new Error(data.message || "Failed to update PO");
    }
  }
);

const slice = createSlice({
  name: "po",
  initialState,
  reducers: {
    setVendor(state, action: PayloadAction<Vendor>) {
      state.vendor = action.payload;
    },
    setField(state, action: PayloadAction<{ key: keyof POState; value: any }>) {
      // @ts-ignore
      state[action.payload.key] = action.payload.value;
    },
    setBillTo(state, action: PayloadAction<Address>) {
      state.billTo = action.payload;
    },
    setShipTo(state, action: PayloadAction<Address>) {
      state.shipTo = action.payload;
    },
    addItem(state, action: PayloadAction<Item>) {
      state.items.push(action.payload);
    },
    updateItem(
      state,
      action: PayloadAction<{ id: string; patch: Partial<Item> }>
    ) {
      const idx = state.items.findIndex((i:any) => i.id === action.payload.id);
      if (idx >= 0)
        state.items[idx] = {
          ...state.items[idx],
          ...action.payload.patch,
        } as Item;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i:any) => i.id !== action.payload);
    },
    // Action handlers
    setShowCancelPO(state, action: PayloadAction<string | null>) {
      state.showCancelPO = action.payload;
    },
    setShowViewSidebar(state, action: PayloadAction<boolean>) {
      state.showViewSidebar = action.payload;
    },
    setShowUploadDoc(state, action: PayloadAction<string | null>) {
      state.showUploadDoc = action.payload;
    },
    setShowEditPO(state, action: PayloadAction<any>) {
      state.showEditPO = action.payload;
    },
    clearComponentData(state) {
      state.componentData = null;
      state.poLogs = [];
    },
    // Action loading reducers
    setActionLoading(
      state,
      action: PayloadAction<{
        action: keyof POState["actionLoading"];
        loading: boolean;
      }>
    ) {
      state.actionLoading[action.payload.action] = action.payload.loading;
    },
    // Modal management - close all modals when opening a new one
    closeAllModals(state) {
      state.showCancelPO = null;
      state.showViewSidebar = false;
      state.showUploadDoc = null;
      state.showEditPO = null;
    },
  },
  extraReducers(builder) {
    builder
      // Fetch Manage PO
        .addCase(fetchCompletedPO.pending, (state) => {
        state.completedPOLoading = true;
        state.completedPOList = [];
      })
      .addCase(fetchCompletedPO.fulfilled, (state, action) => {
        state.completedPOLoading = false;
        state.completedPOList = action.payload;
      })
      .addCase(fetchCompletedPO.rejected, (state) => {
        state.completedPOLoading = false;
        state.completedPOList = [];
      })
      .addCase(fetchManagePO.pending, (state) => {
        state.managePOLoading = true;
        state.managePOList = [];
      })
      .addCase(fetchManagePO.fulfilled, (state, action) => {
        state.managePOLoading = false;
        state.managePOList = action.payload;
      })
      .addCase(fetchManagePO.rejected, (state) => {
        state.managePOLoading = false;
        state.managePOList = [];
      })
      // Print PO
      .addCase(printPO.pending, (state) => {
        state.printLoading = true;
      })
      .addCase(printPO.fulfilled, (state) => {
        state.printLoading = false;
      })
      .addCase(printPO.rejected, (state) => {
        state.printLoading = false;
      })
      // Download PO
      .addCase(downloadPO.pending, (state) => {
        state.downloadLoading = true;
      })
      .addCase(downloadPO.fulfilled, (state) => {
        state.downloadLoading = false;
      })
      .addCase(downloadPO.rejected, (state) => {
        state.downloadLoading = false;
      })
      // Check PO Status
      .addCase(checkPOStatus.fulfilled, (state, action) => {
        state.showCancelPO = action.payload;
      })
      // Fetch Component Data
      .addCase(fetchComponentData.pending, (state) => {
        state.componentLoading = true;
      })
      .addCase(fetchComponentData.fulfilled, (state, action) => {
        state.componentLoading = false;
        state.componentData = action.payload;
        state.showViewSidebar = true;
      })
      .addCase(fetchComponentData.rejected, (state) => {
        state.componentLoading = false;
      })
      // Fetch PO Logs
      .addCase(fetchPOLogs.pending, (state) => {
        state.poLogsLoading = true;
      })
      .addCase(fetchPOLogs.fulfilled, (state, action) => {
        state.poLogsLoading = false;
        state.poLogs = action.payload;
      })
      .addCase(fetchPOLogs.rejected, (state) => {
        state.poLogsLoading = false;
      })
      // Fetch PO Details
      .addCase(fetchPODetails.pending, (state) => {
        state.poDetailsLoading = true;
      })
      .addCase(fetchPODetails.fulfilled, (state, action) => {
        state.poDetailsLoading = false;
        state.showEditPO = action.payload;
      })
      .addCase(fetchPODetails.rejected, (state) => {
        state.poDetailsLoading = false;
      })
      // Fetch Vendor Options
      .addCase(fetchVendorOptions.pending, (state) => {
        state.vendorOptionsLoading = true;
      })
      .addCase(fetchVendorOptions.fulfilled, (state, action) => {
        state.vendorOptionsLoading = false;
        state.vendorOptions = action.payload;
      })
      .addCase(fetchVendorOptions.rejected, (state) => {
        state.vendorOptionsLoading = false;
      })
      // Fetch Cost Center Options
      .addCase(fetchCostCenterOptions.pending, (state) => {
        state.costCenterOptionsLoading = true;
      })
      .addCase(fetchCostCenterOptions.fulfilled, (state, action) => {
        state.costCenterOptionsLoading = false;
        state.costCenterOptions = action.payload;
      })
      .addCase(fetchCostCenterOptions.rejected, (state) => {
        state.costCenterOptionsLoading = false;
      })
      // Fetch Billing Addresses
      .addCase(fetchBillingAddresses.pending, (state) => {
        state.billingAddressesLoading = true;
      })
      .addCase(fetchBillingAddresses.fulfilled, (state, action) => {
        state.billingAddressesLoading = false;
        state.billingAddresses = action.payload;
      })
      .addCase(fetchBillingAddresses.rejected, (state) => {
        state.billingAddressesLoading = false;
      })
      // Fetch Shipping Addresses
      .addCase(fetchShippingAddresses.pending, (state) => {
        state.shippingAddressesLoading = true;
      })
      .addCase(fetchShippingAddresses.fulfilled, (state, action) => {
        state.shippingAddressesLoading = false;
        state.shippingAddresses = action.payload;
      })
      .addCase(fetchShippingAddresses.rejected, (state) => {
        state.shippingAddressesLoading = false;
      })
      // Fetch Vendor Branches
      .addCase(fetchVendorBranches.pending, (state) => {
        state.vendorBranchesLoading = true;
      })
      .addCase(fetchVendorBranches.fulfilled, (state, action) => {
        state.vendorBranchesLoading = false;
        state.vendorBranches = action.payload;
      })
      .addCase(fetchVendorBranches.rejected, (state) => {
        state.vendorBranchesLoading = false;
      })
      // Fetch Vendor Address
      .addCase(fetchVendorAddress.pending, (state) => {
        state.vendorAddressLoading = true;
      })
      .addCase(fetchVendorAddress.fulfilled, (state, action) => {
        state.vendorAddressLoading = false;
        state.vendorAddress = action.payload;
      })
      .addCase(fetchVendorAddress.rejected, (state) => {
        state.vendorAddressLoading = false;
      })
      // Fetch Billing Address
      .addCase(fetchBillingAddress.pending, (state) => {
        state.billingAddressLoading = true;
      })
      .addCase(fetchBillingAddress.fulfilled, (state, action) => {
        state.billingAddressLoading = false;
        state.billingAddress = action.payload;
      })
      .addCase(fetchBillingAddress.rejected, (state) => {
        state.billingAddressLoading = false;
      })
      // Fetch Shipping Address
      .addCase(fetchShippingAddress.pending, (state) => {
        state.shippingAddressLoading = true;
      })
      .addCase(fetchShippingAddress.fulfilled, (state, action) => {
        state.shippingAddressLoading = false;
        state.shippingAddress = action.payload;
      })
      .addCase(fetchShippingAddress.rejected, (state) => {
        state.shippingAddressLoading = false;
      })
      // Update PO Data
      .addCase(updatePOData.pending, (state) => {
        state.updatePOLoading = true;
      })
      .addCase(updatePOData.fulfilled, (state, action) => {
        state.updatePOLoading = false;
        state.showEditPO = null; // Close the edit modal on success
      })
      .addCase(updatePOData.rejected, (state) => {
        state.updatePOLoading = false;
      });
  },
});

export const {
  setVendor,
  setField,
  setBillTo,
  setShipTo,
  addItem,
  updateItem,
  removeItem,
  setShowCancelPO,
  setShowViewSidebar,
  setShowUploadDoc,
  setShowEditPO,
  clearComponentData,
  setActionLoading,
  closeAllModals,
} = slice.actions;
export default slice.reducer;
