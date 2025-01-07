import { useState } from "react";
import {
  Drawer,
  Row,
  Col,
  Form,
  Input,
  Card,
  Typography,
  Modal,
  Upload,
  Button,
} from "antd";
import HeaderDetails from "./HeaderDetails";
import { imsAxios } from "../../../../axiosInterceptor";
import { useEffect } from "react";
import Components from "./Components";
import NavFooter from "../../../../Components/NavFooter";
import { toast } from "react-toastify";
import Loading from "../../../../Components/Loading";
import useLoading from "../../../../hooks/useLoading";
import { v4 } from "uuid";
import { InboxOutlined } from "@ant-design/icons";
import MyButton from "../../../../Components/MyButton";
import { downloadCSVCustomColumns } from "../../../../Components/exportToCSV";
import useApi from "../../../../hooks/useApi";
import { uplaodFileInJWReturn } from "../../../../api/general";
import MyDataTable from "../../../../Components/MyDataTable";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import axios from "axios";

const JwReturnModel = ({ show, close }) => {
  const [headerDetails, setHeaderDetails] = useState([]);
  const [loading, setLoading] = useLoading();
  const [totalValue, setTotalValue] = useState(0);
  const [rows, setRows] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [autoConsOptions, setAutoConsumptionOption] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);

  const { executeFun, loading: loading1 } = useApi();
  const [form] = Form.useForm();
  const [uplaodForm] = Form.useForm();
  const sampleData = [
    {
      PART_CODE: "p0001",
      QTY: "1",
      RATE: "12",
      HSN: "123456",
      INVOICE: "1",
      LOCATION: "RM021",
      AUTO_CONSUMP: "Y",
      REMARK: "test",
    },
  ];
  const getLocationOptions = async () => {
    try {
      const { data } = await imsAxios.get("/jobwork/jw_rm_return_location");
      setLoading("fetch", true);
      if (data) {
        const arr = data.data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setLocationOptions(arr);
      }
    } catch (error) {
      console.log("some error while fetching locations", error);
    } finally {
      setLoading("fetch", false);
    }
  };
  const getAutoComnsumptionOptions = async () => {
    // setPageLoading(true);
    let { data } = await imsAxios.get("/transaction/fetchAutoConsumpLocation");
    // setPageLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row) => {
        return {
          value: row.id,
          text: row.text,
        };
      });
      arr = [{ text: "NO", value: "0" }, ...arr];
      setAutoConsumptionOption(arr);
    }
  };
  const getData = async (sku, transaction) => {
    try {
      setLoading("fetch", true);
      const { data } = await imsAxios.post("/jobwork/getJwRmReturnData", {
        skucode: sku,
        transaction: transaction,
      });
      const headerValues = data.header;
      let headerArr = [];
      const headerObj = {
        "Created By": headerValues.created_by,
        "Jobwork Id": headerValues.jobwork_id,
        Status: headerValues.jw_status,
        "Ordered Qty": headerValues.ordered_qty,
        "Processed Qty": headerValues.proceed_qty,
        Product: headerValues.product_name,
        Sku: headerValues.sku_code,
        "Registered Date": headerValues.registered_date,
      };

      for (let key in headerObj) {
        if (headerObj.hasOwnProperty(key)) {
          headerArr.push({
            title: key,
            value: headerObj[key],
          });
        }
      }

      const componentArr = data.data.map((row) => ({
        id: v4(),
        component: row.component,
        componentKey: row.component_key,
        gst: row.gst_rate,
        hsn: row.hsncode,
        partCode: row.partcode,
        uom: row.unitsname,
      }));

      setRows(componentArr);
      setHeaderDetails(headerArr);
    } catch (error) {
      console.log("Error while fetching data", error);
    } finally {
      setLoading("fetch", false);
    }
  };
  const validateHandler = async () => {
    const values = await form.validateFields();
    const finalObj = {
      trans_id: show.transaction,
      component: selectedRows.map((row) => row.component.value),
      qty: selectedRows.map((row) => row.qty),
      in_location: selectedRows.map((row) => row.location?.value ?? "--"),
      out_location: selectedRows.map((row) => row.autoCons?.value ?? "--"),
      rate: selectedRows.map((row) => row.rate),
      invoice: selectedRows.map((row) => row.invoiceId ?? ""),
      remark: selectedRows.map((row) => row.remark ?? "--"),
      hsncode: selectedRows.map((row) => row.hsn),
      ewaybill: values.ewayBill ?? "--",
    };
    // console.log("finalObj", finalObj);

    // return;

    Modal.confirm({
      title: "Are you sure you want to submit?",
      content:
        "Please make sure that the values are correct, This process is irreversible",
      onOk() {
        submitHandler(finalObj);
      },
      onCancel() {},
    });
  };

  const submitHandler = async (values) => {
    try {
      setLoading("submit", true);
      const response = await imsAxios.post("/jobwork/saveJwRmReturn", values);
      // console.log("response is here->", response);
      let { data } = response;
      if (response.success) {
        // console.log("data.message", data.message.msg);
        toast.success(response.message.msg);
        setPreview(false);
        setPreviewRows([]);
        setSelectedRows([]);
        close();
        setTimeout(() => {
          window.location.reload();
        }, 1500); // 1500 milliseconds  = 1.5 seconds
      }
    } catch (error) {
    } finally {
      setLoading("submit", false);
    }
  };
  useEffect(() => {
    if (rows) {
      const values = selectedRows.map((row) => row.value ?? 0);
      const total = values.reduce((a, b) => a + +b, 0);
      setTotalValue(+Number(total).toFixed(3));
    }
  }, [selectedRows]);
  useEffect(() => {
    if (show) {
      getData(show.sku, show.transaction);
      getAutoComnsumptionOptions();
      getLocationOptions();
    }
  }, [show]);
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const props = {
    name: "file",
    multiple: false,

    maxCount: 1,

    beforeUpload(file) {
      return false;
    },
  };
  const callFileUpalod = async () => {
    setPreview(true);
    const values = uplaodForm.getFieldsValue();

    const file = values.files[0].originFileObj;
    const formData = new FormData();
    formData.append("file", file);
    const response = await executeFun(
      () => uplaodFileInJWReturn(formData),
      "fetch"
    );
    if (response?.data?.status == "success") {
      let { data } = response;
      let rows = data.data;

      const formattedHeaders = data.data.headers.map((header) =>
        header
          .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
            index === 0 ? match.toUpperCase() : match.toLowerCase()
          )
          .replace(/\s+/g, "")
      );

      // Map the row values to headers
      const formattedRows = data.data.rows.map((row) => {
        let rowObject = {};
        formattedHeaders.forEach((header, index) => {
          rowObject[header] = row[index];
        });
        return rowObject;
      });

      let arr = formattedRows.map((r, index) => ({
        id: index + 1,
        partCode: r.Partcode.partNo,
        partName: r.Partcode.name,
        location: { label: r.Location.text, value: r.Location.value },
        locationName: r.Location.text,
        component: { label: r.Partcode.name, value: r.Partcode.key },
        invoiceId: r.Invoice,
        qty: r.Qty,
        rate: r.Rate,
        hsn: r.Hsn,
        autoConsName: r.Autoconsump?.text,
        autoCons: {
          label: r.Autoconsump?.text,
          value: r.Autoconsump?.value,
        },
        value: (r.Qty * r.Rate).toFixed(3),
        remark: r.Remark,
        ...r,
      }));
      setPreviewRows(arr);
    } else {
      toast.error(response.message.msg);
      setPreview(false);
    }
  };
  const previewedcolumns = [
    {
      headerName: "#",
      field: "id",
      renderCell: ({ row }) => <ToolTipEllipses text={row.id} />,
      width: 50,
    },
    {
      headerName: "Part Code",
      field: "partCode",
      renderCell: ({ row }) => <ToolTipEllipses text={row.partCode} />,
      minWidth: 110,
    },
    {
      headerName: "Part Name",
      field: "partName",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.partName} copy={true} />
      ),
      minWidth: 250,
      flex: 1,
    },
    {
      headerName: "Location",
      field: "locationName",
      renderCell: ({ row }) => <ToolTipEllipses text={row.locationName} />,
      width: 100,
    },

    {
      headerName: "Hsn",
      field: "hsn",
      renderCell: ({ row }) => <ToolTipEllipses text={row.Hsn} />,
      width: 110,

      // width: "12vw",
    },
    {
      headerName: "Invoice Number",
      field: "invoiceId",
      renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceId} />,
      width: 110,

      // width: "12vw",
    },
    {
      headerName: "Rate",
      field: "rate",
      flex: 1,
      minWidth: 100,
    },
    {
      headerName: "Qty ",
      field: "qty",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => <ToolTipEllipses text={row.Qty} copy={true} />,
      // flex: 1,
    },
    {
      headerName: "Auto Consumption",
      field: "autoConsName",
      minWidth: 150,
      flex: 1,
    },
    {
      headerName: "Remark",
      field: "Remark",
      minWidth: 150,
      flex: 1,
    },
  ];
  const saveTheData = async () => {
    Modal.confirm({
      title: "Are you sure you want to submit?",
      content: "Please make sure that the values are correct",
      onOk() {
        closeDrawer();
      },
      onCancel() {},
    });
  };
  const closeDrawer = () => {
    setPreview(false);
    setOpen(false);
    setSelectedRows(previewRows);
    setRows([]);
  };
  useEffect(() => {
    if (show == false && selectedRows.length > 0) {
      setSelectedRows([]);
    }
  }, [show]);

  return (
    <>
      <Drawer
        width="100%"
        title="Vendor Name"
        placement="right"
        onClose={close}
        destroyOnClose={true}
        open={show}
        bodyStyle={{
          padding: 5,
        }}
      >
        {loading("fetch") && <Loading />}
        <Form form={form} layout="vertical" style={{ height: "100%" }}>
          <Row style={{ height: "90%", overflow: "hidden" }} gutter={6}>
            <Col span={5} style={{ height: "100%", overflowY: "scroll" }}>
              <Row gutter={[0, 6]}>
                <Col span={24}>
                  <HeaderDetails headerDetails={headerDetails} />
                </Col>

                <Col span={24}>
                  <Card size="small" title="Header Details">
                    <Form.Item name="ewayBill" label="E-Way Bill No.">
                      <Input />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={24}>
                  <Card size="small">
                    <Row justify="space-between">
                      <Col>
                        <Typography.Text strong>Total Value</Typography.Text>
                      </Col>
                      <Col>
                        <Typography.Text>
                          {!totalValue || totalValue === NaN ? 0 : totalValue}
                        </Typography.Text>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Col>
            <Col span={19} style={{ height: "100%", overflow: "auto" }}>
              <Components
                form={form}
                locationOptions={locationOptions}
                autoConsOptions={autoConsOptions}
                setAutoConsumptionOption={setAutoConsumptionOption}
                formRules={formRules}
                rows={rows}
                setRows={setRows}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                setOpen={setOpen}
                open={open}
                preview={preview}
                setPreview={setPreview}
              />
            </Col>
          </Row>
        </Form>
        <NavFooter
          submitFunction={validateHandler}
          nextLabel="Submit"
          backLabel="Back"
          nextDisabled={selectedRows?.length === 0}
          loading={loading("submit")}
          backFunction={close}
        />
      </Drawer>
      <Drawer
        width="100%"
        title="Preview Data From Excel"
        placement="right"
        onClose={() => setPreview(false)}
        destroyOnClose={true}
        open={preview}
        bodyStyle={{
          padding: 5,
        }}
      >
        {loading("fetch") && <Loading />}
        <Row
          style={{
            height: "95%",
            display: "flex",
            justifyContent: "center",
          }}
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
              columns={previewedcolumns}
              data={previewRows}
              // pagination
              loading={loading1("fetch")}
              headText="center"
              // export={true}
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
              // submithtmlType="Save"
              // resethtmlType="Back"
              submitFunction={saveTheData}
              nextLabel="Submit"
              resetFunction={() => setPreview(false)}
            >
              {/* <Col
                span={24}
                style={{
                  height: "10%",
                  display: "flex",
                  justifyContent: "flex-end",
                  // marginRight: 35,
                  marginTop: 10,
                  padding: "25px",
                  // background: "red",
                }}
              >
                <MyButton
                  style={{ marginLeft: 10 }}
                  variant="reset"
                  onClick={() => setPreview(false)}
                >
                  Close
                </MyButton>
                <MyButton
                  style={{ marginLeft: 10 }}
                  variant="next"
                  onClick={() => setPreview(false)}
                >
                  Close
                </MyButton>
              </Col> */}
            </NavFooter>
          </Row>
        </Row>
      </Drawer>
      <Modal
        title="Upload File Here"
        open={open}
        width={500}
        onCancel={() => setOpen(false)}
        footer={[
          <Button key="back" onClick={() => setOpen(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={callFileUpalod}>
            Preview
          </Button>,
        ]}
      >
        {loading("fetch") && <Loading />}
        <Card>
          <Form
            // initialValues={initialValues}
            form={uplaodForm}
            layout="vertical"
          >
            <Form.Item>
              <Form.Item
                name="files"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                // rules={rules.file}
                noStyle
              >
                <Upload.Dragger name="files" {...props}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </Form.Item>
            {/* <Row justify="end" style={{ marginTop: 10 }}>
                <Space>
                  <MyButton variant="reset" onClick={validateResetHandler} />
                  {stage === "preview" && (
                    <MyButton
                      loading={loading === "preview"}
                      variant="next"
                      text="Preview"
                      onClick={previewFileHandler}
                    />
                  )}
                  {stage === "submit" && (
                    <MyButton
                      loading={loading === "submit"}
                      variant="submit"
                      onClick={validateHandler}
                    />
                  )}
                </Space>
              </Row> */}
            <Row justify="end" style={{ marginTop: 5 }}>
              <MyButton
                variant="downloadSample"
                onClick={() =>
                  downloadCSVCustomColumns(sampleData, "JW RM Return")
                }
              />
            </Row>
          </Form>
        </Card>
      </Modal>
    </>
  );
};

export default JwReturnModel;

const formRules = {
  ewaybill: [{ required: true, message: "Please enter e-way bill number" }],
  qty: [{ required: true, message: "Please enter e-way bill number" }],
  rate: [{ required: true, message: "Please enter e-way bill number" }],
  location: [{ required: true, message: "Please enter e-way bill number" }],
};
