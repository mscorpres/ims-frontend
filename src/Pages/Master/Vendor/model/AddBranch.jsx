import React, { useEffect, useState } from "react";
import "../../Modal/modal.css";
import { Button, Row, Col, Input, Drawer, Skeleton, Form, Space } from "antd";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import errorToast from "../../../../Components/errorToast";
import { imsAxios } from "../../../../axiosInterceptor";

const { TextArea } = Input;

const AddBranch = ({ openBranch, setOpenBranch, getVendorBracnch }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [addBilling, setAddBilling] = useState({
    vendor: {
      vname: openBranch?.vendor_code,
    },
    branch: {
      branchname: "",
      address: "",
      state: "",
      city: "",
      pin: "",
      fax: "",
      mobile: "",
      email: "",
      gst: "",
    },
  });

  const inputHandler = (name, value) => {
    if (name === "vname" || name === "pan" || name === "cin") {
      setAddBilling((addBilling) => {
        return {
          ...addBilling,
          vendor: { ...addBilling.vendor, [name]: value },
        };
      });
    } else {
      setAddBilling((addBilling) => {
        return {
          ...addBilling,
          branch: { ...addBilling.branch, [name]: value },
        };
      });
    }
  };
  const getFetchState = async (e) => {
    if (e.length > 1) {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/backend/stateList", {
        search: e,
      });
      setSelectLoading(false);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const addBranch = async () => {
    if (!addBilling.branch.branchname) {
      toast.error("Please add Branch name");
    } else if (!addBilling.branch.state) {
      toast.error("Please select state");
    } else if (!addBilling.branch.city) {
      toast.error("Please enter City");
    } else if (!addBilling.branch.gst) {
      toast.error("Please enter GST no");
    } else if (!addBilling.branch.pin) {
      toast.error("Please enter pin no..");
    } else if (!addBilling.branch.mobile) {
      toast.error("Please enter Mobile no");
    } else if (!addBilling.branch.address) {
      toast.error("Please enter Address");
    } else {
      setSubmitLoading(true);
      const { data } = await imsAxios.post("/vendor/addVendorBranch", {
        vendor: {
          vendorname: openBranch.vendor_code,
        },
        branch: {
          branch: addBilling.branch.branchname,
          address: addBilling.branch.address,
          state: addBilling.branch.state.value,
          city: addBilling.branch.city,
          pincode: addBilling.branch.pin,
          fax: addBilling.branch.fax == "" && "--",
          mobile: addBilling.branch.mobile,
          email: addBilling.branch.email == "" && "--",
          gstin: addBilling.branch.gst,
        },
      });
      setSubmitLoading(false);
      if (data.code == 200) {
        toast.success(data.message);
        if (getVendorBracnch) {
          getVendorBracnch(openBranch.vendor_code);
        }
        setOpenBranch(false);
        reset();
      } else if (data.code == 500) {
        toast.error(errorToast(data.message));
      }
    }
  };
  const reset = () => {
    setAddBilling({
      branch: {
        branchname: "",
        address: "",
        state: "",
        city: "",
        pin: "",
        fax: "",
        mobile: "",
        email: "",
        gst: "",
      },
    });
  };
  useEffect(() => {
    reset();
  }, [openBranch]);
  return (
    <Drawer
      title={`Add Branch of Vendor: ${openBranch?.vendor_code}`}
      centered
      confirmLoading={submitLoading}
      open={openBranch}
      onClose={() => setOpenBranch(false)}
      width="50vw"
    >
      <Form
        style={{ marginTop: -10, height: "95%", overflowY: "auto" }}
        layout="vertical"
        size="small"
      >
        <Row style={{ width: "100%" }}>
          <>
            <Col span={12} style={{ padding: 3 }}>
              <Form.Item label="Branch Name">
                <Input
                  size="default "
                  // placeholder="Branch Name"
                  value={addBilling.branch.branchname}
                  onChange={(e) => inputHandler("branchname", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>

            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="State">
                <MyAsyncSelect
                  selectLoading={selectLoading}
                  optionsState={asyncOptions}
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getFetchState}
                  value={addBilling.branch.state}
                  onChange={(e) => inputHandler("state", e)}
                  labelInValue
                />
              </Form.Item>
            </Col>
            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="City">
                <Input
                  size="default "
                  // placeholder="Branch City"
                  value={addBilling.branch.city}
                  onChange={(e) => inputHandler("city", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="GST Number">
                <Input
                  size="default "
                  // placeholder="Gst Number"
                  value={addBilling.branch.gst}
                  onChange={(e) => inputHandler("gst", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="Pin Code">
                <Input
                  size="default "
                  // placeholder="Branch Pincode"
                  value={addBilling.branch.pin}
                  onChange={(e) => inputHandler("pin", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="Email">
                <Input
                  size="default "
                  // placeholder="Email"
                  value={addBilling.branch.email}
                  onChange={(e) => inputHandler("email", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="Mobile">
                <Input
                  size="default "
                  value={addBilling.branch.mobile}
                  onChange={(e) => inputHandler("mobile", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="Fax Number">
                <Input
                  size="default "
                  // placeholder="Fax No"
                  value={addBilling.branch.fax}
                  onChange={(e) => inputHandler("fax", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col>
            <Col span={24} style={{ padding: "3px" }}>
              <Form.Item label="Branch Address">
                <TextArea
                  rows={4}
                  maxLength={200}
                  // placeholder="Please Enter Full Address "
                  value={addBilling.branch.address}
                  onChange={(e) => inputHandler("address", e.target.value)}
                />
              </Form.Item>
            </Col>
          </>
        </Row>
      </Form>
      <Row justify="end">
        <Space>
          <Button onClick={reset} size="default">
            Reset
          </Button>
          <Button
            size="default"
            type="primary"
            loading={submitLoading}
            onClick={addBranch}
          >
            Submit
          </Button>
        </Space>
      </Row>
    </Drawer>
  );
};

export default AddBranch;
