import { useState, useEffect } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  message,
} from "antd";
import { toast } from "react-toastify";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { v4 } from "uuid";
import FormTable from "../../../Components/FormTable";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import Loading from "../../../Components/Loading";

import { getComponentOptions } from "../../../api/general.ts";

import useApi from "../../../hooks/useApi.ts";
import MyButton from "../../../Components/MyButton";
export default function ReqWithoutBom() {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [pickLocationOptions, setPickLocationOptions] = useState([]);
  const [headerLocationOptionsm, setHeaderLocationOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pickLocationLoadingMessage, contextHolder] = message.useMessage();
  const [headerLocationMessage, headerLocationcontextHolder] =
    message.useMessage();

  const [requestForm] = Form.useForm();
  const { executeFun, loading: loading1 } = useApi();
  const [rows, setRows] = useState([
    {
      id: v4(),
      component: "",
      pickLocation: "",
      qty: "",
      remarks: "",
      leftQty: "",
      unit: "--",
    },
  ]);

  const addRows = () => {
    let arr = rows;
    arr = [
      ...arr,
      {
        id: v4(),
        component: "",
        pickLocation: "",
        qty: "",
        remarks: "",
        leftQty: "",
        unit: "--",
      },
    ];
    setRows(arr);
  };

  const removeRows = (id) => {
    let arr = rows;
    arr = arr.filter((row) => row.id !== id);
    setRows(arr);
  };
  // getting header location options
  ////
  const getHeaderLocationOptions = async () => {
    setHeaderLocationOptions([]);
    headerLocationMessage.open({
      type: "loading",
      content: "Fetching pick locations",
    });
    setLoading("fetching");
    const response = await imsAxios.post(
      "/production/fetchLocationForWitoutBom"
    );
    setLoading(false);
    headerLocationMessage.destroy();
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        const arr = data.data.map((row) => ({
          value: row.id,
          text: row.text,
        }));
        setHeaderLocationOptions(arr);
      } else {
        toast.error(data.message);
        setHeaderLocationOptions([]);
      }
    }
  };

  // input handler
  const inputHandler = async (name, value, id) => {
    let arr = rows;
    if (name === "component") {
      if (value.location) {
        const values = await getComponentDetails(
          value.component,
          value.location
        );
        console.log("values", values);
        arr = arr.map((row) => {
          if (row.id === id) {
            let obj = row;

            obj = {
              ...obj,
              [name]: value.component,
              leftQty: values.available_qty,
              unit: values.unit,
            };
            return obj;
          } else {
            return row;
          }
        });
      } else {
        arr = arr.map((row) => {
          if (row.id === id) {
            let obj = row;

            obj = {
              ...obj,
              [name]: value.component,
            };
            return obj;
          } else {
            return row;
          }
        });
      }
    } else if (name === "pickLocation") {
      if (value.location) {
        console.log("value.location", value.location);
        const values = await getComponentDetails(
          value.component,
          value.location
        );
        // console.log("values getComponentDetails", values);
        arr = arr.map((row) => {
          if (row.id === id) {
            let obj = row;

            obj = {
              ...obj,
              [name]: value.location,
              leftQty: values?.available_qty ?? "",
              unit: values?.unit ?? "",
            };
            return obj;
          } else {
            return row;
          }
        });
      } else {
        arr = arr.map((row) => {
          if (row.id === id) {
            let obj = row;

            obj = {
              ...obj,
              [name]: value.location,
            };
            return obj;
          } else {
            return row;
          }
        });
      }
    } else {
      arr = arr.map((row) => {
        if (row.id === id) {
          let obj = row;

          obj[name] = value;
          return obj;
        } else {
          return row;
        }
      });
    }
    setRows(arr);
  };

  // getting component options
  const getComponentOption = async (search) => {
    // setLoading("select");
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search,
    // });
    // setLoading(false);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    // console.log("response", response);

    const { data } = response;
    if (data) {
      if (data[0]) {
        const arr = data.map((row) => ({
          value: row.id,
          text: row.text,
        }));
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
      }
    }
  };

  // getting pick location options
  const getPickLocationOptions = async (search) => {
    setLoading("fetching");
    pickLocationLoadingMessage.open({
      type: "loading",
      content: "Fetching pick locations",
    });
    const response = await imsAxios.post("/transaction/getLocationInMin", {
      search: search,
    });
    pickLocationLoadingMessage.destroy();
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        const arr = data.data.data.map((row) => ({
          value: row.id,
          text: row.text,
        }));
        setPickLocationOptions(arr);
      } else {
        setPickLocationOptions([]);
      }
    }
  };

  // getting header location details
  const getHeaderLocationDetails = async (location) => {
    setLoading("headerLocation");

    const response = await imsAxios.post("/production/fetchLocationDetail", {
      location_key: location,
    });
    setLoading(false);

    const { data } = response;
    if (data) {
      if (data.code === 200) {
        requestForm.setFieldValue("description", data.data);
      } else {
        toast.error(data.message);
        requestForm.setFieldValue("description", "");
        return {};
      }
    }
  };
  // getting component details
  const getComponentDetails = async (componentKey, location) => {
    setLoading("component");
    const response = await imsAxios.post("/godown/godownStocks", {
      component: componentKey,
      location: location,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        return data.data;
      } else {
        toast.error(data.message.msg);
        // return {};
      }
    }
  };

  //  reset handler
  const resetHandler = () => {
    setRows([
      {
        id: v4(),
        component: "",
        pickLocation: "",
        qty: "",
        remarks: "",
        leftQty: "",
        unit: "--",
      },
    ]);
    requestForm.resetFields();
  };

  // showing reset confirm dialog
  const showResetConfirm = () => {
    Modal.confirm({
      title: "Are you sure you want to reset the form?",
      icon: <ExclamationCircleOutlined />,
      content:
        "All the changes in the form and selected components will be cleared",
      okText: "Yes",
      cancelText: "No",
      onOk: resetHandler,
    });
  };
  // submit handler
  const submitHandler = async (values) => {
    console.log("these are the values", values);
    setLoading("submitting");
    const response = await imsAxios.post(
      "/production/createWithoutBom",
      values
    );
    console.log("response", response);
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        toast.success(data.message);
        resetHandler();
        setLoading(false);
      } else {
        toast.error(data.message.msg);
        setLoading(false);
      }
      setLoading(false);
    }
    setLoading(false);
  };

  // show submit confirm dialog
  const showSubmitConfirm = async () => {
    const values = await requestForm.validateFields();

    const finalObj = {
      location: values.location,
      comment: values.remarks,
      component: rows.map((row) => row.component),
      pic_loc: rows.map((row) => row.pickLocation),
      qty: rows.map((row) => row.qty),
      remark: rows.map((row) => row.remarks),
    };
    Modal.confirm({
      title: "Are you sure you want to submit the request?",
      icon: <ExclamationCircleOutlined />,
      content: "All the changes in the form will be submitted",
      okText: "Yes",
      cancelText: "No",
      onOk: () => submitHandler(finalObj),
    });
  };

  // table columns
  const columns = [
    {
      headerName: <CommonIcons action="addRow" onClick={addRows} />,
      width: 30,
      type: "rowChange",
      field: "add",
      renderCell: ({ row }) =>
        rows.length > 1 && (
          <div style={{ width: "100%" }}>
            <CommonIcons
              action="removeRow"
              onClick={() => removeRows(row?.id)}
            />
          </div>
        ),
    },
    {
      headerName: "Component",
      width: 200,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          loadOptions={getComponentOption}
          optionsState={asyncOptions}
          selectLoading={loading1("select")}
          onBlur={() => setAsyncOptions([])}
          value={row.component}
          onChange={(value) =>
            inputHandler(
              "component",
              { component: value, location: row.pickLocation },
              row.id
            )
          }
        />
      ),
    },
    {
      headerName: "Pick Location",
      width: 100,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          loadOptions={getPickLocationOptions}
          optionsState={pickLocationOptions}
          onBlur={() => setPickLocationOptions([])}
          value={row.pickLocation}
          onChange={(value) =>
            inputHandler(
              "pickLocation",
              { location: value, component: row.component },
              row.id
            )
          }
        />
      ),
    },
    {
      headerName: "Order Qty",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          value={row.qty}
          suffix={`${row.leftQty} ${row.unit}`}
          onChange={(e) => inputHandler("qty", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "Remarks",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          value={row.remarks}
          onChange={(e) => inputHandler("remarks", e.target.value, row.id)}
        />
      ),
    },
  ];
  useEffect(() => {
    getHeaderLocationOptions();
    getPickLocationOptions("");
  }, []);
  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading(false);
      }, 900000);
    }
  }, [loading]);
  return (
    <Row gutter={6} style={{ height: "90%", padding: "0px 5px" }}>
      {contextHolder}
      {headerLocationcontextHolder}
      {loading === "fetching" && <Loading />}
      <Col span={6}>
        <Card size="small" title="Header Details">
          {loading === "headerLocation" && <Loading />}
          <Form
            form={requestForm}
            initialValues={initialValues}
            layout="vertical"
          >
            {/* select location */}
            <Form.Item
              label="Location"
              name="location"
              rules={[
                {
                  required: true,
                  message: "Please select a location",
                },
              ]}
            >
              <MySelect
                options={headerLocationOptionsm}
                onChange={getHeaderLocationDetails}
              />
            </Form.Item>
            {/* location description */}
            <Form.Item label="Location Details" name="description">
              <Input.TextArea disabled rows={3} />
            </Form.Item>
            {/* remarks */}
            <Form.Item label="Remarks" name="remarks">
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
          <Row justify="end">
            <Space>
              <Button onClick={showResetConfirm}>Reset</Button>
              <Button
                variant="search"
                loading={loading === "submitting"}
                type="primary"
                onClick={showSubmitConfirm}
              >
                Submit
              </Button>
            </Space>
          </Row>
        </Card>
      </Col>
      <Col span={18} style={{ height: "95%" }}>
        {loading === "component" && <Loading />}
        <FormTable data={rows} columns={columns} />
      </Col>
    </Row>
  );
}

// const initital values
const initialValues = {
  location: "",
  description: "",
  remarks: "",
};
