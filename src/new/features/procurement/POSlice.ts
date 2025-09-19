import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// @ts-ignore
import { imsAxios } from "../../../axiosInterceptor";
import { ManagePOTableType } from "../../pages/procurement/POType";
import { Address, Item, POState, Vendor } from "@/new/features/procurement/POType";


export const initialState: POState = {
  vendor: null,
  loading: false,
  billTo: { line1: "" },
  shipTo: { line1: "" },
  items: [],
  poType: "N",
  vendorType: "v01",
  managePOList:[],
  managePOLoading:false,
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
  console.log(data)
  return data.data;
});

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
