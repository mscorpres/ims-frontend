import { useState, useEffect } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import {
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Row,
  Modal,
  Button,
  Card,
} from "antd";
import MySelect from "../../../Components/MySelect";
import NavFooter from "../../../Components/NavFooter";
import { toast } from "react-toastify";
import Loading from "../../../Components/Loading";
import ViewClients from "../ViewClients/ViewClients";
import MyButton from "../../../Components/MyButton";

export default function AddClients() {
  const [countriesOptions, setCountriesOptions] = useState([]);
  const [stateOptions, setStateOptions] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(83);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [addClientForm] = Form.useForm();

  const getCountries = async () => {
    setPageLoading(true);
    const { data } = await imsAxios.get("/tally/backend/countries");
    setPageLoading(false);
    let arr = [];
    if (data.data[0]) {
      arr = data.data.map((row) => ({ text: row.name, value: row.code }));
      setCountriesOptions(arr);
    }
  };
  const getState = async () => {
    setPageLoading(true);
    const { data } = await imsAxios.get("/tally/backend/states");
    setPageLoading(false);
    if (data.data[0]) {
      let arr = data.data.map((row) => ({
        text: row.name,
        value: row.code,
      }));
      setStateOptions(arr);
    }
  };
  const submitHandler = async () => {
    const values = await addClientForm.validateFields();
    const newObj = {
      clientName: values.name,
      salesperson: values.salesperson,
      gst: values.gst,
      panNo: values.panNo,
      email: values.email,
      phone: values.phone,
      mobileNo: values.mobileNo,
      // country: values.country,
      // state: values.state,
      // state2: values.state,
      // city: values.city,
      // zipcode: values.zipcode,
      // address: values.address,
      website: values.website,
    };
    setShowSubmitConfirm(newObj);
    setSubmitLoading(true);
    const response = await imsAxios.post("/client/add", newObj);
    setSubmitLoading(false);
      if (response?.success) {
        toast.success(response.message);
        resetFunction();
        setShowSubmitConfirm(false);
      } else {
        toast.error(response.message);
      }
  };
  const resetFunction = () => {
    addClientForm.setFieldsValue({
      name: "",
      salesperson: "",
      gst: "",
      panNo: "",
      email: "",
      phone: "",
      mobileNo: "",
      country: 83,
      state: "",
      city: "",
      zipcode: "",
      address: "",
      website: "",
    });
    setShowResetConfirm(false);
  };
  useEffect(() => {
    getCountries();
    addClientForm.setFieldsValue({
      name: "",
      salesperson: "",
      gst: "",
      panNo: "",
      email: "",
      phone: "",
      mobileNo: "",
      country: 83,
      state: "",
      city: "",
      zipcode: "",
      address: "",
      website: "",
    });
  }, []);
  useEffect(() => {
    let obj = addClientForm.getFieldsValue(true);
    addClientForm.setFieldsValue({
      ...obj,
      state: "",
    });
    if (selectedCountry === 83) {
      getState();
    }
  }, [selectedCountry]);
  return (
    <div>
      {pageLoading && <Loading />}
      {/* submit confirm modal */}
      <Modal
        open={showSubmitConfirm}
        title="Add Client"
        onOk={submitHandler}
        onCancel={() => setShowSubmitConfirm(false)}
        footer={[
          <MyButton
            key="back"
            onClick={() => setShowSubmitConfirm(false)}
            variant="back"
          >
            No
          </MyButton>,
          <MyButton
            key="submit"
            type="primary"
            loading={submitLoading}
            onClick={submitHandler}
            variant="add"
          >
            Yes
          </MyButton>,
        ]}
      >
        Are you sure you want to add this client?
      </Modal>
      {/* reset cofirm modal */}
      <Modal
        open={showResetConfirm}
        title="Reset Info"
        onOk={resetFunction}
        onCancel={() => setShowResetConfirm(false)}
        footer={[
          <MyButton
            key="back"
            onClick={() => setShowResetConfirm(false)}
            variant="back"
          >
            back
          </MyButton>,
          <MyButton
            key="submit"
            type="primary"
            onClick={resetFunction}
            variant="add"
          >
            Submit
          </MyButton>,
        ]}
      >
        Are you sure you want to want to reset the entered Info?
      </Modal>
      <div style={{ height: "100%" }}>
        <Form
          layout="vertical"
          size="small"
          form={addClientForm}
          onFinish={(values) => setShowSubmitConfirm(values)}
        >
          <Row style={{ height: "90%" }}>
            <Col span={8}>
              <Row>
                {" "}
                <Col span={20}>
                  <Card style={{ height: "100%" }}>
                    {/* <Row gutter={16}>Client Name</Row> */}
                    <Col span={24}>
                      <Form.Item
                        name="name"
                        label="Client Name"
                        rules={rules.name}
                      >
                        <Input size="default" />
                      </Form.Item>
                    </Col>

                    {/* Client sales person */}
                    <Col span={24}>
                      <Form.Item
                        name="salesperson"
                        label="Sales Person Name"
                        rules={rules.salesperson}
                      >
                        <Input size="default" />
                      </Form.Item>
                    </Col>

                    {/* GST Number */}
                    {/* <Col> */}
                    <Row gutter={2}>
                      <Col span={12}>
                        <Form.Item
                          name="gst"
                          label="GST Number"
                          rules={rules.gst}
                        >
                          <Input size="default" />
                        </Form.Item>
                      </Col>

                      {/* Pan Number */}
                      <Col span={12}>
                        <Form.Item
                          name="panNo"
                          label="PAN Number"
                          rules={rules.panNo}
                        >
                          <Input size="default" />
                        </Form.Item>
                      </Col>
                    </Row>
                    {/* </Col> */}
                    <Col span={24}>
                      <Form.Item name="email" label="Email" rules={rules.email}>
                        <Input size="default" />
                      </Form.Item>
                    </Col>
                    <Row gutter={2}>
                      <Col span={12}>
                        <Form.Item
                          name="phone"
                          label="Phone Number"
                          rules={rules.phone}
                        >
                          <Input size="default" />
                        </Form.Item>
                      </Col>

                      {/* Client mobile */}
                      <Col span={12}>
                        <Form.Item
                          name="mobileNo"
                          label="Mobile Number"
                          rules={rules.mobileNo}
                        >
                          <Input size="default" />
                        </Form.Item>
                      </Col>
                    </Row>
                    {/* Client number */}

                    {/* Client website */}
                    <Col span={24}>
                      <Form.Item
                        name="website"
                        label="Website"
                        rules={rules.website}
                      >
                        <Input size="default" />
                      </Form.Item>
                    </Col>
                    {/* <Row gutter={16}>Client email</Row> */}
                    <Row justify="end">
                      <Col span={5}>
                        <MyButton
                          onClick={() => setShowResetConfirm(true)}
                          variant="reset"
                        >
                          Reset
                        </MyButton>
                      </Col>
                      <Col span={5}>
                        <MyButton
                          onClick={() => setShowSubmitConfirm(true)}
                          type="primary"
                          variant="add"
                        >
                          Submit
                        </MyButton>
                      </Col>
                    </Row>
                  </Card>
                </Col>
                {/* <NavFooter
                submithtmlType="submit"
                submitButton={true}
                nextLabel="Submit"
                formName="add-client"
                resetFunction={setShowResetConfirm}
              /> */}
              </Row>
            </Col>
            <Col span={16} style={{ paddingLeft: "0px" }}>
              <div style={{ height: "115%" }}>
                <ViewClients />
              </div>
            </Col>
          </Row>
        </Form>
      </div>
    </div>
  );
}

const rules = {
  name: [
    {
      required: true,
      message: "Please Input Client's Name!",
    },
  ],
  salesperson: [
    {
      required: false,
      message: "Please Input salesperson's Name!",
    },
  ],
  email: [
    {
      required: false,
      message: "Please Input email!",
    },
  ],
  website: [
    {
      required: false,
      message: "Please Input website!",
    },
  ],

  gst: [
    {
      required: true,
      message: "Please Input the client's GST Number !",
    },
  ],
  panNo: [
    {
      required: true,
      message: "Please Input the client's PAN Number!",
    },
  ],
  mobileNo: [
    {
      required: true,
      message: "Please enter client's phone number!",
    },
  ],
  // country: [
  //   {
  //     required: true,
  //     message: "Please select Client's Country!",
  //   },
  // ],

  // state: [
  //   {
  //     required: true,
  //     message: "Please select client's state",
  //   },
  // ],

  // city: [
  //   {
  //     required: true,
  //     message: "Please enter client's City",
  //   },
  // ],

  // zipcode: [
  //   {
  //     required: true,
  //     message: "Please enter Clients zip code!",
  //   },
  // ],

  // address: [
  //   {
  //     required: true,
  //     message: "Please Enter Client's Address!",
  //   },
  // ],
};
