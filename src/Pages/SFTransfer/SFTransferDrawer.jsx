import { Col, Drawer, Form, Input, Row } from "antd";
import React, { useEffect, useState } from "react";
import NavFooter from "../../Components/NavFooter";
import { imsAxios } from "../../axiosInterceptor";
import FormTable from "../../Components/FormTable";
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";
import { GridActionsCellItem } from "@mui/x-data-grid";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { v4 } from "uuid";
import axios from "axios";
import MySelect from "../../Components/MySelect";
import { toast } from "react-toastify";
import useApi from "../../hooks/useApi.ts";
import { getCostCentresOptions, getProjectOptions } from "../../api/general";
import { convertSelectOptions } from "../../utils/general";

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
  const [rows, setRows] = useState([
    // {
    //   id: v4(),
    //   components_id: "",
    //   trans_id: "",
    //   part: "",
    //   name: "",
    //   qty: "",
    //   uom: "",
    //   remark: "",
    // },
  ]);

  const { executeFun, loading: loading1 } = useApi();
  const inputHandler = async (name, id, value) => {
    console.log(name, id, value);
    if (name == "trans_id") {
      setRows((a) =>
        a.map((aa) => {
          if (aa.id == id) {
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
          if (aa.id == id) {
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
          if (aa.id == id) {
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
          if (aa.id == id) {
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
          if (aa.id == id) {
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
          if (aa.id == id) {
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
          if (aa.id == id) {
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
          if (aa.id == id) {
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
      trans_id: rows[0].trans_id,
      components: rows.map((r) => r.components_id),
      part: rows.map((r) => r.part),
      name: rows.map((r) => r.name),
      rate: rows.map((r) => r.rate),
      qty: rows.map((r) => r.qty),
      remark: rows.map((r) => r.remark),
      costCenter: values.costCenter,
      projectId: [values.projectId],
      location: rows.map((r) => r.location.value),
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
    arr = arr.filter((row) => row.id != id);
    setRows(arr);
  };
  useEffect(() => {
    // console.log("id =======", drawerData);
    if (drawerData?.trans_id) {
      //   console.log("id =======", drawerData.trans_id);
      getdrawerData(drawerData.trans_id);
      getLocation();
    }
  }, [drawerData]);

  const colms = [
    {
      headerName: "",
      //   (
      // <span>
      //   <AiOutlinePlusSquare
      //     onClick={addRows}
      //     style={{
      //       cursor: "pointer",
      //       fontSize: "1.7rem",
      //       marginTop: 10,
      //       opacity: "0.7",
      //     }}
      //   />
      // </span>
      //   ),
      width: 150,
      type: "actions",
      field: "add",
      sortable: false,
      renderCell: ({ row }) => [
        <GridActionsCellItem
          icon={
            <AiOutlineMinusSquare
              style={{
                fontSize: "1.7rem",
                cursor: "pointer",
                pointerEvents: rows.indexOf(row) <= 0 ? "none" : "all",
                opacity: rows.indexOf(row) <= 0 ? 0.5 : 1,
              }}
            />
          }
          onClick={() => {
            let del = null;
            del = rows.indexOf(row) > 0;

            del && removeRow(row.id);
          }}
          label="Delete"
        />,
      ],
    },
    // {
    //   headerName: "Component Id",
    //   flex: 1,
    //   field: "components_id",
    //   //   editable: true,
    //   //   sortable: false,
    //   renderCell: ({ row }) => (
    //     <Input
    //       //   selectLoading={selectLoading}
    //       //   onBlur={() => setAsyncOptions([])}
    //       value={row?.components_id}
    //       onChange={(value) => {
    //         inputHandler("components_id", value, row?.id);
    //       }}
    //       //   loadOptions={getLedger}
    //       //   optionsState={asyncOptions}
    //       //   placeholder=""
    //     />
    //   ),
    // },
    {
      field: "partCode",
      headerName: "Part Code",
      width: 160,
      renderCell: ({ row }) => <p>{row?.part}</p>,
    },
    // {
    //   headerName: "Transaction Id",
    //   headerName: "trans_id ",
    //   width: 160,
    //   renderCell: ({ row }) => (
    //     <Input
    //       value={row?.trans_id}
    //       placeholder="Invoice"
    //       onChange={(e) => inputHandler("trans_id ", row.id, e.target.value)}
    //     />
    //   ),
    // },

    {
      headerName: "Part Name",
      field: "name",
      sortable: false,
      flex: 1,
      renderCell: ({ row }) => <p>{row?.name}</p>,
    },
    {
      headerName: "Rate",
      field: "rate",
      sortable: false,
      width: 150,
      renderCell: ({ row }) => (
        <Input
          value={row.rate}
          onChange={(e) => {
            inputHandler("rate", row.id, e.target.value);
          }}
        />
      ),
    },
    {
      headerName: "QTY",
      field: "qty",
      sortable: false,
      flex: 1,
      renderCell: ({ row }) => <p>{row.qty}</p>,
    },
    {
      headerName: "UoM",
      field: "uom",
      sortable: false,
      flex: 1,
      renderCell: ({ row }) => <p>{row.uom}</p>,
    },
    {
      headerName: "Location",
      field: "location",
      sortable: false,
      renderCell: ({ row }) => (
        <MySelect
          labelInValue
          value={row.location}
          onChange={(value) => {
            inputHandler("location", row.id, value);
          }}
          options={locationOptions}

          //   placeholder="0"
        />
      ),
      //   renderCell: (row) =>{
      // locationCell(params, inputHandler, locationOptions),
      //   onChange={(e) => {
      //     inputHandler("remark", row.id, e.target.value);
      //   }}
      width: 150,
    },
    {
      headerName: "Remark",
      field: "remark",
      sortable: false,
      flex: 1,
      renderCell: ({ row }) => (
        <Input
          value={row.remark}
          onChange={(e) => {
            inputHandler("remark", row.id, e.target.value);
          }}
          //   placeholder="0"
        />
      ),
    },

    // {
    //   headerName: "Comment",
    //   field: "comment",
    //   sortable: false,
    //   flex: 1,
    //   //   width: "12.5vw",
    //   renderCell: ({ row }) =>
    //     !row.total && (
    //       <Input
    //         fun={inputHandler}
    //         onChange={(e) => {
    //           inputHandler("comment", e.target.value, row.id);
    //         }}
    //         value={row?.comment}
    //         placeholder="Enter a comment..."
    //       />
    //     ), //ask
    // },
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
          style={{ height: "95%", overflow: "hidden", marginRight: 2 }}
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
              {/* <Input /> */}
              <MyAsyncSelect
                selectLoading={loading1("select")}
                onBlur={() => setAsyncOptions([])}
                optionsState={asyncOptions}
                loadOptions={handleFetchProjectOptions}
                // onChange={handleProjectChange}
              />
            </Form.Item>
          </Col>
          {/* </Col> */}
          <Col span={24} style={{ height: "100%", overflow: "hidden" }}>
            <FormTable data={rows} columns={colms} />
            {/* <FormTable2
              removableRows={true}
              nonRemovableColumns={1}
              //   columns={[...componentsItems(gstType), locationColumn]}
              listName="components"
              watchKeys={["rate", "qty", "gstRate"]}
              nonListWatchKeys={["gstType"]}
              componentRequiredRef={["rate", "qty"]}
              form={minForm}
              calculation={calculation}
              rules={listRules}
            /> */}
            {/* </Card> */}
          </Col>
        </Row>
      </Form>
      <NavFooter
        submithtmlType="submit"
        submitButton={true}
        nextLabel="Submit"
        // formName="add-client"
        // resetFunction={setShowResetConfirm}
        // disabled={!validForSubmit()}
        loading={loading}
        // type="primary"
        // resetFunction={() => {
        //   minForm.resetFields();
        //   setShowView(false);
        // }}
        submitFunction={validateHandler}
        // nextLabel="Submit"
        // disabled={{ reset: loading }}
      />
    </Drawer>
  );
}

export default SFTransferDrawer;
