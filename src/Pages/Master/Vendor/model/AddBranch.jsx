/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import "../../Modal/modal.css";
import {
  Button,
  Row,
  Col,
  Input,
  Drawer,
  Form,
  Space,
  Typography,
  Divider,
} from "antd";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MySelect from "../../../../Components/MySelect";
import errorToast from "../../../../Components/errorToast";
import { imsAxios } from "../../../../axiosInterceptor";

const { TextArea } = Input;

const transactionTypeOptions = [
  { text: "Cheque", value: "cheque" },
  { text: "e-Fund Transfer", value: "transfer" },
  { text: "UPI", value: "upi" },
  { text: "Other", value: "other" },
  { text: "N/A", value: "na" },
];

const AddBranch = ({ openBranch, setOpenBranch, getVendorBracnch }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [currencies, setCurrencies] = useState([]);
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
      transactionType: "",
      accountNo: "",
      ifsCode: "",
      bankName: "",
      bankBranch: "",
      ledgerCurrency: "",
    },
  });

  const getCurrencies = async () => {
    try {
      const { data } = await imsAxios.get("/backend/fetchAllCurrecy");
      const arr =
        data?.data?.map((d) => ({
          text: d.currency_symbol,
          value: d.currency_id,
          notes: d.currency_notes,
        })) || [];
      setCurrencies(arr);
    } catch (error) {
      setCurrencies([]);
    }
  };

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
      const  res  = await imsAxios.post("/vendor/addVendorBranch", {
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
          transaction_type: addBilling.branch.transactionType,
          account_no: addBilling.branch.accountNo,
          ifs_code: addBilling.branch.ifsCode,
          bank_name: addBilling.branch.bankName,
          bank_branch: addBilling.branch.bankBranch,
          ledger_currency: addBilling.branch.ledgerCurrency,
        },
      });
      setSubmitLoading(false);
      if (res?.success) {
        toast.success(res.message);
        if (getVendorBracnch) {
          getVendorBracnch(openBranch.vendor_code);
        }
        setOpenBranch(false);
        reset();
      } else if (!res?.success) {
        toast.error(errorToast(res.message));
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
        transactionType: "",
        accountNo: "",
        ifsCode: "",
        bankName: "",
        bankBranch: "",
        ledgerCurrency: "",
      },
    });
  };
  useEffect(() => {
    reset();
    getCurrencies();
  }, [openBranch]);

  /** When Type is N/A, fill bank fields with N/A (same as legacy Add Vendor). */
  useEffect(() => {
    const t = addBilling.branch.transactionType;
    if (t === "na") {
      setAddBilling((prev) => ({
        ...prev,
        branch: {
          ...prev.branch,
          accountNo: "N/A",
          ifsCode: "N/A",
          bankName: "N/A",
          bankBranch: "N/A",
          ledgerCurrency: "N/A",
        },
      }));
    } else if (t !== undefined && t !== "") {
      setAddBilling((prev) => ({
        ...prev,
        branch: {
          ...prev.branch,
          accountNo: "",
          ifsCode: "",
          bankName: "",
          bankBranch: "",
          ledgerCurrency: "",
        },
      }));
    }
  }, [addBilling.branch.transactionType]);

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
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Branch Details
        </Typography.Title>
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

        <Divider />
        <Typography.Title level={5} style={{ marginTop: 0 }}>
          Bank Details
        </Typography.Title>
        <Row style={{ width: "100%" }}>
          <Col span={24} style={{ padding: "3px" }}>
            <Form.Item label="Type">
              <MySelect
                options={transactionTypeOptions}
                value={addBilling.branch.transactionType}
                onChange={(val) => inputHandler("transactionType", val)}
              />
            </Form.Item>
          </Col>
          <Col span={12} style={{ padding: "3px" }}>
            <Form.Item label="A/c No">
              <Input
                value={addBilling.branch.accountNo}
                onChange={(e) => inputHandler("accountNo", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={12} style={{ padding: "3px" }}>
            <Form.Item label="IFS Code">
              <Input
                value={addBilling.branch.ifsCode}
                onChange={(e) => inputHandler("ifsCode", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={12} style={{ padding: "3px" }}>
            <Form.Item label="Bank Name">
              <Input
                value={addBilling.branch.bankName}
                onChange={(e) => inputHandler("bankName", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={12} style={{ padding: "3px" }}>
            <Form.Item label="Bank Branch">
              <Input
                value={addBilling.branch.bankBranch}
                onChange={(e) => inputHandler("bankBranch", e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col span={24} style={{ padding: "3px" }}>
            <Form.Item label="Currency of Ledger">
              <MySelect
                options={currencies}
                value={addBilling.branch.ledgerCurrency}
                onChange={(val) => inputHandler("ledgerCurrency", val)}
              />
            </Form.Item>
          </Col>
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
