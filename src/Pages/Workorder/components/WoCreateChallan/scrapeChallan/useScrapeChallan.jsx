import { useEffect, useState } from "react";
import { Form, Input, Modal } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { imsAxios } from "../../../../../axiosInterceptor";
import useApi from "../../../../../hooks/useApi.ts";
import { convertSelectOptions } from "../../../../../utils/general.ts";
import {
  getComponentDetail,
  getComponentOptions,
} from "../../../../../api/general.ts";

import {
  getScrapeChallanDetails,
  submitScrapreChallan,
  updateScrapeChallan,
} from "./api";
import {
  buildCreatePayload,
  buildEditPayload,
  mapChallanMaterialToComponents,
} from "./payload";

const useScrapeChallan = () => {
  const [uplaodType, setUploadType] = useState("table");
  const [addOptions, setAddOptions] = useState([]);
  const [ClientBranchOptions, setclientBranchOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [clientcode, setClientCode] = useState("");
  const [editScrapeChallan, setEditScrapeChallan] = useState("");
  const [challanId, setChallanID] = useState("");

  const [challanForm] = Form.useForm();
  const [ModalForm] = Form.useForm();
  const isthereClientCode = Form.useWatch("clientname", challanForm);

  const [searchParams] = useSearchParams();
  const challan = searchParams.get("challan");

  const navigate = useNavigate();
  const { executeFun } = useApi();

  //   get client options -->
  const getClientOptions = async (inputValue) => {
    try {
      setLoading("select");
      const { data } = await imsAxios.post("/backend/getClient", {
        searchTerm: inputValue,
      });
      if (data) {
        setAsyncOptions(
          data.data.map((row) => ({ text: row.name, value: row.code }))
        );
      } else {
        toast.error("Some error occured wile getting vendors");
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlebilladress = (e) => {
    clientData.branchList.forEach((item) => {
      if (item.id === e.value || item.id === e) {
        challanForm.setFieldValue("billingaddress", item.address);
        challanForm.setFieldValue("clientAddrId", item.id);
      }
    });
  };

  const getAddInfo = async (e) => {
    try {
      setLoading("fetch");
      const { data } = await imsAxios.post("backend/fetchClientAddress", {
        addressID: e,
        code: clientcode,
      });
      if (data.code === 200) {
        challanForm.setFieldValue("address", data.data.address);
        toast.error(data.message.msg);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleaddress = (e) => {
    addOptions.forEach((item) => {
      if (item.value === e.value || item.value === e) {
        challanForm.setFieldValue("shippingaddress", item.address);
      }
    });
  };

  //   get client branch options
  const getclientDetials = async (inputValue, dm) => {
    try {
      setLoading("fetch");
      setClientCode(inputValue);
      const { data } = await imsAxios.post("/backend/fetchClientDetail", {
        code: inputValue,
      });
      if (!data) {
        toast.error("Some error occured while getting Client branches ");
        return;
      }
      if (data.code !== 200) {
        toast.error(data.message.msg);
        return;
      }
      const arr = data.branchList.map((row) => ({
        text: row.text,
        value: row.id,
        address: row.address,
      }));
      setclientBranchOptions(arr);
      setAddOptions(arr);
      setClientData(data);
      if (dm === undefined && editScrapeChallan !== "edit") {
        challanForm.setFieldValue("clientbranch", "");
        challanForm.setFieldValue("gstin", "");
        challanForm.setFieldValue("address", "");
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchComponentOptions = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    setAsyncOptions(response.success ? convertSelectOptions(response.data) : []);
  };

  const calculation = (fieldName, watchValues) => {
    const { qty, rate } = watchValues;
    const value = +Number(qty ?? 0) * +Number(rate ?? 0).toFixed(3);
    challanForm.setFieldValue(
      ["components", fieldName, "value"],
      +Number(value).toFixed(3)
    );
  };

  const handleFetchComponentDetails = async (row, rowId, value) => {
    const response = await executeFun(
      () => getComponentDetail(value.value),
      "fetch"
    );
    if (response.success) {
      const { data } = response;
      challanForm.setFieldValue(
        ["components", rowId, "gstRate"],
        data.data.gstrate
      );
      challanForm.setFieldValue(["components", rowId, "hsnCode"], data.data.hsn);
      challanForm.setFieldValue(["components", rowId, "rate"], data.data.rate);
    }
  };

  const validateHandler = async () => {
    const values = await challanForm.validateFields();
    Modal.confirm({
      title: "Do you want to submit Scrape Challan?",
      content: (
        <Form form={ModalForm} layout="vertical">
          <Form.Item
            name="remark"
            label="Remark"
            rules={[{ required: true, message: "Please input remark!" }]}
          >
            <Input.TextArea rows={3} placeholder="Please input the remark" />
          </Form.Item>
        </Form>
      ),
      onOk: () => submitHandler(values),
      okText: "Submit",
    });
  };

  const submitHandler = async () => {
    setLoading(true);
    const values = await challanForm.validateFields();
    const remarkvalue = await ModalForm.validateFields();

    let response;
    if (editScrapeChallan === "edit") {
      response = await updateScrapeChallan(
        buildEditPayload(values, remarkvalue.remark, challanId)
      );
      const { data } = response;
      if (data.status === "success") {
        toast.success(data.message);
        challanForm.resetFields();
        setLoading(true);
        navigate("/woviewchallan");
      } else {
        toast.error(data.message.msg);
        setLoading(true);
      }
    } else {
      response = await executeFun(
        () => submitScrapreChallan(buildCreatePayload(values, remarkvalue.remark)),
        "select"
      );
    }

    if (response.success) {
      setLoading(true);
      challanForm.resetFields();
    } else {
      toast.error(response.data.error);
    }
    setLoading(true);
  };

  const getScrapeDetails = async (challanNo) => {
    const { data } = await getScrapeChallanDetails(challanNo);
    setEditScrapeChallan("edit");
    if (data.status !== "success") return;

    challanForm.setFieldValue("clientname", data.header.clientcode.label);
    challanForm.setFieldValue("clientnameCode", data.header.clientcode.value);
    challanForm.setFieldValue("clientbranch", data.header.client_branch);
    challanForm.setFieldValue("nature", data.header.eway_no);
    challanForm.setFieldValue("pd", data.header.ship_doc_no);
    challanForm.setFieldValue("vn", data.header.vehicle);
    challanForm.setFieldValue("or", data.header.other_ref);
    challanForm.setFieldValue("address", data.header.clientaddress?.label);
    challanForm.setFieldValue("billingid", data.header.billing_info);
    challanForm.setFieldValue("billingaddress", data.header.billing_address);
    challanForm.setFieldValue("dispatchid", data.header.dispatch_info);
    ModalForm.setFieldValue("remark", data.header.challan_remark);
    challanForm.setFieldValue("shippingaddress", data.header.dispatch_address);
    challanForm.setFieldValue(
      "components",
      mapChallanMaterialToComponents(data.material, data.header)
    );
  };

  useEffect(() => {
    if (challan) {
      getScrapeDetails(challan);
      setChallanID(challan);
    }
  }, [challan]);

  useEffect(() => {
    if (isthereClientCode && editScrapeChallan === "edit") {
      getclientDetials(challanForm.getFieldValue("clientnameCode"));
    }
  }, [isthereClientCode]);

  return {
    challanForm,
    ModalForm,
    loading,
    uplaodType,
    setUploadType,
    editScrapeChallan,
    asyncOptions,
    setAsyncOptions,
    addOptions,
    ClientBranchOptions,
    getClientOptions,
    getclientDetials,
    getAddInfo,
    handlebilladress,
    handleaddress,
    handleFetchComponentOptions,
    handleFetchComponentDetails,
    calculation,
    validateHandler,
  };
};

export default useScrapeChallan;
