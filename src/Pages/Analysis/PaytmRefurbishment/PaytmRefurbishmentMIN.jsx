import { useEffect, useState } from "react";
import {
  Form,
  Input,
  Switch,
} from "antd";
import { imsAxios } from "../../../axiosInterceptor";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import { toast } from "react-toastify";
import Loading from "../../../Components/Loading";
import NavFooter from "../../../Components/NavFooter";
import SubmitConfirmModal from "./SubmitConfirmModal";
import errorToast from "../../../Components/errorToast";
import ResetConfirmModal from "./ResetConfirmModal copy";
import { getProductsOptions, getVendorOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox.jsx";

function PaytmRefurbishmentMIN() {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [vendorBranchOptions, setVendorBranchOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitConfirmModal, setSubmitConfirmModal] = useState(false);
  const [resetConfirmModal, setResetConfirmModal] = useState(false);
  const [imeiArr, setImeiArr] = useState([]);
  const [imeiInputm, setimeiInput] = useState("");
  const [minForm] = Form.useForm();
  const { executeFun, loading: loading1 } = useApi();
  const getVendorOption = async (search) => {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  const getVendorBranchOptions = async (value) => {
    setLoading("page");
    const response = await imsAxios.post("/backend/vendorBranchList", {
      vendorcode: value,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        getVendorBranchAddress(arr[0].value);
        minForm.setFieldValue("vendorBranch", arr[0].value);
        setVendorBranchOptions(arr);
      } else {
        setVendorBranchOptions([]);
        toast.error(data.message.msg);
      }
    }
  };
  const getVendorBranchAddress = async (value) => {
    setLoading("page");
    const response = await imsAxios.post("/backend/vendorAddress", {
      vendorcode: minForm.getFieldValue("vendor"),
      branchcode: value,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let { address } = data.data;
        minForm.setFieldValue(
          "vendorAddress",
          address.replaceAll("<br>", "\n")
        );
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const validateHandler = async () => {
    let values = await minForm.validateFields();
    let finalObj = {
      vendorbranch: values.vendorBranch,
      challan: values.challanNumber,
      ewaybill: values.eWayBillNumber,
      product: [values.component],
      qty: [values.qty],
      rate: [values.rate],
      remark: values.remarks ?? "--",
      status: [values.mapImei ? 1 : 0],
      vendorname: values.vendor,
    };
    setSubmitConfirmModal(finalObj);
  };
  const getComponentOptions = async (searchTerm) => {
    const response = await executeFun(
      () => getProductsOptions(searchTerm, true),
      "select"
    );
    let { data } = response;
    setAsyncOptions(data);
  };
  const submitHandler = async () => {
    if (submitConfirmModal) {
      setLoading("submit");
      const response = await imsAxios.post(
        "/paytmRefurb/save",
        submitConfirmModal
      );
      setLoading(false);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          setSubmitConfirmModal(false);
          resetHandler();
        } else {
          toast.error(errorToast(data.message));
        }
      }
    }
  };
  const inputHandler = () => {
    let total =
      +Number(minForm.getFieldsValue().rate).toFixed(3) *
      +Number(minForm.getFieldsValue().qty).toFixed(3);
    minForm.setFieldValue("totalValue", total);
  };

  const resetHandler = () => {
    let obj = {
      vendorBranch: "",
      challanNumber: "",
      eWayBillNumber: "",
      component: "",
      qty: "",
      rate: "",
      remarks: "",
      mapImei: "",
      vendor: "",
      vendorAddress: "",
      totalValue: 0,
    };
    minForm.setFieldsValue(obj);
    setResetConfirmModal(false);
  };
  useEffect(() => {
    let obj = {
      vendorBranch: "",
      challanNumber: "",
      eWayBillNumber: "",
      component: "",
      qty: "",
      rate: "",
      remarks: "",
      mapImei: "",
      vendor: "",
      vendorAddress: "",
      totalValue: 0,
    };
    minForm.setFieldsValue(obj);
  }, []);
  useEffect(() => {
    console.log("changed...");
    setimeiInput("");
    console.log(imeiArr);
  }, [imeiArr]);

  return (
    <div style={{ height: "90%", margin: 12 }}>
      {loading === "page" && <Loading />}
      <SubmitConfirmModal
        open={submitConfirmModal}
        handleCancel={() => setSubmitConfirmModal(false)}
        loading={loading === "submit"}
        submitHandler={submitHandler}
      />
      <ResetConfirmModal
        open={resetConfirmModal}
        handleCancel={() => setResetConfirmModal(false)}
        resetHandler={resetHandler}
      />
      <Form form={minForm} onFinish={validateHandler} layout="vertical"  >
        <div className="grid grid-cols-2 max-h-[calc(100vh-175px)]  overflow-y-scroll" style={{ gap: 12, padding:1 }}>
          <CustomFieldBox title={"Vendor Details"}>
            <div className="grid grid-cols-2" style={{ gap: 12 }}>
              <Form.Item
                label="Vendor"
                name="vendor"
                rules={[
                  {
                    required: true,
                    message: "Please select a vendor!",
                  },
                ]}
              >
                <MyAsyncSelect
                  loadOptions={getVendorOption}
                  optionsState={asyncOptions}
                  loading={loading1("select")}
                  onChange={getVendorBranchOptions}
                />
              </Form.Item>{" "}
              <Form.Item
                label="Vendor Branch"
                name="vendorBranch"
                rules={[
                  {
                    required: true,
                    message: "Please select a vendor branch!",
                  },
                ]}
              >
                <MySelect
                  onChange={getVendorBranchAddress}
                  options={vendorBranchOptions}
                />
              </Form.Item>
            </div>
            <Form.Item label="Vendor Address" name="vendorAddress">
              <Input.TextArea disabled rows={4} />
            </Form.Item>
          </CustomFieldBox>
          <CustomFieldBox title={"Product Details"}>
            <div className="grid grid-cols-2" style={{ gap: 12 }}>
              <Form.Item label="Map IMEI" name="mapImei">
                <Switch />
              </Form.Item>{" "}
              <Form.Item
                label="Component"
                name="component"
                rules={[
                  {
                    required: true,
                    message: "Please select a component!",
                  },
                ]}
              >
                <MyAsyncSelect
                  loadOptions={getComponentOptions}
                  optionsState={asyncOptions}
                  loading={loading === "select"}
                />
              </Form.Item>{" "}
              <Form.Item
                label="Qty"
                name="qty"
                rules={[
                  {
                    required: true,
                    message: "Please enter component quantity!",
                  },
                ]}
              >
                <Input placeholder="0" onChange={inputHandler} />
              </Form.Item>{" "}
              <Form.Item
                label="Rate"
                name="rate"
                rules={[
                  {
                    required: true,
                    message: "Please enter component rate!",
                  },
                ]}
              >
                <Input placeholder="0" onChange={inputHandler} />
              </Form.Item>{" "}
              <Form.Item label="Total Value" name="totalValue">
                <Input bordered={false} disabled />
              </Form.Item>
            </div>
          </CustomFieldBox>
          <CustomFieldBox title={"Other Details"}>
            <div className="grid grid-cols-2" style={{ gap: 12 }}>
              <Form.Item
                label="Challan Number"
                name="challanNumber"
                rules={[
                  {
                    required: true,
                    message: "Please enter the challan number!",
                  },
                ]}
              >
                <Input />
              </Form.Item>{" "}
              <Form.Item
                label="E-way bill Number"
                name="eWayBillNumber"
                // rules={[
                //   {
                //     required: true,
                //     message: "Please enter E-way bill Number!",
                //   },
                // ]}
              >
                <Input
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      console.log(e.target.value);
                      setImeiArr((arr) => [...arr, e.target.value]);
                    }
                  }}
                  onChange={(e) => {
                    setimeiInput(e.target.value);
                  }}
                  value={imeiInputm}
                />
              </Form.Item>
            </div>
            <Form.Item label="Remarks" name="remarks">
              <Input.TextArea
                rows={4}
                onChange={(e) => setImeiArr((arr) => [...arr, e.target.value])}
              />
            </Form.Item>
          </CustomFieldBox>
        </div>
      </Form>
      <NavFooter
        resetFunction={() => setResetConfirmModal(true)}
        submitFunction={validateHandler}
        nextLabel="Submit"
      />
    </div>
  );
}

export default PaytmRefurbishmentMIN;
