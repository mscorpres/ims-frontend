import { useState, useEffect } from "react";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import {
  asyncSelectComponent,
  inputComponent,
} from "../../../../Components/TableInput";
import { v4 } from "uuid";
import FormTable from "../../../../Components/FormTable";
import NavFooter from "../../../../Components/NavFooter";
import { toast } from "react-toastify";
import { Button, Modal } from "antd";
import validateResponse from "../../../../Components/validateResponse";
import { imsAxios } from "../../../../axiosInterceptor";
import MySelect from "../../../../Components/MySelect";
import { getComponentOptions, getProductsOptions } from "../../../../api/general.ts";
import useApi from "../../../../hooks/useApi.ts";

const materialTypeOptions = [
  { text: "Component", value: "component" },
  { text: "Product", value: "product" },
];

const mapMaterialToRow = (row) => ({
  id: row.id ?? v4(),
  component: {
    value: row.item?.item_id,
    label: row.item?.part_code
      ? `${row.item.part_code} - (${row.item.item_name})`
      : row.item?.item_name,
  },
  qty: row.qty,
  rate: row.rate,
  pickup: row.from_location
    ? {
        value: row.from_location.from_location_key,
        label: row.from_location.from_location_name,
      }
    : "",
  drop: row.to_location
    ? {
        value: row.to_location.to_location_key,
        label: row.to_location.to_location_name,
      }
    : "",
  hsn: row.hsn,
  uom: row.unit?.name,
  description: row.item_description ?? "",
});

