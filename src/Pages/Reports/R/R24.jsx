import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import { useState } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { useEffect } from "react";
import MyDataTable from "../../../Components/MyDataTable";
import { downloadCSV } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getComponentOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi";
const R24 = () => {
  const { user: stateUser } = useSelector((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [filterTerm, setfilterTerm] = useState("");
  const [rows, setRows] = useState([]);

  const [userComponents, setUserComponents] = useState([]);
  const [filterForm] = Form.useForm();

  const { executeFun, loading: loading1 } = useApi();
  const user = Form.useWatch("user", filterForm);

  const getUserOptions = async (search) => {
    setLoading("select");
    const { data } = await imsAxios.post("/backend/fetchAllUser", {
      search: search,
    });
    setLoading(false);
    let arr = data.map((row) => ({ text: row.text, value: row.id }));
    setAsyncOptions(arr);
  };

  const getComponentOption = async (search) => {
    // setLoading("select");
    // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search: search,
    // });
    // setLoading(false);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data } = response;
    let arr = data.map((row) => ({
      value: row.id,
      text: row.text,
    }));
    setAsyncOptions(arr);
  };
  const getRows = async () => {
    try {
      const values = await filterForm.validateFields();
      setLoading("fetch");
      const response = await imsAxios.post("/report24", {
        user_id: values.user.value,
      });
      const { data } = response;
      if (data) {
        if (data.code === "200") {
          let arr = data.response.data;
          arr = arr.map((row, index) => ({
            id: index + 1,
            component: row.COMPONENT,
            partCode: row.PART_NO,
            newpartCode: row.PART_NO_NEW,
            storeStock: row.CURRENT_RM_IN_STORE,
            storeInQty: row.TODAY_INWARD_IN_STORE,
            storeOutQty: row.TODAY_OUTWARD_IN_STORE,
            storeClosingStock: row.CLOSING_STOCK_STORE,
            sfStock: row.SF_CURRENT_RM,
            sfInQty: row.TODAY_INWARD_SF,
            sfDispatchQty: row.SF_DISPATCH_PRODUCT,
            sfClosingStock: row.CLOSING_STOCK_SF,
          }));
          setRows(arr);
        } else {
          setRows([]);
        }
      } else {
        setRows([]);
      }
    } catch (error) {
      console.log("some error occured while fetching report", error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  const getUserComponents = async (userId) => {
    try {
      setLoading("components");
      const response = await imsAxios.post("/report24/getSelectedValue", {
        user_id: userId,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.part_options.map((row) => ({
            value: row.id,
            text: row.text,
          }));

          setUserComponents(arr);
        } else {
          toast.error(data.message.msg);
          setUserComponents([]);
        }
      } else {
        setUserComponents([]);
      }
    } catch (error) {
      console.log("Some error occured while fetching user components", error);
    } finally {
      setLoading(false);
    }
  };
  const addUserComponent = async () => {
    try {
      const values = await filterForm.validateFields(["component"]);
      setLoading("addComponent");
      const response = await imsAxios.post("/report24/update", {
        component_part: [
          ...userComponents.map((row) => row.value),
          values.component.value,
        ],
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          getUserComponents(stateUser.id);
          filterForm.setFieldValue("component", undefined);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
      console.log("Some error occured while adding user component", error);
    } finally {
      setLoading(false);
    }
  };
  const deleteUserComponent = async (componentId) => {
    try {
      let arr = userComponents;
      arr = arr.filter((row) => row.value !== componentId);
      setLoading(componentId);
      const response = await imsAxios.post("/report24/update", {
        component_part: arr.map((row) => row.value),
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          getUserComponents(stateUser.id);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
      console.log("Some error occured while deleting user component", error);
    } finally {
      setLoading(false);
    }
  };
  const downloadHandler = () => {
    downloadCSV(rows, columns, `R24 Report`);
  };
  useEffect(() => {
    if (user) {
      getUserComponents(user.value);
    }
  }, [user]);

  useEffect(() => {
    if (stateUser) {
      filterForm.setFieldValue("user", {
        label: stateUser.userName,
        value: stateUser.id,
      });
      // getRows();
    }
  }, []);
  return (
    <Row gutter={6} style={{ height: "90%", padding: 10, paddingTop: 0 }}>
      <Col span={4} style={{ height: "100%", overflow: "hidden" }}>
        <Row gutter={[0, 6]} style={{ height: "100%", overflow: "hidden" }}>
          <Col span={24}>
            <Card size="small" title="Filters">
              <Form form={filterForm} layout="vertical">
                <Form.Item label="User" name="user">
                  <MyAsyncSelect
                    optionsState={asyncOptions}
                    onBlur={() => setAsyncOptions([])}
                    labelInValue
                    selectLoading={loading === "select"}
                    loadOptions={getUserOptions}
                  />
                </Form.Item>
                <Row justify="end">
                  <Space>
                    <CommonIcons
                      action="downloadButton"
                      onClick={downloadHandler}
                      disabled={rows.length === 0}
                    />
                    <Button
                      loading={loading === "fetch"}
                      onClick={getRows}
                      type="primary"
                    >
                      Fetch
                    </Button>
                  </Space>
                </Row>

                <Typography.Text strong>Add Component</Typography.Text>
                <Form.Item label="Component" name="component">
                  <MyAsyncSelect
                    optionsState={asyncOptions}
                    onBlur={() => setAsyncOptions([])}
                    labelInValue
                    selectLoading={loading === "select"}
                    loadOptions={getComponentOption}
                  />
                </Form.Item>
                <Row justify="end">
                  <Space>
                    <Button
                      loading={loading === "addComponent"}
                      onClick={addUserComponent}
                      type="primary"
                    >
                      Add Component
                    </Button>
                  </Space>
                </Row>
              </Form>
            </Card>
          </Col>
          <Col span={24} style={{ height: "80%", overflow: "hidden" }}>
            <Card
              size="small"
              title="User Components"
              style={{ height: "70%" }}
              bodyStyle={{ height: "95%" }}
            >
              <Row
                style={{
                  height: "90%",
                  overflow: "auto",
                  overflowX: "hidden",
                  paddingBottom: 50,
                }}
              >
                <Col span={24}>
                  <Input
                    placeholder="Filter Component"
                    value={filterTerm}
                    onChange={(e) => setfilterTerm(e.target.value)}
                  />
                  <Row style={{ marginTop: 5 }}>
                    {loading !== "components" &&
                      userComponents
                        .filter((row) =>
                          row.text.toString().toLowerCase().includes(filterTerm)
                        )
                        .map((row) => (
                          <Col span={24}>
                            <Row gutter={4}>
                              <Col span={22}>
                                <Typography.Text
                                  strong
                                  style={{ fontSize: "0.7rem" }}
                                >
                                  {row.text}
                                </Typography.Text>
                              </Col>
                              <Col span={2}>
                                {userComponents.length > 1 && (
                                  <CommonIcons
                                    loading={loading === row.value}
                                    onClick={() =>
                                      deleteUserComponent(row.value)
                                    }
                                    action="deleteButton"
                                  />
                                )}
                              </Col>
                            </Row>
                          </Col>
                        ))}

                    {loading === "components" &&
                      [1, 1, 1, 1, 1].map(() => (
                        <Skeleton.Input
                          block
                          active={true}
                          size="small"
                          style={{ margin: "3px 0" }}
                        />
                      ))}

                    <Col span={24}>
                      <Row justify="center">
                        <Typography.Text type="secondary">
                          --End of the List--
                        </Typography.Text>
                      </Row>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Col>
      <Col span={20}>
        <MyDataTable
          loading={loading === "fetch"}
          data={rows}
          columns={columns}
        />
      </Col>
    </Row>
  );
};

export default R24;

const columns = [
  {
    headerName: "#",
    width: 30,
    field: "id",
  },

  {
    headerName: "Component",
    minWidth: 250,
    flex: 1,
    field: "component",
    renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
  },
  {
    headerName: "Part Code",
    width: 120,
    field: "partCode",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.partCode} xopy={true} />
    ),
  },
  {
    headerName: "Cat Part Code",
    width: 150,
    field: "newpartCode",
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.newpartCode} xopy={true} />
    ),
  },
  {
    headerName: "Store Opening stock",
    width: 180,
    field: "storeStock",
  },
  {
    headerName: "Store IN Qty (Today)",
    width: 180,
    field: "storeInQty",
  },
  {
    headerName: "Store OUT Qty (Today)",
    width: 180,
    field: "storeOutQty",
  },
  {
    headerName: "Store closing stock (Today)",
    width: 180,
    field: "storeClosingStock",
  },

  {
    headerName: "SF Opening stock",
    width: 180,
    field: "sfStock",
  },
  {
    headerName: "SF inward Qty (Today)",
    width: 180,
    field: "sfInQty",
  },
  {
    headerName: "SF dispatch Qty (Today)",
    width: 180,
    field: "sfDispatchQty",
  },
  {
    headerName: "SF closing stock (Today)",
    width: 180,
    field: "sfClosingStock",
  },
];
