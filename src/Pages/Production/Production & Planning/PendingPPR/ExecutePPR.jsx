import { useEffect, useState } from "react";
import {
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Skeleton,
  Tabs,
  Typography,
} from "antd";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import MySelect from "../../../../Components/MySelect";
import NavFooter from "../../../../Components/NavFooter";
import FormTable from "../../../../Components/FormTable";
import { imsAxios } from "../../../../axiosInterceptor";

export default function ExecutePPR({ editPPR, setEditPPR, getRows }) {
  const [tabItems, setTabItems] = useState([]);
  const [tabsExist, setTabsExist] = useState(["1", "P", "PCK", "O", "PCB"]);
  const [activeKey, setActiveKey] = useState("1");
  const [pageLoading, setPageLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [headerData, setHeaderData] = useState({});
  const [locationOptions, setLocationOptions] = useState([]);
  const onChange = (newActiveKey) => {
    setActiveKey(newActiveKey);
  };

  const remove = (targetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    tabItems.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = tabItems.filter((item) => item.key !== targetKey);
    let arr = newPanes.map((pane) => pane.key);
    setTabsExist(arr);
    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    setTabItems(newPanes);
    setActiveKey(newActiveKey);
  };
  const onEdit = (targetKey, action) => {
    remove(targetKey);
  };
  const getPPRData = async () => {
    setPageLoading(true);
    const { data } = await imsAxios.post("/ppr/fetchPprComponentDetails", {
      accesstoken: editPPR.prod_randomcode,
      pprrequest: editPPR.prod_transaction,
      skucode: editPPR.prod_product_sku,
    });
    setPageLoading(false);
    let arr1 = {
      ...data.data.header_data,
      location: "",
      mfgQty: 1,
      myComment: "",
    };
    if (data.code == 200) {
      let arr = data.data.comp_data.map((row) => {
        return {
          ...row,
          id: v4(),
          actQty: headerData.mfgQty ? row.qty * headerData.mfgQty : row.qty,
          rej: "",
          rem: "",
        };
      });
      setTableData(arr);

      setHeaderData(arr1);
    } else {
      toast.error(data.message.msg);
      setEditPPR(null);
    }
  };
  const columns = [
    {
      headerName: "Part Name",
      width: 350,
      field: "name",
      renderCell: ({ row }) => (
        <span
          style={{
            color: +row.location_qty < +row.qty && "red",
          }}
        >
          {row.name}
        </span>
      ),
    },
    {
      headerName: "Part Code",
      flex: 1,
      field: "partno",
      renderCell: ({ row }) => <span>{row.partno}</span>,
    },
    {
      headerName: "BOM Qty",
      flex: 1,
      field: "qty",
      renderCell: ({ row }) => (
        <span>
          {row.qty} {row.unit}
        </span>
      ),
    },
    {
      headerName: "Stock Qty",
      flex: 1,
      field: "location_qty",
      renderCell: ({ row }) => (
        <span>
          {row.location_qty} {row.unit}
        </span>
      ),
    },
    {
      headerName: "Actual Cons.",
      flex: 1,
      field: "annuaCons",
      renderCell: ({ row }) => (
        <Input
          style={{ border: row.borderRed && "1px solid red" }}
          value={row.actQty}
          suffix={row.unit}
          onChange={(e) => compInputHandler("actQty", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "Rejected",
      flex: 1,
      field: "rejected",
      renderCell: ({ row }) => (
        <Input
          value={row.rej}
          onChange={(e) => compInputHandler("rej", e.target.value, row.id)}
        />
      ),
    },
    {
      headerName: "Remark",
      flex: 1,
      field: "remark",
      renderCell: ({ row }) => (
        <Input
          value={row.rem}
          onChange={(e) => compInputHandler("rem", e.target.value, row.id)}
        />
      ),
    },
  ];
  const getLocations = async () => {
    const { data } = await imsAxios.get("/ppr/mfg_locations");
    const arr = [];
    data.data.map((a) => arr.push({ text: a.text, value: a.id }));
    setLocationOptions(arr);
  };
  const compInputHandler = async (name, value, id) => {
    let arr = tableData;
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
    // if (name === "actqty") {
    //   arr = arr.map((row) => {
    //     let obj = row;
    //     if (obj.id == id) {
    //       obj = {
    //         ...obj,
    //         borderRed: +row.location_qty < +value && true,
    //         [name]: value,
    //       };
    //       return obj;
    //     } else {
    //       return obj;
    //     }
    //   });
    // }
    setTableData(arr);
  };
  const headerInputhandler = (name, value) => {
    let obj = headerData;
    obj = { ...obj, [name]: value };
    setHeaderData(obj);
  };
  const validateHandler = () => {
    if (headerData.location == "") {
      return toast.error("Please select a location");
    } else if (headerData.mfgQty == "") {
      return toast.error("Please enter manufacutre quantity");
    }
    let arr = [];
    arr = tabsExist.map((tab) => {
      return tableData.filter((row) => row.type == tab);
    });
    arr = arr.reduce((r, c) => {
      return [...r, ...c];
    });
    const finalObj = {
      bom: headerData.key,
      con_location: headerData.location,
      ppr: headerData.pprid,
      sku: headerData.sku,

      comment: headerData.myComment,
      sending_location: headerData.productionLocKey,
      mfg_qty: headerData.mfgQty,

      component: arr.map((row) => row.key),
      con_qty: arr.map((row) => row.actQty),
      part: arr.map((row) => row.partno),
      reject: arr.map((row) => row.rej),
      remark: arr.map((row) => row.rem),
    };
    Modal.confirm({
      title: "Execute PPR",
      content: "Are you sure you want to execute this PPR?",
      okText: "Execute",
      onOk: () => submitHandler(finalObj),
    });
  };
  const submitHandler = async (finalObj) => {
    try {
      setSubmitLoading(true);
      const response = await imsAxios.post("/ppr/executePPR", finalObj);
      if (response.data) {
        const { data } = response;
        if (data.code == 200) {
          toast.success(data.message);
          getRows();
          setTimeout(() => {
            setEditPPR(null);
          }, 3000);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setSubmitLoading(false);
    }
  };
  // const table = (rows, tab) => (
  const calcActualQty = () => {
    let headQty = headerData.mfgQty;
    let arr = tableData;
    arr = arr.map((row) => ({
      ...row,
      actQty: row.qty * headQty,
    }));
    setTableData(arr);
  };
  useEffect(() => {
    getLocations();
    if (!editPPR) {
      setHeaderData({});
      setTableData([]);
    } else if (editPPR);
    {
      getPPRData();
      setTabsExist(["1", "P", "PCK", "O", "PCB"]);
    }
  }, [editPPR]);
  const { Text } = Typography;
  useEffect(() => {
    let arr = tabsExist.map((tab) => {
      return {
        label:
          tab == "P"
            ? "Part"
            : tab == "PCK"
            ? "Packing"
            : tab === "PCB"
            ? "PCB"
            : tab == "1"
            ? "MFG Journal"
            : "Other",
        key: tab,
        children:
          tab != "1" ? (
            <div className=" remove-cell-border" style={{ height: "73vh" }}>
              <div style={{ height: "95%" }}>
                {/* {pageLoading && <Loading />} */}
                <FormTable
                  columns={columns}
                  data={tableData?.filter((row) => row.type == tab)}
                />
              </div>
            </div>
          ) : (
            <div style={{ height: "70vh" }}>
              {!pageLoading && (
                <>
                  {" "}
                  <Row style={{ margin: "30px 0" }} gutter={16}>
                    <Col span={6}>
                      <Text>
                        Product:
                        <br /> {headerData?.productname_sku}
                      </Text>
                    </Col>
                    <Col span={6}>
                      <Text>
                        BOM No.: <br />
                        {headerData?.bom}
                      </Text>
                    </Col>
                  </Row>
                  <Row style={{ margin: "30px 0" }} gutter={16}>
                    <Col span={6}>
                      Mfg Location: <br />
                      {headerData?.productionLocName}
                    </Col>
                    <Col span={6}>
                      Left Qty: <br />
                      {headerData?.mfg}
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={6}>
                      <Form size="small" layout="vertical">
                        <Form.Item
                          label={
                            <div
                              style={{
                                fontSize: window.innerWidth < 1600 && "0.7rem",
                              }}
                            >
                              Select Location
                            </div>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Please  Select Location",
                            },
                          ]}
                        >
                          <MySelect
                            value={headerData?.location}
                            onChange={(value) =>
                              setHeaderData((d) => {
                                return { ...d, location: value };
                              })
                            }
                            options={locationOptions}
                          />
                        </Form.Item>
                      </Form>
                    </Col>
                    <Col span={6}>
                      <Form size="small" layout="vertical">
                        <Form.Item
                          label={
                            <div
                              style={{
                                fontSize: window.innerWidth < 1600 && "0.7rem",
                              }}
                            >
                              MFG Qty
                            </div>
                          }
                          rules={[
                            {
                              required: true,
                              message: "Enter MFG Qty",
                            },
                          ]}
                        >
                          <Input
                            value={headerData.mfgQty}
                            onChange={(e) =>
                              headerInputhandler("mfgQty", +e.target.value)
                            }
                            size="default"
                          />
                        </Form.Item>
                      </Form>
                    </Col>
                    {/* <Col span={4}>
                      <Form layout="vertical">
                        <Form.Item label=" ">
                          <Button onClick={calcActualQty}>Calculate</Button>
                        </Form.Item>
                      </Form>
                    </Col> */}
                  </Row>
                  <Row gutter={16}>
                    <Col span={6}>
                      {" "}
                      <Form size="small" layout="vertical">
                        <Form.Item
                          label={
                            <div
                              style={{
                                fontSize: window.innerWidth < 1600 && "0.7rem",
                              }}
                            >
                              PPR Comment
                            </div>
                          }
                        >
                          <Input.TextArea
                            disabled={true}
                            value={headerData?.comment}
                            style={{ resize: "none" }}
                            rows={4}
                          />
                        </Form.Item>
                      </Form>
                    </Col>
                    <Col span={6}>
                      <Form size="small" layout="vertical">
                        <Form.Item
                          label={
                            <div
                              style={{
                                fontSize: window.innerWidth < 1600 && "0.7rem",
                              }}
                            >
                              Comments
                            </div>
                          }
                        >
                          <Input.TextArea
                            value={headerData?.myComment}
                            onChange={(e) =>
                              setHeaderData((d) => {
                                return { ...d, myComment: e.target.value };
                              })
                            }
                            style={{ resize: "none" }}
                            rows={4}
                          />
                        </Form.Item>
                      </Form>
                    </Col>
                  </Row>
                </>
              )}

              <NavFooter
                submitFunction={() => {
                  calcActualQty();
                  setActiveKey("P");
                }}
              />
            </div>
          ),
        closable: tab == "1" ? false : true,
      };
    });

    setTabItems(arr);
  }, [tableData, headerData]);
  return (
    <Drawer
      title={`Manage PPR: ${editPPR?.prod_transaction}`}
      width="100vw"
      onClose={() => setEditPPR(null)}
      open={editPPR}
    >
      <Skeleton active loading={pageLoading} />
      <Skeleton active loading={pageLoading} />
      <Skeleton active loading={pageLoading} />
      {!pageLoading && (
        <Tabs
          type="editable-card"
          onChange={onChange}
          onTabClick={() => console.log("something")}
          tabBarExtraContent={
            activeKey == "1"
              ? false
              : {
                  right: (
                    <Text>
                      {tableData.filter((row) => row.type == activeKey).length}{" "}
                      Items
                    </Text>
                  ),
                }
          }
          activeKey={activeKey}
          onEdit={onEdit}
          items={tabsExist.map((tab) => {
            console.log(activeKey);
            return {
              disabled: activeKey === "1",
              ...tabItems.filter((item) => tab == item.key)[0],
            };
          })}
          hideAdd={true}
        />
      )}

      {activeKey != 1 && (
        <NavFooter
          loading={submitLoading}
          submitFunction={validateHandler}
          nextLabel="Submit"
        />
      )}
    </Drawer>
  );
}
