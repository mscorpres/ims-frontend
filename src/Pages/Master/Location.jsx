import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Switch,
  Tree,
} from "antd";
import MySelect from "../../Components/MySelect";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import Loading from "../../Components/Loading";
import { imsAxios } from "../../axiosInterceptor";
import useApi from "../../hooks/useApi.ts";
import { getCostCentresOptions } from "../../api/general";
import MyDataTable from "../gstreco/myDataTable";
import TableActions from "../../Components/TableActions.jsx/TableActions";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { convertSelectOptions } from "../../utils/general";
import MyButton from "../../Components/MyButton";

function Location() {
  const [treeData, setTreeData] = useState([]);
  const [treeLoading, setTreeLoading] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [addLocationForm] = Form.useForm();
  const [disableLocationForm] = Form.useForm();
  const [maploc] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [viewData, setViewData] = useState(false);
  const [locDetails, setLocDetials] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [mapCostCenterModal, setMapCostCenerModal] = useState(false);
  const location = Form.useWatch("location", disableLocationForm);
  const { executeFun, loading: loading1 } = useApi();

  const LocationTypeOptions = [
    { text: "Storage", value: "1" },
    { text: "Non-Storage", value: "2" },
  ];
  const jobworkLocationOptions = [
    { text: "Yes", value: "Y" },
    { text: "No", value: "N" },
  ];

  const resetForm = () => {
    addLocationForm.resetFields();
  };
  const getDataTree = async () => {
    setTreeLoading(true);
    const { data } = await imsAxios.post("/location/fetchLocationTree");
    setTreeLoading(false);
    let a = customFlatArray(data.data);
    let arr = a.map((r, id) => {
      return { id: id + 1, ...r };
    });
    // console.log("arr", arr);
    setLocationData(arr);
    // console.log("final arr", arr);
    // setLocationData(a);
    setTreeData(data.data);
  };

  let arr = [];
  const customFlatArray = (array, prev) => {
    array?.map((row) => {
      let parent = "--";
      let obj = row;
      if (!row.children) {
        if (prev) {
          obj["parentLocation"] = prev.name;
        } else {
          obj["parentLocation"] = "--";
        }
      }
      if (row.children) {
        if (prev) {
          obj["parentLocation"] = prev.name;
        } else {
          obj["parentLocation"] = "--";
        }
        let children = row.children;

        delete obj["children"];
        arr = [...arr, obj];
        customFlatArray(children, obj);
        arr = [...arr, ...children];
        // }
      }
      //  else {
      //   let obj = row;

      //   if (prev) {
      //     obj["parentLocation"] = prev.name;
      //   } else {
      //     obj["parentLocation"] = "--";
      //   }
      //   arr = [...arr, obj];
      // }
    });

    return arr;
  };

  const getParentLocationOptions = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/location/fetchLocation", {
      searchTerm: search,
    });
    setSelectLoading(false);
    if (data[0]) {
      let arr = data.map((row) => ({
        value: row.id,
        text: row.text,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };

  const submitHandler = async (values) => {
    let obj = {
      location_name: values?.locationName,
      location_under: values?.locationUnder,
      location_type: values?.locationType,
      location_address: values?.address,
      mapping_user: values?.username,
      vendor_loc: values?.jobworkLocation,
    };
    setSubmitLoading(true);
    const { data } = await imsAxios.post("/location/insertLocation", obj);
    setSubmitLoading(false);
    if (data.code === 200) {
      toast.success(data.message);
      resetForm();
      getDataTree();
    } else {
      toast.error(data.message.msg);
    }
  };

  const searchLocation = async (search) => {
    setSelectLoading(true);
    const response = await imsAxios.post("/location/fetchLocation", {
      searchTerm: search,
    });
    setSelectLoading(false);
    const { data } = response;
    if (data) {
      let arr = data.map((row) => ({ text: row.text, value: row.id }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };

  const getLocationStatus = async (locationId) => {
    const payload = {
      location_key: locationId,
    };
    setLoading("fetchStatus");
    const response = await imsAxios.post(
      "/location/fetchLocationStatus",
      payload
    );
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        const status = data.data[0].status;
        disableLocationForm.setFieldValue("status", status === "ACTIVE");
      }
      {
        toast.error(data.message.msg);
      }
    }
  };

  const disableValidateHandler = async (row) => {
    const values = await disableLocationForm.validateFields();
    const payload = {
      location_key: row.label,
      status: values.status ? "ACTIVE" : "BLOCK",
    };

    Modal.confirm({
      title: "Changing Location Status",
      content: `Are you sure you want to change the status of location ${row.name}?`,
      okText: "Continue",
      onOk: () => disableSubmitHandler(payload),
      cancelText: "Back",
    });
  };

  const disableSubmitHandler = async (values) => {
    const response = await imsAxios.post(
      "/location/changeLocationStatus",
      values
    );
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        getDataTree();
        toast.success(data.message);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const mapLocSubmitHandler = async (values) => {
    const response = await imsAxios.post("/location/updatLocationCC", values);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        getDataTree();
        toast.success(data.message);
        maploc.resetFields();
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const maplocValidateHandler = async () => {
    setMapCostCenerModal(false);
    // console.log("row -", mapCostCenterModal);
    const values = await maploc.validateFields();
    const payload = {
      location: mapCostCenterModal.label,
      costcenter: values.costCenter.value,
    };

    Modal.confirm({
      title: "Map Locations",
      content: "Are you sure you want to the location with Cost Center?",
      okText: "Continue",
      onOk: () => mapLocSubmitHandler(payload),
      cancelText: "Back",
    });
  };
  // const getCostCenteres = async (search) => {
  //   const response = await executeFun(
  //     () => getCostCentresOptions(search),
  //     "select"
  //   );
  //   let arr = [];
  //   console.log("response", response);
  //   if (response.success) {
  //     arr = convertSelectOptions(response.data);
  //     setAsyncOptions(arr);
  //   }
  // };
  const getCostCenteres = async (search) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select"
    );
    let arr = [];
    console.log("response", response);
    if (response.success) {
      arr = convertSelectOptions(response.data);
      console.log("arr", arr);
      setAsyncOptions(arr);
    }
  };
  const coloums = [
    {
      headerName: "Actions",
      width: 150,
      type: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          // disabled={loading}
          onClick={() => {
            // mapCC(row);
            setMapCostCenerModal(row);
          }}
          label="Map Cost Center"
        />,
        <GridActionsCellItem
          showInMenu
          // disabled={loading}
          onClick={() => {
            // mapCC(row);
            setViewData(row);
          }}
          label="View Details"
        />,
      ],
    },

    {
      field: "name",
      headerName: "Locations Name",
      flex: 1,
      renderCell: ({ row }) => <span>{row?.name}</span>,
    },
    {
      field: "parentLocation",
      headerName: "Parent Location",
      width: 150,
    },
    {
      headerName: "Is Blocked",
      width: 180,
      field: "status",
      type: "actions",
      renderCell: ({ row }) => (
        <Switch
          size="small"
          checked={row.status === "BLOCK"}
          // loading={loading === row.bomId}
          onChange={() => {
            disableValidateHandler(row);
          }}
        />
      ),
    },
  ];
  const locColoums = [
    {
      field: "id",
      headerName: "#",
      width: 50,
    },
    {
      field: "loc_name",
      headerName: "Locations Name",
      width: 150,
    },
    {
      field: "parent_loc_name",
      headerName: "Parent Location",
      width: 150,
    },
    {
      field: "loc_type",
      headerName: "Location Type",
      width: 150,
    },
    {
      field: "loc_for",
      headerName: "Location For",
      width: 150,
    },
    {
      field: "loc_address",
      headerName: "Location Address",
      width: 150,
    },
    {
      field: "assigned_to",
      headerName: "Assigned To",
      width: 150,
    },
    {
      field: "insert_date",
      headerName: "Insert Date",
      width: 150,
    },
    {
      field: "insert_by",
      headerName: "Insert By",
      width: 150,
    },
  ];
  const getLoactionDetails = async (row) => {
    setLocDetials("");
    setLoading(true);

    // console.log("viewData", row);
    const response = await imsAxios.post("/location/fetch_location_details", {
      location_key: row.label,
    });
    // console.log("response", response);
    if (response.success) {
      let { data } = response;
      let id = 0;
      let obj = {
        ...data,
        id: id + 1,
      };
      // let extractedData = [];
      // extractedData = extractedData.push([data]);
      // console.log("data", data);
      // arr = extractedData.map((r, id) => {
      //   return { id: id + 1, ...r };
      // });
      // console.log("obj", obj);
      setLocDetials([obj]);
      setLoading(false);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (viewData) {
      getLoactionDetails(viewData);
    }
  }, [viewData]);

  const mapCC = async (row) => {
    // console.log("row", row);
    Modal.confirm({
      title: `Please map the cost center to ${row.name}`,
      // icon: <ExclamationCircleFilled />,
      content: (
        <Row style={{ marginTop: 10 }}>
          <Col span={24}>
            {/* <Form form={costcenterForm} layout="vertical">
              <Form.Item name="costCenter" label="Cost Center"> */}
            <MyAsyncSelect
              labelInValue={true}
              optionsState={asyncOptions}
              onBlur={() => setAsyncOptions([])}
              loadOptions={getCostCenteres}
              selectLoading={loading1("select")}
            />
            {/* </Form.Item> */}
            {/* </Form> */}
          </Col>
        </Row>
      ),
      onOk: async () => {
        const values = await cancelForm.validateFields();
        validateCancelRemarks(woId, wku, values);
      },
    });
  };
  const close = () => {
    maploc.resetFields(), setMapCostCenerModal(false);
  };
  useEffect(() => {
    addLocationForm.setFieldsValue({
      locationName: "",
      locationUnder: "",
      locationType: "1",
      username: "",
      jobworkLocation: "N",
      address: "",
    });
    getDataTree();
  }, []);
  useEffect(() => {
    if (location) {
      getLocationStatus(location.value);
    }
  }, [location]);
  return (
    <div style={{ height: "90%", overflow: "auto" }}>
      <Modal
        open={mapCostCenterModal}
        footer={null}
        width={400}
        title={`Map Cost Center with Location ${mapCostCenterModal.name} `}
        closable={false}
      >
        <Form
          form={maploc}
          initialValues={{
            location: "",
          }}
          layout="vertical"
        >
          <Row gutter={6}>
            <Col span={24}>
              <Form.Item name="costCenter" label="Cost Center">
                <MyAsyncSelect
                  labelInValue={true}
                  optionsState={asyncOptions}
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getCostCenteres}
                  selectLoading={loading1("select")}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <Space>
              <Button onClick={close}>Cancel</Button>
              <Button type="primary" onClick={maplocValidateHandler}>
                Submit
              </Button>
            </Space>
          </Row>
        </Form>
      </Modal>
      <Row gutter={10} style={{ margin: "10px", height: "80%" }}>
        <Col span={8}>
          <Row gutter={[0, 6]}>
            <Col span={24}>
              <Card size="small" title="Add Location">
                <Form
                  onFinish={submitHandler}
                  form={addLocationForm}
                  layout="vertical"
                  size="small"
                >
                  <Row>
                    <Col span={24}>
                      <Form.Item
                        name="locationName"
                        label="Location Name"
                        rules={[
                          {
                            required: true,
                            message: "Please Enter a location Name",
                          },
                        ]}
                      >
                        <Input size="default" />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Row gutter={4}>
                        <Col span={12}>
                          <Form.Item
                            name="locationUnder"
                            label="Parent Location"
                            rules={[
                              {
                                required: true,
                                message: "Please Select a Parent Location",
                              },
                            ]}
                          >
                            <MyAsyncSelect
                              loadOptions={getParentLocationOptions}
                              onBlur={() => setAsyncOptions([])}
                              optionsState={asyncOptions}
                              selectLoading={selectLoading}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="locationType"
                            label="Location Type"
                            rules={[
                              {
                                required: true,
                                message: "Please Select a Location Type",
                              },
                            ]}
                          >
                            <MySelect options={LocationTypeOptions} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={24}>
                      <Row gutter={4}>
                        <Col span={12}>
                          <Form.Item name="username" label="User Name">
                            <Input size="default" />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="jobworkLocation"
                            label="Job Work Location?"
                            rules={[
                              {
                                required: true,
                                message:
                                  "Please Select if this is a Jobwork Location",
                              },
                            ]}
                          >
                            <MySelect options={jobworkLocationOptions} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={24}>
                      <Form.Item name="address" label="Address">
                        <Input.TextArea rows={4} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Row gutter={10} justify="end">
                        <Col>
                          <Form.Item>
                            <MyButton
                              htmlType="button"
                              size="default"
                              onClick={() => resetForm()}
                              variant="reset"
                            >
                              Reset
                            </MyButton>
                          </Form.Item>
                        </Col>
                        <Col>
                          <Form.Item>
                            <MyButton
                              loading={submitLoading}
                              htmlType="submit"
                              size="default"
                              type="primary"
                              variant="add"
                            >
                              Submit
                            </MyButton>
                          </Form.Item>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>
            {/* <Col span={24}>
              <Card size="small" title="Enable/Disable Location">
                {loading === "fetchStatus" && <Loading />}
                <Form
                  form={disableLocationForm}
                  initialValues={{
                    location: "",
                  }}
                  layout="vertical"
                >
                  <Row gutter={6}>
                    <Col span={20}>
                      <Form.Item name="location" label="Location">
                        <MyAsyncSelect
                          labelInValue={true}
                          optionsState={asyncOptions}
                          onBlur={() => setAsyncOptions([])}
                          loadOptions={searchLocation}
                          selectLoading={selectLoading}
                        />
                      </Form.Item>
                    </Col>
                    <Col>
                      <Form.Item
                        label="Status"
                        name="status"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row justify="end">
                    <Space>
                      <Button onClick={() => disableLocationForm.resetFields()}>
                        Cancel
                      </Button>
                      <Button type="primary" onClick={disableValidateHandler}>
                        Submit
                      </Button>
                    </Space>
                  </Row>
                </Form>
              </Card>
            </Col> */}
            {/* <Col span={24}>
              <Card size="small" title="Map Cost Center">
                {loading === "fetchStatus" && <Loading />}
                <Form
                  form={maploc}
                  initialValues={{
                    location: "",
                  }}
                  layout="vertical"
                >
                  <Row gutter={6}>
                    <Col span={12}>
                      <Form.Item name="location" label="Location">
                        <MyAsyncSelect
                          labelInValue={true}
                          optionsState={asyncOptions}
                          onBlur={() => setAsyncOptions([])}
                          loadOptions={searchLocation}
                          selectLoading={selectLoading}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item name="costCenter" label="Cost Center">
                        <MyAsyncSelect
                          labelInValue={true}
                          optionsState={asyncOptions}
                          onBlur={() => setAsyncOptions([])}
                          loadOptions={getCostCenteres}
                          selectLoading={loading1("select")}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row justify="end">
                    <Space>
                      <Button onClick={() => maploc.resetFields()}>
                        Cancel
                      </Button>
                      <Button type="primary" onClick={maplocValidateHandler}>
                        Submit
                      </Button>
                    </Space>
                  </Row>
                </Form>
              </Card>
            </Col> */}
          </Row>
        </Col>
        <Col span={16} style={{ height: "100%" }}>
          {/* <Card
            style={{ maxHeight: 600, overflowY: "scroll" }}
            bodyStyle={{ height: "100%", overflowY: "scroll" }}
            title="Locations"
            size="small"
          > */}
          {treeLoading && <Loading />}
          {/* <Tree showLine={true} treeData={treeData} /> */}
          <Card style={{ height: "100%" }} bodyStyle={{ height: "100%" }}>
            {viewData ? (
              <>
                <MyButton
                  variant="back"
                  style={{ marginBottom: "5px", marginTop: "1px" }}
                  onClick={() => setViewData(false)}
                ></MyButton>
                <div style={{ height: "95%" }}>
                  <MyDataTable
                    columns={locColoums}
                    data={locDetails}
                    loading={loading}
                  />
                </div>
              </>
            ) : (
              <div style={{ height: "95%" }}>
                <MyDataTable
                  columns={coloums}
                  data={locationData}
                  loading={loading}
                />
              </div>
            )}
          </Card>

          {/* <div style={{ height: "95%" }}>
            <MyDataTable columns={coloums} data={locationData} />
          </div> */}
          {/* </Card> */}
        </Col>
      </Row>
    </div>
  );
}

export default Location;
