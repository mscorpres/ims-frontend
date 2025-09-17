import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { imsAxios } from "../../../axiosInterceptor";

type Option = { label: string; value: string };

type Vendor = { id: string; name: string; remarks?: string };
type Address = {
  id?: string;
  line1: string;
  line2?: string;
  city?: string;
  state?: string;
  pin?: string;
};
type Item = {
  id: string;
  sku: string;
  description?: string;
  qty: number;
  uom?: string;
  rate: number;
  amount: number;
};

type CreatePoState = {
  vendor: Vendor | null;
  vendorOptions: Option[];
  loading: boolean;
  error?: string;
  billTo: Address;
  shipTo: Address;
  items: Item[];
  // PO meta
  poType: "N" | "S";
  originalPo?: string;
  vendorType: "j01" | "v01";
  vendorBranch?: string;
  vendorAddress?: string;
  gstin?: string;
  msmeType?: string;
  msmeId?: string;
  // terms
  termsCondition?: string;
  quotationDetail?: string;
  paymentTerms?: string;
  dueDays?: number;
  costCenter?: string;
  projectId?: string;
  projectDesc?: string;
  comments?: string;
  requestedBy?: string;
  advancePayment?: 0 | 1;
  // select option caches
  branchOptions?: Option[];
  billToOptions?: Option[];
  shipToOptions?: Option[];
  costCenterOptions?: Option[];
  projectOptions?: Option[];
  userOptions?: Option[];
};

const initialState: CreatePoState = {
  vendor: null,
  vendorOptions: [],
  loading: false,
  billTo: { line1: "" },
  shipTo: { line1: "" },
  items: [],
  poType: "N",
  vendorType: "v01",
};

export const fetchVendors = createAsyncThunk<Option[], string>(
  "createPo/fetchVendors",
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

export const submitPo = createAsyncThunk<void, void>(
  "createPo/submitPo",
  async (_, { getState }) => {
    const st = (getState() as any).createPo as CreatePoState;
    // Only vendor scaffold for now
    await imsAxios.post(`/backend/po/create`, {
      vendorId: st.vendor?.id,
      remarks: st.vendor?.remarks,
    });
  }
);

const slice = createSlice({
  name: "createPo",
  initialState,
  reducers: {
    setVendor(state, action: PayloadAction<Vendor>) {
      state.vendor = action.payload;
    },
    setField(
      state,
      action: PayloadAction<{ key: keyof CreatePoState; value: any }>
    ) {
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
      const idx = state.items.findIndex((i) => i.id === action.payload.id);
      if (idx >= 0)
        state.items[idx] = {
          ...state.items[idx],
          ...action.payload.patch,
        } as Item;
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.id !== action.payload);
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.loading = false;
        state.vendorOptions = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
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
} = slice.actions;
export default slice.reducer;
