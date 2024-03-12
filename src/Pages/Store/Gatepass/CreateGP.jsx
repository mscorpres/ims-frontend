import React, { useState, useEffect } from "react";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { v4 } from "uuid";
import FormTable from "../../../Components/FormTable";
import NavFooter from "../../../Components/NavFooter";
import Loading from "../../../Components/Loading";
import { toast } from "react-toastify";
import { Col, Descriptions, Divider, Form, Input, Row } from "antd";
import TextArea from "antd/lib/input/TextArea";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../axiosInterceptor";
import { getComponentOptions } from "../../../api/general";

import useApi from "../../../hooks/useApi";
export default function CreateGP() {
  const [rows, setRows] = useState([
    { id: v4(), item: "", qty: 0, uom: "", remark: "" },
  ]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [fetchDetailsLoading, setFetchDetailsLoading] = useState(false);
  const [otherData, setOtherData] = useState({
    name: "",
    email: "",
    passType: "R",
    mobile: "",
    address: "",
    narration: "",
  });
  const [loading, setLoading] = useState(false);
  const { executeFun, loading: loading1 } = useApi();

  const getComponentDetail = async (searchInputText) => {
    // setSelectLoading(true);

    // const { data } = await imsAxios.post("backend/getComponentByNameAndNo", {
    //   search: searchInputText,
    // });
    // setSelectLoading(false);
    const response = await executeFun(
      () => getComponentOptions(searchInputText),
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
  };
  const inputHandler = async (name, value, id) => {
    let arr = rows;
    if (name == "component") {
      setFetchDetailsLoading(true);
      const { data } = await imsAxios.post(
        "/component/getComponentDetailsByCode",
        {
          component_code: value,
        }
      );
      setFetchDetailsLoading(false);
      arr = arr.map((row) => {
        if (row.id == id) {
          let obj = row;
          obj = {
            ...obj,
            [name]: value,

            qty: "",
            uom: data?.data?.unit,
          };

          return obj;
        } else {
          return row;
        }
      });
    } else {
      arr = arr.map((row) => {
        if (row.id == id) {
          return {
            ...row,
            [name]: value,
          };
        } else {
          return row;
        }
      });
    }
    setRows(arr);
  };
  const otherInputHandler = async (name, value) => {
    let obj = otherData;
    obj = {
      ...obj,
      [name]: value,
    };
    setOtherData(obj);
  };
  const addRows = () => {
    let arr = rows;
    arr = [
      ...rows,
      {
        id: v4(),
        item: "",
        qty: 0,
        uom: "",
        remark: "",
        index: rows.length + 1,
      },
    ];

    setRows(arr);
  };
  const removeRow = (id) => {
    let arr = rows;
    arr = arr.filter((row) => row.id != id);
    setRows(arr);
  };

  const passTypes = [
    { text: "RGP (Returnable Gate Pass)", value: "R" },
    { text: "NRGP (Non-Returnable Gate Pass)", value: "NR" },
  ];
  const getComponents = async (searchInputText) => {
    const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
      search: searchInputText,
    });
    let arr = data;
    arr = arr.map((row) => {
      return {
        text: row.text,
        value: row.value,
      };
    });
    setAsyncOptions(arr);
  };

  const columns = [
    {
      headerName: <CommonIcons action="addRow" onClick={addRows} />,
      width: 80,
      type: "actions",
      field: "add",
      renderCell: ({ row }) =>
        row.index > 0 ? (
          <CommonIcons
            action="removeRow"
            onClick={() => {
              row.index > 0 && removeRow(row?.id);
            }}
          />
        ) : (
          <span></span>
        ),
    },
    {
      headerName: "Component",
      width: 300,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          onBlur={() => setAsyncOptions([])}
          value={rows.filter((r) => r.id == row.id)[0]?.component}
          onChange={(value) => inputHandler("component", value, row.id)}
          loadOptions={getComponentDetail}
          optionsState={asyncOptions}
          selectLoading={loading1("select")}
        />
      ),

      field: "component",
    },
    {
      headerName: "UoM",
      width: 200,
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler("qty", e.target.value, row.id)}
          value={row.qty}
          placeholder="0"
          // inputType="number"
          name="qty"
          suffix={row.uom}
          id={row.id}
        />
      ),

      field: "uom",
    },
    {
      headerName: "Remarks",
      renderCell: ({ row }) => (
        <Input
          name="remark"
          onChange={(e) => inputHandler("remark", e.target.value, row.id)}
          value={row.remark}
          id={row.id}
        />
      ),
      flex: 1,
      field: "remarks",
    },
  ];
  const submitFunction = async () => {
    let problem = false;
    if (!otherData.passType) {
      problem = "Pass Type";
    } else if (!otherData.name) {
      problem = "Name";
    } else if (!otherData.address) {
      problem = "Address";
    } else if (!otherData.email) {
      problem = "Email";
    } else if (!otherData.mobile) {
      problem = "Mobile";
    }
    rows.map((row) => {
      if (row.component == "") {
        problem = "Component Name for all the rows.";
      } else if (row.qty.uom || row.qty == "") {
        problem = "Quantity for all the rows";
      }
    });
    if (problem) {
      toast.error("Please provide " + problem);
    } else {
      let mat = {
        component: rows.map((row) => row.component),
        qty: rows.map((row) => row.qty),
        remark: rows.map((row) => row.remark),
      };

      let finalObj = {
        recipient: {
          passtype: otherData.passType,
          name: otherData.name,
          address: otherData.address,
        },
        contact: {
          email: otherData.email,
          mobile: otherData.mobile,
        },
        other: {
          narration: otherData.narration,
        },
        material: mat,
      };
      setLoading(true);
      const { data } = await imsAxios.post("/gatepass/createGP", {
        ...finalObj,
      });
      setLoading(false);
      if (data.code == 200) {
        toast.success(data.message);
        resetFunction();
      } else {
        toast.error(
          data.message.msg
            ? data.message.msg
            : data.message
            ? data.message.msg
            : "Some Error Occurred"
        );
      }
    }
  };
  const resetFunction = async () => {
    setRows([{ id: v4(), item: "", qty: 0, uom: "", remark: "" }]);
    setOtherData({
      name: "",
      email: "",
      passType: "R",
      mobile: "",
      address: "",
      narration: "",
    });
  };

  return (
    <div
      style={{
        position: "relative",
        height: "90%",
        overflowY: "auto",
        overflowX: "hidden",
        paddingBottom: 50,
      }}
    >
      {loading && <Loading />}
      <div
        style={{
          opacity: loading ? 0.5 : 1,
          pointerEvents: loading ? "none" : "all",
          padding: "20px",
        }}
      >
        <Row>
          <Col span={4}>
            <Descriptions
              size="small"
              title={<p style={{ fontSize: "0.8rem" }}>Basic Details</p>}
            >
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Pass type and name of the recipent
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col span={20}>
            <Row gutter={16}>
              {/* Pass type */}

              <Col span={6}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        PO Type
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please Select a Pass Type!",
                      },
                    ]}
                  >
                    <MySelect
                      size="default"
                      options={passTypes}
                      value={otherData.passType}
                      onChange={(value) => otherInputHandler("passType", value)}
                    />
                  </Form.Item>
                </Form>
              </Col>
              {/* name type */}
              <Col span={6}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Name
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter name",
                      },
                    ]}
                  >
                    <Input
                      value={otherData.name}
                      onChange={(e) =>
                        otherInputHandler("name", e.target.value)
                      }
                      size="default"
                    />
                  </Form.Item>
                </Form>
              </Col>
              {/* mobile */}
              <Col span={6}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Mobile
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Mobile Number!",
                      },
                    ]}
                  >
                    <Input
                      size="default"
                      value={otherData.mobile}
                      onChange={(e) =>
                        otherInputHandler("mobile", e.target.value)
                      }
                    />
                  </Form.Item>
                </Form>
              </Col>
              {/* email */}
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Address
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Address!",
                      },
                    ]}
                  >
                    <TextArea
                      style={{ resize: "none" }}
                      row={4}
                      size="default"
                      value={otherData.address}
                      onChange={(e) =>
                        otherInputHandler("address", e.target.value)
                      }
                    />
                  </Form.Item>
                </Form>
              </Col>
              <Col span={6}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Email
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Email!",
                      },
                    ]}
                  >
                    <Input
                      size="default"
                      value={otherData.email}
                      onChange={(e) =>
                        otherInputHandler("email", e.target.value)
                      }
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider />
        {/* second section */}
        <Row>
          <Col span={4}>
            <Descriptions
              size="small"
              title={<p style={{ fontSize: "0.8rem" }}>Narration</p>}
            >
              <Descriptions.Item
                contentStyle={{
                  fontSize: window.innerWidth < 1600 && "0.7rem",
                }}
              >
                Narration for the pass
              </Descriptions.Item>
            </Descriptions>
          </Col>

          <Col span={20}>
            <Row gutter={16}>
              {/* narration */}
              <Col span={18}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Narration
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please Enter Mobile Number!",
                      },
                    ]}
                  >
                    <Input
                      size="default"
                      value={otherData.narration}
                      onChange={(e) =>
                        otherInputHandler("narration", e.target.value)
                      }
                    />
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Col>
        </Row>
        <Divider />
        <Row>
          <Col span={4}>
            <Descriptions
              size="small"
              title={<p style={{ fontSize: "0.8rem" }}>Item Details</p>}
            ></Descriptions>
          </Col>

          <Col span={20}>
            <Row gutter={16}>
              {fetchDetailsLoading && <Loading />}
              {/* narration */}
              <Col span={18} style={{ maxHeight: 350, overflowY: "auto" }}>
                <FormTable
                  // density="comfortable"
                  columns={columns}
                  data={rows}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
      <NavFooter
        submitFunction={submitFunction}
        resetFunction={resetFunction}
        nextLabel={"Create GP"}
        loading={loading}
      />
    </div>
  );
}
