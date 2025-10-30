import { Col, Drawer, Form, Input, Row } from "antd";
import React, { useEffect, useState } from "react";
import NavFooter from "../../Components/NavFooter";
import { imsAxios } from "../../axiosInterceptor";
import FormTable from "../../Components/FormTable";
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";
import { GridActionsCellItem } from "@mui/x-data-grid";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MySelect from "../../Components/MySelect";
import { toast } from "react-toastify";
import useApi from "../../hooks/useApi.ts";
import { getCostCentresOptions, getProjectOptions } from "../../api/general.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import { IconButton } from "@mui/material";

function SFTransferDrawer({
  sfTransferModal,
  setSfTransferModal,
  drawerData,
  //
  setDrawerData,
}) {
  const [sftransfer] = Form.useForm();

  const [locationOptions, setLocationOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rows, setRows] = useState([]);

  const { executeFun, loading: loading1 } = useApi();
  const inputHandler = async (name, id, value) => {
    console.log(name, id, value);
    if (name == "trans_id") {
      setRows((a) =>
        a.map((aa) => {
          if (aa.components_id == id) {
            {
              return { ...aa, trans_id: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "part") {
      setRows((a) =>
        a.map((aa) => {
          if (aa.components_id == id) {
            {
              return { ...aa, part: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "name") {
      setRows((a) =>
        a.map((aa) => {
          if (aa.components_id == id) {
            {
              return { ...aa, name: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "qty") {
      setRows((a) =>
        a.map((aa) => {
          if (aa.components_id == id) {
            {
              return { ...aa, qty: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "rate") {
      setRows((a) =>
        a.map((aa) => {
          if (aa.components_id == id) {
            {
              return { ...aa, rate: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "uom") {
      setRows((a) =>
        a.map((aa) => {
          if (aa.components_id == id) {
            {
              return { ...aa, uom: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "remark") {
      setRows((a) =>
        a.map((aa) => {
          if (aa.components_id == id) {
            {
              return { ...aa, remark: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "location") {
      setRows((a) =>
        a.map((aa) => {
          if (aa.components_id == id) {
            {
              return { ...aa, location: value };
            }
          } else {
            return aa;
          }
        })
      );
    }
  };
  const getLocation = async () => {
    // setSelectLoading(true);
    const { data } = await imsAxios.post("/transaction/getLocationInMin", {
      search: "",
    });
    // setSelectLoading(false);
    if (data.code == 200) {
      let arr = data.data.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setLocationOptions(arr);
    } else {
      toast.error(data.message.msg);
    }
  };
  const getdrawerData = async (id) => {
    // console.log("id", id);
    const response = await imsAxios.post("/sfMin/sfMinTransferDetail", {
      trans_id: id,
    });
    const { data } = response;
    if (data.code === 200) {
      let arr = data.data.map((row) => {
        return {
          ...row,
        };
      });
      setRows(arr);
    }
  };

  const validateHandler = async () => {
    const values = await sftransfer.validateFields();
    let payload = {
      trans_id: rows[0]?.trans_id,
      components: rows?.map((r) => r?.components_id),
      part: rows?.map((r) => r?.part),
      name: rows?.map((r) => r?.name),
      rate: rows?.map((r) => r?.rate),
      qty: rows?.map((r) => r?.qty),
      remark: rows?.map((r) => r?.remark),
      costCenter: values?.costCenter,
      projectId: [values?.projectId],
      location: rows?.map((r) => r.location?.value),
    };
    console.log("payload", payload);

    sendTransferData(payload);
  };
  const handleFetchCostCenterOptions = async (search) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select"
    );
    let arr = [];
    if (response.success) arr = convertSelectOptions(response.data);
    setAsyncOptions(arr);
  };
  const handleFetchProjectOptions = async (search) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );
    setAsyncOptions(response.data);
  };
  const sendTransferData = async (payload) => {
    setLoading(true);
    // return;
    let response = await imsAxios.post("/sfMin/sfMinInward", payload);
    let { data } = response;
    if (data.code == 200) {
      toast.success(data.message);
      setLoading(true);
      setDrawerData([]);
    } else {
      toast.error(data.message.msg);
    }
    setLoading(false);
  };
  const removeRow = (id) => {
    let arr = rows;
    arr = arr.filter((row) => row.components_id != id);
    setRows(arr);
  };
  useEffect(() => {
    if (drawerData?.trans_id) {
      getdrawerData(drawerData.trans_id);
      getLocation();
    }
  }, [drawerData]);

  const colms = [
    {
      headerName: "",

      width: 150,
      type: "actions",
      field: "add",
      sortable: false,
      render: ({ row, removeRow, rows }) => (
        <IconButton
          onClick={() => {
            const index = rows.indexOf(row);
            if (index > 0) removeRow(row.components_id);
          }}
          disabled={rows.indexOf(row) <= 0}
        >
          <AiOutlineMinusSquare
            style={{
              fontSize: "1.7rem",
              opacity: rows.indexOf(row) <= 0 ? 0.5 : 1,
            }}
          />
        </IconButton>
      ),
    },

    {
      field: "partCode",
      headerName: "Part Code",
      width: 160,
      render: ({ row }) => <p>{row?.part}</p>,
    },

    {
      headerName: "Part Name",
      field: "name",
      sortable: false,
      flex: 1,
      render: ({ row }) => <p>{row?.name}</p>,
    },
    {
      headerName: "Rate",
      field: "rate",
      sortable: false,
      width: 150,
      render: ({ row }) => (
        <Input
          value={row.rate}
          onChange={(e) => {
            inputHandler("rate", row.components_id, e.target.value);
          }}
        />
      ),
    },
    {
      headerName: "QTY",
      field: "qty",
      sortable: false,
      flex: 1,
      render: ({ row }) => <p>{row.qty}</p>,
    },
    {
      headerName: "UoM",
      field: "uom",
      sortable: false,
      flex: 1,
      render: ({ row }) => <p>{row.uom}</p>,
    },
    {
      headerName: "Location",
      field: "location",
      sortable: false,
      render: ({ row }) => (
        <MySelect
          labelInValue
          value={row.location}
          onChange={(value) => {
            inputHandler("location", row.components_id, value);
          }}
          options={locationOptions}

          //   placeholder="0"
        />
      ),

      width: 150,
    },
    {
      headerName: "Remark",
      field: "remark",
      sortable: false,
      flex: 1,
      render: ({ row }) => (
        <Input
          value={row.remark}
          onChange={(e) => {
            inputHandler("remark", row.components_id, e.target.value);
          }}
          //   placeholder="0"
        />
      ),
    },
  ];
  return (
    <Drawer
      open={drawerData.trans_id}
      title={`SF Transfer | ${drawerData?.trans_id ?? ""}`}
      placement="right"
      onClose={() => setDrawerData([])}
      bodyStyle={{
        padding: 5,
      }}
      //   open={showView}
      width="100%"
    >
      {/* {loading === "fetch" && <Loading />} */}
      <Form layout="vertical" form={sftransfer} style={{ height: "100%" }}>
        <Row
          gutter={6}
          style={{
            height: "95%",
            overflow: "auto",
            marginRight: 2,
            paddingBottom: 10,
          }}
        >
          {/* <Col span={24} style={{ height: "100%", overflow: "hidden"  }}> */}
          <Col span={4}>
            <Form.Item name="costCenter" label="Cost Center">
              <MyAsyncSelect
                onBlur={() => setAsyncOptions([])}
                optionsState={asyncOptions}
                selectLoading={loading1("select")}
                loadOptions={handleFetchCostCenterOptions}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item name="projectId" label="Project Id">
              <MyAsyncSelect
                selectLoading={loading1("select")}
                onBlur={() => setAsyncOptions([])}
                optionsState={asyncOptions}
                loadOptions={handleFetchProjectOptions}
              />
            </Form.Item>
          </Col>
          {/* </Col> */}
          <Col span={24} style={{ height: "90%", overflow: "auto" }}>
            <FormTable data={rows} columns={colms} />
          </Col>
        </Row>
      </Form>
      <NavFooter
        submithtmlType="submit"
        submitButton={true}
        nextLabel="Submit"
        loading={loading}
        submitFunction={validateHandler}
      />
    </Drawer>
  );
}

export default SFTransferDrawer;
