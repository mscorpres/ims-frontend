import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import EditComponents from "./EditComponents";
import NavFooter from "../../../../Components/NavFooter";
import {
  Button,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Tabs,
} from "antd";
import MySelect from "../../../../Components/MySelect";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import TextArea from "antd/lib/input/TextArea";
import { imsAxios } from "../../../../axiosInterceptor";
import { v4 } from "uuid";
import {
  getCostCentresOptions,
  getVendorOptions,
} from "../../../../api/general";
import { convertSelectOptions } from "../../../../utils/general";
import useApi from "../../../../hooks/useApi";

export default function EditPO({ updatePoId, setUpdatePoId }) {
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("1");
  const [vendorBranches, setVendorBranches] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [rowCount, setRowCount] = useState(purchaseOrder?.materials);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [billingOptions, setBillingOptions] = useState([]);
  const [resestDetailsData, setResetDetailsData] = useState(null);
  const [resetRowsDetailsData, setResetRowsDetailsData] = useState(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showDetailsCondirm, setShowDetailsConfirm] = useState(false);
  const [form] = Form.useForm();
  const { executeFun, loading: loading1 } = useApi();
  const inputHandler = (name, value) => {
    setPurchaseOrder((purchaseOrder) => {
      return {
        ...purchaseOrder,
        [name]: value,
      };
    });
  };
  const selectInputHandler = async (name, value) => {
    if (value) {
      let obj = purchaseOrder;
      if (name == "addrbillid") {
        const { data } = await imsAxios.post("/backend/billingAddress", {
          billing_code: value,
        });
        obj = {
          ...obj,
          [name]: value,
          billgstid: data?.data?.gstin,
          billpanno: data?.data?.pan,
          billaddress: data.data?.address.replaceAll("<br>", "\n"),
        };
      } else if (name == "addrshipid") {
        const { data } = await imsAxios.post("/backend/shippingAddress", {
          shipping_code: value,
        });
        obj = {
          ...obj,
          [name]: value,
          shipgstid: data?.data.gstin,
          shippanno: data?.data.pan,

          shipaddress: data.data?.address.replaceAll("<br>", "\n"),
        };
      } else if (name == "vendorcode") {
        const { data } = await imsAxios.post("/backend/vendorBranchList", {
          vendorcode: value.value,
        });
        if (data.code == 200) {
          let arr = data.data.map((row) => {
            return {
              text: row.text,
              value: row.id,
            };
          });
          setVendorBranches(arr);
          const { data: data1 } = await imsAxios.post("backend/vendorAddress", {
            vendorcode: value.value,
            branchcode: arr[0].value,
          });
          console.log(data);
          obj = {
            ...obj,
            [name]: value,
            vendorname: value.label,
            vendorbranch: arr[0].value,
            vendoraddress: data1.data.address.replaceAll("<br>", "\n"),
          };
        } else {
          toast.error(data.message.msg);
        }
      } else if (name == "vendorbranch") {
        const { data } = await imsAxios.post("backend/vendorAddress", {
          vendorcode: purchaseOrder.vendorcode.value,
          branchcode: value.value,
        });
        if (data.code == 200) {
          obj = {
            ...obj,
            [name]: value,
            // vendorBranchName: value.label,
            vendoraddress: data.data.address.replaceAll("<br>", "\n"),
          };
        } else {
          toast.error(data.message.msg);
        }
      } else if (name == "costcenter") {
        obj = {
          ...obj,
          [name]: value,
        };
      } else {
        obj = {
          ...obj,
          [name]: value,
        };
      }
      form.setFieldsValue(obj);
      setPurchaseOrder(obj);
    }
  };
  const vendorDetailsOptions = [
    { text: "JWI (Job Work In)", value: "j01" },
    { text: "Vendor", value: "v01" },
  ];

  const getVendors = async (search) => {
    // if (searchInput?.length > 2) {
    const response = await executeFun(() => getVendorOptions(search), "select");
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };
  const getBillTo = async () => {
    const { data } = await imsAxios.post("/backend/billingAddressList", {
      search: "",
    });
    let arr = [];
    arr = data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setBillingOptions(arr);
  };
  const getCostCenteres = async (search) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select"
    );
    let arr = [];
    if (response.success) arr = convertSelectOptions(response.data);
    setAsyncOptions(arr);
  };

  const getShippingId = async () => {
    const { data } = await imsAxios.post("/backend/shipingAddressList", {
      searchInput: "",
    });
    let arr = [];
    arr = data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setShippingOptions(arr);
  };

  const resetDetails = () => {
    form.setFieldsValue(resestDetailsData);
    setPurchaseOrder(resestDetailsData);
    setShowDetailsConfirm(false);
  };
  const resetRows = () => {
    setRowCount(resetRowsDetailsData);
  };
  const getVendorBranches = async (vendorCode) => {
    const { data } = await imsAxios.post("/backend/vendorBranchList", {
      vendorcode: vendorCode,
    });
    if (data.code == 200) {
      let arr = data.data.map((row) => {
        return {
          text: row.text,
          value: row.id,
        };
      });
      setVendorBranches(arr);
    }
  };
  useEffect(() => {
    getShippingId();
    getBillTo();
    let arr = [];
    if (updatePoId) {
      let obj = updatePoId;
      obj = {
        ...obj,
        poid: updatePoId?.orderid,
        shipaddress: updatePoId.shipaddress.replaceAll("<br>", "\n"),
        vendoraddress: updatePoId.vendoraddress.replaceAll("<br>", "\n"),
        billaddress: updatePoId.billaddress.replaceAll("<br>", "\n"),
      };
      setPurchaseOrder(obj);
      setResetDetailsData(obj);
      getVendorBranches(obj.vendorcode.value);
      form.setFieldsValue(obj);
    }
    updatePoId?.materials?.map((row, index) =>
      arr.push({
        id: v4(),
        currency: row.currency,
        exchange_rate: row.exchangerate == "" ? 1 : row.exchangerate,
        component: {
          label: row.component + row.part_no,
          value: row.componentKey,
        },
        qty: row.orderqty,
        rate: row.rate,
        duedate: row.duedate,
        hsncode: row.hsncode,
        gsttype: row.gsttype[0].id,
        gstrate: row.gstrate,
        cgst: row.cgst == "--" ? 0 : row.cgst,
        sgst: row.sgst == "--" ? 0 : row.sgst,
        igst: row.igst == "--" ? 0 : row.igst,
        remark: row.remark,
        inrValue: row.taxablevalue,
        foreginValue: row.exchangetaxablevalue,
        unit: row.unitname,
        updateRow: row.updateid,
        project_rate: row.project_rate,
        localPrice:
          +Number(row.exchangerate).toFixed(2) * +Number(row.rate).toFixed(2),
        tol_price: +Number((row.project_rate * 1) / 100).toFixed(2),
        project_qty: row.project_qty,
        po_ord_qty: row.po_ord_qty,
      })
    );
    console.log("this is the array", arr);
    setRowCount(arr);
    setResetRowsDetailsData(arr);
  }, [updatePoId]);
  const finish = (values) => {
    console.log(values);
    setActiveTab("2");
    setPurchaseOrder(values);
  };
  return (
    <Drawer
      title={`Updating PO: ${updatePoId?.orderid}`}
      width="100vw"
      open={updatePoId}
      onClose={() => setUpdatePoId(null)}
    >
      <Tabs
        activeKey={activeTab}
        style={{
          marginTop: -24,
          height: "100%",
        }}
        size="small"
      >
        <Tabs.TabPane
          style={{ height: "100%" }}
          tab="Edit Purchase Order"
          key="1"
        >
          {/* reset confirm modal */}
          <Modal
            title="Confirm Reset!"
            open={showDetailsCondirm}
            onCancel={() => setShowDetailsConfirm(false)}
            footer={[
              <Button key="back" onClick={() => setShowDetailsConfirm(false)}>
                No
              </Button>,
              <Button key="submit" type="primary" onClick={resetDetails}>
                Yes
              </Button>,
            ]}
          >
            <p>
              Are you sure to reset details of this Purchase Order to the
              details it was created with?
            </p>
          </Modal>
          <Form
            form={form}
            onFinish={finish}
            initialValues={purchaseOrder}
            size="small"
            layout="vertical"
            style={{ height: "100%" }}
            onFieldsChange={(value, allFields) => {
              if (value.length == 1) {
                selectInputHandler(value[0].name[0], value[0].value);
              }
            }}
          >
            <div
              style={{
                height: "100%",
                overflowY: "scroll",
                overflowX: "hidden",
              }}
            >
              {/* reset vendor form */}
              {/* vendor */}
              <Row>
                <Col span={4}>
                  <Descriptions title="Vendor Details">
                    <Descriptions.Item>
                      Type Name or Code of the vendor
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={20}>
                  <Row gutter={16}>
                    {/* vendor type */}
                    <Col span={6}>
                      <Form.Item
                        label="Vendor Type"
                        name="vendortype_value"
                        rules={[
                          {
                            required: true,
                            message: "Please Select a vendor Type!",
                          },
                        ]}
                      >
                        <MySelect
                          size="default"
                          options={vendorDetailsOptions}
                        />
                      </Form.Item>
                    </Col>
                    {/* vendor name */}
                    <Col span={6}>
                      <Form.Item
                        label="Vendor Name"
                        name="vendorcode"
                        rules={[
                          {
                            required: true,
                            message: "Please Select a vendor!",
                          },
                        ]}
                      >
                        <MyAsyncSelect
                          onBlur={() => setAsyncOptions([])}
                          optionsState={asyncOptions}
                          labelInValue
                          loadOptions={getVendors}
                        />
                      </Form.Item>
                    </Col>
                    {/* venodr branch */}
                    <Col span={6}>
                      <Form.Item
                        name="vendorbranch"
                        label="Vendor Branch"
                        rules={[
                          {
                            required: true,
                            message: "Please Select a vendor Branch!",
                          },
                        ]}
                      >
                        <MySelect
                          size="default"
                          labelInValue
                          options={vendorBranches}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item label="GSTIN">
                        <Input size="default" value="--" disabled />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col span={18}>
                      <Form.Item
                        name="vendoraddress"
                        label="Bill From Address"
                        rules={[
                          {
                            required: true,
                            message: "Please enter vendor address!",
                          },
                        ]}
                      >
                        <TextArea style={{ resize: "none" }} rows={4} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Divider />

              <Row>
                <Col span={4}>
                  <Descriptions title="PO Terms">
                    <Descriptions.Item>
                      Provide PO terms and other information
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={20}>
                  <Row gutter={16}>
                    {/* terms and conditions */}
                    <Col span={6}>
                      <Form.Item
                        name="termsofcondition"
                        label="Terms and Conditions"
                      >
                        <Input size="default" />
                      </Form.Item>
                    </Col>
                    {/* quotations */}
                    <Col span={6}>
                      <Form.Item name="termsofquotation" label="Quotation">
                        <Input size="default" />
                      </Form.Item>
                    </Col>
                    {/* payment terms */}
                    <Col span={6}>
                      <Form.Item name="paymentterms" label="Payment Terms">
                        <Input size="default" />
                      </Form.Item>
                    </Col>
                    {/* po due date*/}
                    <Col span={6}>
                      <Form.Item
                        label="Due Date (in days)"
                        name="paymenttermsday"
                      >
                        <InputNumber
                          style={{ width: "100%" }}
                          size="default"
                          min={1}
                          max={999}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    {" "}
                    <Col span={6}>
                      <Form.Item
                        name="costcenter"
                        label="Cost Center"
                        rules={[
                          {
                            required: true,
                            message: "Please Select a Cost Center!",
                          },
                        ]}
                      >
                        <MyAsyncSelect
                          onBlur={() => setAsyncOptions([])}
                          optionsState={asyncOptions}
                          loadOptions={getCostCenteres}
                        />
                      </Form.Item>
                    </Col>
                    {/* project name */}
                    <Col span={6}>
                      <Form.Item name="projectname" label="Project">
                        <Input
                          size="default"
                          value={purchaseOrder?.projectname}
                        />
                      </Form.Item>
                    </Col>
                    {/* comments */}
                    <Col span={6}>
                      <Form.Item name="pocomment" label="Comments">
                        <Input size="default" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Divider />
              <Row>
                <Col span={4}>
                  <Descriptions title="Billing Details">
                    <Descriptions.Item>
                      Provide billing information
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col span={20}>
                  <Row gutter={16}>
                    {/* billing id */}
                    <Col span={6}>
                      <Form.Item
                        name="addrbillid"
                        label="Billing Id"
                        rules={[
                          {
                            required: true,
                            message: "Please select a billing address!",
                          },
                        ]}
                      >
                        <MySelect options={billingOptions} />
                      </Form.Item>
                    </Col>
                    {/* pan number */}
                    <Col span={6}>
                      <Form.Item
                        name="billpanno"
                        label="Pan No."
                        rules={[
                          {
                            required: true,
                            message: "Please enter billing address PAN number!",
                          },
                        ]}
                      >
                        <Input size="default" />
                      </Form.Item>
                    </Col>
                    {/* gstin uin */}
                    <Col span={6}>
                      <Form.Item
                        name="billgstid"
                        label="GSTIN / UIN"
                        rules={[
                          {
                            required: true,
                            message:
                              "Please enter billing address GSTIN number!",
                          },
                        ]}
                      >
                        <Input size="default" />
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* billing address */}
                  <Row gutter={16}>
                    <Col span={18}>
                      <Form.Item
                        name="billaddress"
                        label="Billing Address"
                        rules={[
                          {
                            required: true,
                            message: "Please enter billing address details!",
                          },
                        ]}
                      >
                        <TextArea style={{ resize: "none" }} rows={4} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>

              <Divider />
              <Row>
                <Col span={4}>
                  <Descriptions title="Shipping Details">
                    <Descriptions.Item>
                      Provide shipping information
                    </Descriptions.Item>
                  </Descriptions>
                </Col>

                <Col span={20}>
                  <Row gutter={16}>
                    {/* shipping id */}
                    <Col span={6}>
                      <Form.Item
                        name="addrshipid"
                        label="Shipping Id"
                        rules={[
                          {
                            required: true,
                            message: "Please select a shipping address!",
                          },
                        ]}
                      >
                        <MySelect options={shippingOptions} />
                      </Form.Item>
                    </Col>
                    {/* pan number */}
                    <Col span={6}>
                      <Form.Item
                        name="shippanno"
                        label="Pan No."
                        rules={[
                          {
                            required: true,
                            message:
                              "Please enter shipping address PAN number!",
                          },
                        ]}
                      >
                        <Input size="default" />
                      </Form.Item>
                    </Col>
                    {/* gstin uin */}
                    <Col span={6}>
                      <Form.Item
                        name="shipgstid"
                        label="GSTIN / UIN"
                        rules={[
                          {
                            required: true,
                            message:
                              "Please enter shipping address GST number!",
                          },
                        ]}
                      >
                        <Input size="default" />
                      </Form.Item>
                    </Col>
                  </Row>
                  {/* shipping address */}
                  <Row gutter={16}>
                    <Col span={18}>
                      <Form.Item
                        name="shipaddress"
                        label="Shipping Address"
                        rules={[
                          {
                            required: true,
                            message: "Please enter shipping address details!",
                          },
                        ]}
                      >
                        <TextArea style={{ resize: "none" }} rows={4} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
              {/* <Divider  /> */}
            </div>
            <NavFooter
              backFunction={() => setUpdatePoId(null)}
              submithtmlType="submit"
              submitButton={true}
              resetFunction={() => setShowDetailsConfirm(true)}
              backLabel="Cancel"
            />
          </Form>
        </Tabs.TabPane>
        <Tabs.TabPane
          tab="Edit Components Details"
          style={{ height: "100%" }}
          key="2"
        >
          <EditComponents
            resetRows={resetRows}
            materials={updatePoId?.materials}
            setUpdatePoId={setUpdatePoId}
            updatePoId={updatePoId}
            setRowCount={setRowCount}
            rowCount={rowCount}
            purchaseOrder={purchaseOrder}
            setActiveTab={setActiveTab}
            resetRowsDetailsData={resetRowsDetailsData}
          />
        </Tabs.TabPane>
      </Tabs>
    </Drawer>
  );
}
