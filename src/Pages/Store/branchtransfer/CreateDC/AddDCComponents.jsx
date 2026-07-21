
import  { useState } from "react";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import {
  asyncSelectComponent,
  inputComponent,
} from "../../../../Components/TableInput";
import { v4 } from "uuid";
import FormTable from "../../../../Components/FormTable";
import NavFooter from "../../../../Components/NavFooter";
import { toast } from "react-toastify";
import { Button, Modal,Upload, Drawer, Card, Row, Col } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import validateResponse from "../../../../Components/validateResponse";
import { imsAxios } from "../../../../axiosInterceptor";
import MySelect from "../../../../Components/MySelect";
import {
  getComponentOptions,
  uploadBranchTransferComponents,
} from "../../../../api/general.ts";
import useApi from "../../../../hooks/useApi.ts";
import MyButton from "../../../../Components/MyButton/index.jsx";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { downloadCSVCustomColumns } from "../../../../Components/exportToCSV.jsx";
import MyDataTable from "../../../../Components/MyDataTable";
export default function AddDCComponents({
  newGatePass,
  setActiveTab,
  detailsResetFunction,
  setPageLoading,
  pickuplocs,
  droplocs,
}) {
  const [rows, setRows] = useState([
    {
      id: v4(),
      component: "",
      qty: 0,
      rate: 0,
      pickup: "",
      drop: "",
      hsn: "",
      description: "",
    },
  ]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [preview, setPreview] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
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
      header: {
        vendor: newGatePass.vendorName.key,
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
      },
      materials: {
        component: rows.map((row) => row.component.value),
        qty: rows.map((row) => row.qty),
        from_location: rows.map((row) => row.pickup?.value ?? row.pickup ),
        to_location: rows.map((row) => row.drop?.value ?? row.drop ),
        hsn: rows.map((row) => row.hsn),
        item_description: rows.map((row) => row.description ?? ""),
        rate: rows.map((row) => row.rate),
      },
    };

    setShowSubmitConfirm(final);
  };

    const sampleData = [
    {
      PART_CODE: "P0054",
      Qty: 21,
      Pick_Location: "RM001",
      Drop_Location: "RM002",
      HSN: 4531234,
      Item_Description: "this is for testing purpose",
    },
  ];
  const callFileUpload = async () => {
    if (fileList.length === 0) {

      toast.error("Please select a file to upload");
        return 
    }
    const formData = new FormData();
    formData.append("file", fileList[0]);
    const response = await executeFun(
      () => uploadBranchTransferComponents(formData),
      "upload"
    );
    if (response?.success) {
      const { headers, rows: dataRows } = response.data;
      const formattedHeaders = headers.map((header) =>
        header
          .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
            index === 0 ? match.toUpperCase() : match.toLowerCase()
          )
          .replace(/\s+/g, "")
      );
      const formattedRows = dataRows.map((row) => {
        let rowObject = {};
        formattedHeaders.forEach((header, index) => {
          rowObject[header] = row[index];
        });
        return rowObject;
      });
      const arr = formattedRows.map((r) => ({
        id: v4(),
        component: r.Partcode
          ? { label: r.Partcode.name, value: r.Partcode.key }
          : "",
        partCodeNo: r.Partcode?.partNo,
        partCodeName: r.Partcode?.name,
        uom: r.Partcode?.uom,
        qty: r.Qty ?? 0,
        pickup: r.Picklocation
          ? { label: r.Picklocation.name, value: r.Picklocation.key }
          : "",
        pickupName: r.Picklocation?.name,
        drop: r.Droplocation
          ? { label: r.Droplocation.name, value: r.Droplocation.key }
          : "",
        dropName: r.Droplocation?.name,
        hsn: r.Hsn ?? "",
        description: r.Itemdescription ?? "",
      }));
      setPreviewRows(arr);
      setPreview(true);
      setShowUploadModal(false);
      setFileList([]);
    } else {
      toast.error(response?.message, "error");
    }
  };
  const importPreviewRows = () => {
    Modal.confirm({
      title: "Are you sure you want to import this data?",
      content: "Please make sure that the values are correct",
      onOk() {
        setRows(previewRows);
        setPreview(false);
        setPreviewRows([]);
      },
    });
  };
  const previewedColumns = [
    {
      headerName: "#",
      field: "id",
      renderCell: ({ row }) => previewRows.indexOf(row) + 1,
      width: 60,
    },
    {
      headerName: "Part Code",
      field: "partCodeNo",
      renderCell: ({ row }) => <ToolTipEllipses text={row.partCodeNo} />,
      minWidth: 110,
    },
    {
      headerName: "Part Name",
      field: "partCodeName",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.partCodeName} copy={true} />
      ),
      minWidth: 250,
      flex: 1,
    },
    {
      headerName: "Qty",
      field: "qty",
      width: 100,
    },
    {
      headerName: "Pick Location",
      field: "pickupName",
      renderCell: ({ row }) => <ToolTipEllipses text={row.pickupName} />,
      minWidth: 160,
    },
    {
      headerName: "Drop Location",
      field: "dropName",
      renderCell: ({ row }) => <ToolTipEllipses text={row.dropName} />,
      minWidth: 160,
    },
    {
      headerName: "HSN",
      field: "hsn",
      width: 110,
    },
    {
      headerName: "Description",
      field: "description",
      minWidth: 200,
      flex: 1,
    },
  ];
  const submitHandler = async () => {
    if (showSubmitConfirm) {
      setSubmitLoading(true);
      const { data } = await imsAxios.post(
        "/branchTransfer/createBranchTransfer",
        showSubmitConfirm
      );
      setSubmitLoading(false);
      if (data.code == 200) {
        detailsResetFunction();
        resetFunction();
        toast.success(data.message);
        setActiveTab("1");
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
        rate: 0,
        pickup: "",
        drop: "",
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
          // disabled: true,
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
        <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 8,
        }}
      >
        <MyButton
          variant="upload"
          text="Upload Excel"
          onClick={() => setShowUploadModal(true)}
        />
      </div>
      <FormTable columns={columns} data={rows} />
      <NavFooter
        nextLabel="Create"
        resetFunction={() => setShowResetConfirm(true)}
        backFunction={() => setActiveTab("1")}
        submitFunction={validateData}
      />
            {/* upload excel modal */}
      <Modal
        title="Upload File Here"
        open={showUploadModal}
        width={500}
        onCancel={() => {
          setShowUploadModal(false);
          setFileList([]);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setShowUploadModal(false);
              setFileList([]);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={loading1("upload")}
            onClick={callFileUpload}
          >
            Preview
          </Button>,
        ]}
      >
        <Card>
          <Upload.Dragger
            name="file"
            multiple={false}
            maxCount={1}
            fileList={fileList}
            beforeUpload={(file) => {
              setFileList([file]);
              return false;
            }}
            onRemove={() => setFileList([])}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
          </Upload.Dragger>
          <Row justify="end" style={{ marginTop: 5 }}>
            <MyButton
              variant="downloadSample"
              onClick={() =>
                downloadCSVCustomColumns(sampleData, "Branch Transfer Components")
              }
            />
          </Row>
        </Card>
      </Modal>
      {/* preview excel data drawer */}
      <Drawer
        width="100%"
        title="Preview Data From Excel"
        placement="right"
        onClose={() => setPreview(false)}
        destroyOnClose={true}
        open={preview}
        bodyStyle={{ padding: 5 }}
      >
        <Row
          style={{ height: "95%", display: "flex", justifyContent: "center" }}
        >
          <Col
            style={{
              height: "90%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
            span={23}
          >
            <MyDataTable
              columns={previewedColumns}
              data={previewRows}
              loading={loading1("upload")}
              headText="center"
            />
          </Col>
          <Row
            span={24}
            style={{
              width: "100%",
              height: "10%",
              display: "flex",
              justifyContent: "end",
            }}
          >
            <NavFooter
              submitFunction={importPreviewRows}
              nextLabel="Submit"
              resetFunction={() => setPreview(false)}
            />
          </Row>
        </Row>
      </Drawer>
    
    </div>
  );
}