export default function EditBranchTransferComponents({
  transId,
  setTransId,
  newGatePass,
  resetData,
  setActiveTab,
  setPageLoading,
  pickuplocs,
  droplocs,
  onSuccess,
}) {
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [materialType, setMaterialType] = useState("component");
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { executeFun, loading: loading1 } = useApi();

  useEffect(() => {
    if (newGatePass.components) {
      setRows(newGatePass.components.map(mapMaterialToRow));
    }
  }, [newGatePass.components]);

  useEffect(() => {
    if (newGatePass.transferType) {
      setMaterialType(newGatePass.transferType);
    }
  }, [newGatePass.transferType]);

  const getComponents = async (searchInput) => {
    if (searchInput.length > 2) {
      if (materialType === "product") {
        const response = await executeFun(
          () => getProductsOptions(searchInput),
          "select"
        );
        setAsyncOptions(Array.isArray(response?.data) ? response?.data : []);
        return;
      }
      const response = await executeFun(
        () => getComponentOptions(searchInput),
        "select"
      );
      const { data } = response;
      let arr = [];
      if (!data.msg) {
        arr = data.map((d) => {
          return { text: d.text, value: d.id };
        });
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
      }
    }
  };
  const inputHandler = async (name, value, id) => {
    let arr = rows;
    if (name == "component") {
      setPageLoading(true);
      let validatedData;
      if (materialType === "product") {
        const response = await imsAxios.post("/fgOUT/fetchProductData", {
          search: value.value,
        });
        if (response?.success) {
          validatedData = {
            data: {
              rate: response.data.war,
              unit: response.data.unit,
              hsn: response.data.hsn,
            },
          };
        } else {
          setPageLoading(false);
          return toast.error(response?.message);
        }
      } else {
        const { data } = await imsAxios.post(
          "/component/getComponentDetailsByCode",
          {
            component_code: value.value,
          }
        );
        validatedData = validateResponse(data);
      }
      setPageLoading(false);
      arr = arr.map((row) => {
        let obj = row;
        if (obj.id == id) {
          obj = {
            ...obj,
            [name]: value,
            rate: validatedData.data.rate,
            uom: validatedData.data.unit,
            hsn: validatedData.data.hsn,
          };
          return obj;
        } else {
          return obj;
        }
      });

      setRows(arr);
    } else {
      arr = arr.map((row) => {
        let obj = row;
        if (obj.id == id) {
          obj = {
            ...obj,
            [name]: value,
          };
          return obj;
        } else {
          return obj;
        }
      });
    }
    setRows(arr);
  };
  const addRows = () => {
    let obj = {
      id: v4(),
      component: "",
      qty: 0,
      uom: "",
      rate: 0,
      pickup: "",
      drop: "",
      hsn: "",
      description: "",
    };
    let arr = rows;
    arr = [obj, ...arr];
    setRows(arr);
  };
  const removeRows = (id) => {
    let arr = rows.filter((row) => row.id != id);
    setRows(arr);
  };
  const validateData = () => {
    let validate = false;
    if (newGatePass.vendorName == "") {
      return toast.error("Please select a Vendor");
    } else if (newGatePass.vendorBranch == "") {
      return toast.error("Please select a Vendor Branch");
    } else if (newGatePass.billingId == "") {
      return toast.error("Please select a Billing Address");
    } else if (newGatePass.vehicleNumber == "") {
      return toast.error("Please enter a Vehicle Number");
    }
    rows.map((row) => {
      if (row.component == "") {
        validate = "Please select a component for all the material entries";
      } else if (row.qty == "" || row.qty == 0) {
        validate = "Quantity of a component should be more than 0";
      }
    });
    if (validate) {
      return toast.error(validate);
    }
    let final = {
      trans_id: transId,
      header: {
        vendor: newGatePass.vendorName.key ?? newGatePass.vendorName.value,
        vendor_branch: newGatePass.vendorBranch,
        vendor_address: newGatePass.vendorAddress,
        mode: newGatePass.paymentTerms,
        reference_no: newGatePass.referenceDate,
        other_term: newGatePass.otherReferences,
        dispatch_doc_no: newGatePass.dispatchDocNumber,
        dispatch_through: newGatePass.dipatchThrough,
        destination: newGatePass.destination,
        term_of_delivery: newGatePass.deliveryTerms,
        vehicle_no: newGatePass.vehicleNumber,
        narration: newGatePass.narration,
        billing_id: newGatePass.billingId,
        billing_address: newGatePass.billinAddress,
        transferType: materialType,
      },
      materials: {
        component: rows.map((row) => row.component.value),
        qty: rows.map((row) => row.qty),
        rate: rows.map((row) => row.rate),
        from_location: rows.map((row) => row.pickup?.value),
        to_location: rows.map((row) => row.drop?.value),
        hsn: rows.map((row) => row.hsn),
        item_description: rows.map((row) => row.description ?? ""),
      },
    };

    setShowSubmitConfirm(final);
  };
  const submitHandler = async () => {
    if (showSubmitConfirm) {
      setSubmitLoading(true);
      const { data } = await imsAxios.post(
        "/branchTransfer/editBranchTransfer",
        showSubmitConfirm
      );
      setSubmitLoading(false);
      if (data.code == 200) {
        toast.success(data.message);
        setShowSubmitConfirm(false);
        setTransId(null);
        onSuccess?.();
        return;
      } else {
        toast.error(data.message.msg);
      }
    }
    setShowSubmitConfirm(false);
  };
  const resetFunction = () => {
    setRows((resetData.components ?? []).map(mapMaterialToRow));
    setShowResetConfirm(false);
  };
  const columns = [
    {
      headerName: <CommonIcons action="addRow" onClick={addRows} />,
      width: 40,
      field: "add",
      sortable: false,
      renderCell: ({ row }) =>
        rows.indexOf(row) >= 1 && (
          <CommonIcons action="removeRow" onClick={() => removeRows(row?.id)} />
        ),
    },
    {
      headerName: materialType === "product" ? "Product" : "Component",
      field: "component",
      width: 300,
      renderCell: ({ row }) =>
        asyncSelectComponent({
          row: row,
          inputHandler: inputHandler,
          loadOptions: getComponents,
          setAsyncOptions: setAsyncOptions,
          asyncOptions: asyncOptions,
          selectLoading: loading1("select"),
          value: row.component,
        }),
    },
    {
      headerName: "Qty",
      field: "qty",
      width: 150,
      renderCell: ({ row }) =>
        inputComponent({
          row: row,
          inputHandler: inputHandler,
          value: "qty",
          suffix: row.uom,
        }),
    },
    {
      headerName: "Rate",
      field: "rate",
      width: 120,
      renderCell: ({ row }) =>
        inputComponent({
          row: row,
          value: "rate",
          disabled: true,
        }),
    },
    {
      headerName: "Value",
      field: "value",
      width: 120,
      renderCell: ({ row }) =>
        inputComponent({
          row: row,
          value: row.rate * row.qty,
          disabled: true,
          type: "calculated",
        }),
    },
    {
      headerName: "Pick up Location",
      field: "pickup",
      width: 200,
      renderCell: ({ row }) => (
        <MySelect
          options={pickuplocs}
          labelInValue
          value={row.pickup}
          onChange={(e) => {
            inputHandler("pickup", e, row.id);
          }}
        />
      ),
    },
    {
      headerName: "Drop Location",
      field: "drop",
      width: 200,
      renderCell: ({ row }) => (
        <MySelect
          options={droplocs}
          labelInValue
          value={row.drop}
          onChange={(e) => {
            inputHandler("drop", e, row.id);
          }}
        />
      ),
    },
    {
      headerName: "HSN/SAC",
      field: "hsn",
      flex: 1,
      renderCell: ({ row }) =>
        inputComponent({
          row: row,
          value: "hsn",
          inputHandler: inputHandler,
        }),
    },
    {
      headerName: "Description",
      field: "description",
      width: 350,
      renderCell: ({ row }) =>
        inputComponent({
          row: row,
          value: "description",
          inputHandler: inputHandler,
        }),
    },
  ];
  return (
    <div style={{ height: "90%" }}>
      {/* submit confirm modal */}
      <Modal
        title="Confirm Update Delivery Challan!"
        open={showSubmitConfirm}
        onCancel={() => setShowSubmitConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowSubmitConfirm(false)}>
            No
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={submitHandler}
          >
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure you want to update this Delivery Challan?</p>
      </Modal>
      {/* reset confirm modal */}
      <Modal
        title="Confirm Reset!"
        open={showResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowResetConfirm(false)}>
            No
          </Button>,
          <Button key="submit" type="primary" onClick={resetFunction}>
            Yes
          </Button>,
        ]}
      >
        <p>
          Are you sure you want to reset the components of this Delivery
          Challan to the originally saved values?
        </p>
      </Modal>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ width: 220 }}>
          <MySelect
            options={materialTypeOptions}
            value={materialType}
            onChange={(value) => {
              setMaterialType(value);
              setAsyncOptions([]);
            }}
          />
        </div>
      </div>
      <FormTable columns={columns} data={rows} />
      <NavFooter
        nextLabel="Update"
        resetFunction={() => setShowResetConfirm(true)}
        backFunction={() => setActiveTab("1")}
        submitFunction={validateData}
      />
    </div>
  );
}
