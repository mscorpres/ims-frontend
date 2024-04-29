import axios from "axios";
import React, { useState } from "react";
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
import { getComponentOptions } from "../../../../api/general";
import useApi from "../../../../hooks/useApi.ts";
export default function AddDCComponents({
  newGatePass,
  setActiveTab,
  detailsResetFunction,
  setSuccessPage,
  setPageLoading,
}) {
  const [rows, setRows] = useState([
    {
      id: v4(),
      component: "",
      qty: 0,
      uom: "",
      rate: 0,
      hsn: "",
      description: "",
    },
  ]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { executeFun, loading: loading1 } = useApi();
  const getComponents = async (searchInput) => {
    if (searchInput.length > 2) {
      // setSelectLoading(true);
      // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: searchInput,
      // });
      // setSelectLoading(false);
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
      const { data } = await imsAxios.post(
        "/component/getComponentDetailsByCode",
        {
          component_code: value.value,
        }
      );
      let validatedData = validateResponse(data);
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
    if (newGatePass.passType == "") {
      return toast.error("Please select Pass Type");
    } else if (newGatePass.vendorName == "") {
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
      } else if (row.rate == "" || row.rate == 0) {
        validate = "Component rate should be more than 0";
      }
    });
    if (validate) {
      return toast.error(validate);
    }
    let final = {
      trans_type: "DC",
      vendor: {
        passtype: newGatePass.passType,
        vendorname: newGatePass.vendorName.value,
        vendorbranch: newGatePass.vendorBranch,
        vendoraddress: newGatePass.vendorAddress,
      },
      bill: {
        billaddressid: newGatePass.billingId,
        billaddress: newGatePass.billinAddress,
      },
      other: {
        terms_of_payment: newGatePass.paymentTerms,
        reference_no_dt: newGatePass.referenceDate,
        other_reference: newGatePass.otherReferences,
        buyer_order_no: newGatePass.buyerOrderNumber,
        dispatch_doc_no: newGatePass.dispatchDocNumber,
        dispatch_through: newGatePass.dispatch_through,
        destination: newGatePass.destination,
        terms_of_delivery: newGatePass.deliveryTerms,
        vehicle_no: newGatePass.vehicleNumber,
        narration: newGatePass.narration,
      },
      material: {
        component: rows.map((row) => row.component.value),
        qty: rows.map((row) => row.qty),
        rate: rows.map((row) => row.rate),
        hsncode: rows.map((row) => row.hsn),
        remark: rows.map((row) => row.description ?? ""),
      },
    };

    setShowSubmitConfirm(final);
  };
  const submitHandler = async () => {
    if (showSubmitConfirm) {
      setSubmitLoading(true);
      const { data } = await imsAxios.post(
        "/gatepass/createGatePass",
        showSubmitConfirm
      );
      setSubmitLoading(false);
      if (data.code == 200) {
        detailsResetFunction();
        resetFunction();
        let successInfo = {
          id: data.data.txn,
          components: rows,
          vendorName: newGatePass.vendorName.label,
        };
        setSuccessPage(successInfo);
      } else {
        toast.error(data.message.msg);
      }
    }
    setShowSubmitConfirm(false);
  };
  const resetFunction = () => {
    setRows([
      {
        id: v4(),
        component: "",
        qty: 0,
        uom: "",
        rate: 0,
        hsn: "",
        description: "",
      },
    ]);
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
      // sortable: false,
    },
    {
      headerName: "Component",
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
      flex: 1,
      renderCell: ({ row }) =>
        inputComponent({
          row: row,
          inputHandler: inputHandler,
          value: "rate",
        }),
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
          // disabled: true,
        }),
    },
    {
      headerName: "Value",
      field: "value",
      flex: 1,
      renderCell: ({ row }) =>
        inputComponent({
          row: row,
          value: row.rate * row.qty,
          disabled: true,
          type: "calculated",
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
        title="Confirm Create Delivery Challan!"
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
        <p>Are you sure you want to generate this Delivery Challan?</p>
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
          Challan?
        </p>
      </Modal>
      <FormTable columns={columns} data={rows} />
      <NavFooter
        nextLabel="Create"
        resetFunction={() => setShowResetConfirm(true)}
        backFunction={() => setActiveTab("1")}
        submitFunction={validateData}
      />
    </div>
  );
}
