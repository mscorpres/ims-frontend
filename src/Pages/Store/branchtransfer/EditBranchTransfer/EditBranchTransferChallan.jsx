import { useState, useEffect } from "react";
import {
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Row,
  Modal,
  Button,
  Tabs,
  Drawer,
  Skeleton,
} from "antd";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MySelect from "../../../../Components/MySelect";
import NavFooter from "../../../../Components/NavFooter";
import EditBranchTransferComponents from "./EditBranchTransferComponents";
import Loading from "../../../../Components/Loading";
import validateResponse from "../../../../Components/validateResponse";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import { getVendorOptions } from "../../../../api/general.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";
import useApi from "../../../../hooks/useApi.ts";

const defaultGatePass = {
  pickupbranch: "",
  dropoffbranch: "",
  vendorName: "",
  vendorBranch: "",
  vendorAddress: "",
  vendorGSTIN: "",
  paymentTerms: "",
  referenceDate: "",
  otherReferences: "",
  dispatchDocNumber: "",
  dipatchThrough: "",
  destination: "",
  deliveryTerms: "",
  vehicleNumber: "",
  narration: "",
  billingId: "",
  billinAddress: "",
  billingPan: "",
  billingGSTIN: "",
};

export default function EditBranchTransferChallan({
  transId,
  setTransId,
  onSuccess,
}) {
  const [newGatePass, setNewGatePass] = useState(defaultGatePass);
  const { executeFun, loading: loading1 } = useApi();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [billToOptions, setBillTopOptions] = useState([]);
  const [vendorBranches, setVendorBranches] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  const [pickuplocation, setpickuplocation] = useState([]);
  const [droplocation, setdroplocation] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  const [resetData, setResetData] = useState(defaultGatePass);

  const fetchTransferLocations = async (fromBranch, toBranch) => {
    const { data } = await imsAxios.post("/branchTransfer/transferLocations", {
      from_branch: fromBranch,
      to_branch: toBranch,
    });
    if (data.status === "success") {
      const droparr = [];
      const pickuparr = [];
      data.data.droplocs.map((a) =>
        droparr.push({ text: a.text, value: a.value })
      );
      data.data.picklocs.map((a) =>
        pickuparr.push({ text: a.text, value: a.value })
      );
      setpickuplocation(pickuparr);
      setdroplocation(droparr);
    } else {
      toast.error(data.message.msg);
    }
  };

  const getfromtolocations = (value) => {
    fetchTransferLocations(newGatePass.pickupbranch, value);
  };

  const inputHandler = async (name, value) => {
    let obj = newGatePass;

    if (name == "vendorName") {
      const branches = await getVendorBracnch(value.value);
      const { address, gstin } = await getVendorAddress({
        vendorCode: value.value,
        vendorBranch: branches[0]?.value,
      });
      obj = {
        ...obj,
        [name]: value,
        vendorBranch: branches[0].value,
        vendorAddress: address,
        vendorGSTIN: gstin,
      };
    }
    if (name == "vendorBranch") {
      const { address, gstin } = await getVendorAddress({
        vendorCode: obj.vendorName.value,
        vendorBranch: value,
      });
      obj = {
        ...obj,
        [name]: value,
        vendorAddress: address,
        vendorGSTIN: gstin,
      };
    } else if (name == "billingId") {
      let billingDetails = await getBillingAddress(value);
      obj = {
        ...obj,
        [name]: value,
        billinAddress: billingDetails.address,
        billingGSTIN: billingDetails.gstin,
        billingPan: billingDetails.pan,
      };
    } else {
      obj = {
        ...obj,
        [name]: value,
      };
    }
    setNewGatePass(obj);
  };
  //getting vendor branches
  const getVendorBracnch = async (vendorCode) => {
    setPageLoading(true);
    const { data } = await imsAxios.post("/backend/vendorBranchList", {
      vendorcode: vendorCode,
    });
    setPageLoading(false);
    let validatedData = validateResponse(data);
    const arr = validatedData.data.map((d) => {
      return { value: d.id, text: d.text };
    });
    setVendorBranches(arr);
    return arr;
  };
  // getting vendors for vendor select
  const getVendors = async (search) => {
    if (search?.length > 2) {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select"
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
      }
      setAsyncOptions(arr);
    }
  };
  // getting vendor address after selecting vendor branch
  const getVendorAddress = async ({ vendorCode, vendorBranch }) => {
    const { data } = await imsAxios.post("/backend/vendorAddress", {
      vendorcode: vendorCode,
      branchcode: vendorBranch,
    });
    let validatedData = validateResponse(data);
    return {
      address: validatedData?.data?.address,
      gstin: validatedData?.data.gstid,
    };
  };

  // get all branch List
  const getallbranchs = async () => {
    const { data } = await imsAxios.get("/branchTransfer/listBranchTransfer");
    const arr = [];
    data.data.map((a) => arr.push({ text: a.text, value: a.id }));
    setBranchOptions(arr);
  };

  // gettig billing address
  const getBillTo = async () => {
    const { data } = await imsAxios.post("/backend/billingAddressList", {
      search: "",
    });

    let arr = [];
    arr = data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setBillTopOptions(arr);
  };
  // getting billing address details
  const getBillingAddress = async (billaddressid) => {
    setPageLoading(true);
    const { data } = await imsAxios.post("/backend/billingAddress", {
      billing_code: billaddressid,
    });
    setPageLoading(false);
    let validatedData = validateResponse(data);
    return {
      gstin: validatedData.data?.gstin,
      pan: validatedData.data?.pan,
      address: validatedData.data?.address,
    };
  };
  const resetFunction = () => {
    setNewGatePass(resetData);
    setShowResetConfirm(false);
  };

  // fetches the challan details for editing
  const getEditDetails = async () => {
    setSkeletonLoading(true);
    const { data } = await imsAxios.get("/branchTransfer/bt_details4Edit", {
      params: { transaction_id: transId },
    });
    setSkeletonLoading(false);
    const validatedData = validateResponse(data);
    if (!validatedData) {
      setTransId(null);
      return;
    }
    const header = validatedData.data.header;

    // vendor address/gstin aren't in the fetch response, so re-resolve them
    // the same way the create form does once a vendor + branch is known
    let vendorAddress = header.vendor_address;
    let vendorGSTIN = "";
    if (header.vendor_code) {
      await getVendorBracnch(header.vendor_code);
      const vendorDetails = await getVendorAddress({
        vendorCode: header.vendor_code,
        vendorBranch: header.vendor_branch_id,
      });
      vendorAddress = vendorDetails.address ?? vendorAddress;
      vendorGSTIN = vendorDetails.gstin;
    }
    // billing pan/gstin aren't in the fetch response either
    let billingDetails = {};
    if (header.billing_id) {
      billingDetails = await getBillingAddress(header.billing_id);
    }

    const obj = {
      pickupbranch: header.company_branch,
      dropoffbranch: "",
      vendorName: { value: header.vendor_code, label: header.vendor_name },
      vendorBranch: header.vendor_branch_id,
      vendorAddress: vendorAddress,
      vendorGSTIN: vendorGSTIN,
      paymentTerms: header.mode,
      referenceDate: header.reference_no,
      otherReferences: header.other_term,
      dispatchDocNumber: header.dispatch_doc_no,
      dipatchThrough: header.dispatch_through,
      destination: header.destination,
      deliveryTerms: header.term_of_delivery,
      vehicleNumber: header.vehicle_no,
      narration: header.narration,
      billingId: header.billing_id,
      billinAddress: billingDetails.address ?? header.billing_address,
      billingPan: billingDetails.pan,
      billingGSTIN: billingDetails.gstin,
      transferType: header.transfer_type,
      components: validatedData.data.materials,
    };
    setNewGatePass(obj);
    setResetData(obj);
  };

  useEffect(() => {
    getBillTo();
    getallbranchs();
  }, []);

  useEffect(() => {
    if (transId) {
      setActiveTab("1");
      getEditDetails();
    }
  }, [transId]);

  return (
    <Drawer
      title={`Edit Branch Transfer: ${transId ?? ""}`}
      width="100vw"
      destroyOnClose
      onClose={() => setTransId(null)}
      open={!!transId}
    >
      {skeletonLoading ? (
        <Skeleton active paragraph={{ rows: 12 }} />
      ) : (
        <div style={{ height: "100%" }}>
          {pageLoading && <Loading />}
          <Tabs
            style={{
              padding: "0 10px",
              height: "98%",
              overflow: "auto",
              overflowX: "hidden",
              position: "relative",
            }}
            activeKey={activeTab}
            size="small"
          >
            <Tabs.TabPane
              tab={<span onClick={() => setActiveTab("1")}>DC Details</span>}
              key="1"
            >
              <>
                <div
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    padding: "0vh 20px",
                  }}
                >
                  {/* reset confirm modal */}
                  <Modal
                    title="Confirm Reset!"
                    open={showResetConfirm}
                    onCancel={() => setShowResetConfirm(false)}
                    footer={[
                      <Button
                        key="back"
                        onClick={() => setShowResetConfirm(false)}
                      >
                        No
                      </Button>,
                      <Button
                        key="submit"
                        type="primary"
                        onClick={resetFunction}
                      >
                        Yes
                      </Button>,
                    ]}
                  >
                    <p>
                      Are you sure you want to reset the details of this
                      Delivery Challan?
                    </p>
                  </Modal>
                  {/* vendor */}
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="Transfer Details">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Provide Transfer Type
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={20}>
                      <Row gutter={16}>
                        {/* PO type */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Pick Up Branch
                                </span>
                              }
                            >
                              <MySelect
                                size="default"
                                options={branchOptions}
                                value={newGatePass.pickupbranch}
                                onChange={(value) => {
                                  inputHandler("pickupbranch", value);
                                }}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Drop Off Branch
                                </span>
                              }
                            >
                              <MySelect
                                size="default"
                                options={branchOptions}
                                value={newGatePass.dropoffbranch}
                                onChange={(value) => {
                                  inputHandler("dropoffbranch", value);
                                  getfromtolocations(value);
                                }}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Divider />
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="Party Details">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Type Name or Code of the vendor
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>

                    <Col span={20}>
                      <Row gutter={16}>
                        {/* vendor type */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Vendor Name
                                </span>
                              }
                            >
                              <MyAsyncSelect
                                selectLoading={loading1("select")}
                                size="default"
                                labelInValue
                                optionsState={asyncOptions}
                                value={newGatePass.vendorName}
                                onChange={(value) => {
                                  inputHandler("vendorName", value);
                                }}
                                loadOptions={getVendors}
                              />
                            </Form.Item>
                          </Form>
                        </Col>

                        {/* venodr branch */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <div
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: 350,
                                  }}
                                >
                                  Vendor Branch
                                </div>
                              }
                            >
                              <MySelect
                                value={newGatePass.vendorBranch}
                                onChange={(value) => {
                                  inputHandler("vendorBranch", value);
                                }}
                                options={vendorBranches}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item label="GSTIN">
                              <Input
                                size="default"
                                value={newGatePass.vendorGSTIN}
                                disabled
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                      <Row gutter={8}>
                        <Col span={18}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Bill to Address
                                </span>
                              }
                            >
                              <Input.TextArea
                                rows={4}
                                value={newGatePass?.vendorAddress?.replaceAll(
                                  "<br>",
                                  "\n"
                                )}
                                onChange={(e) => {
                                  inputHandler("vendorAddress", e.target.value);
                                }}
                                style={{ resize: "none" }}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Divider />
                  {/* PASS TERMS */}
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="DC Terms">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Provide Branch Transfer terms and other information
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={20}>
                      <Row gutter={16}>
                        {/* terms and conditions */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Mode / Terms and Conditions
                                </span>
                              }
                            >
                              <Input
                                size="default"
                                onChange={(e) =>
                                  inputHandler("paymentTerms", e.target.value)
                                }
                                value={newGatePass.paymentTerms}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* reference and date */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Reference Number & Date
                                </span>
                              }
                            >
                              <Input
                                size="default"
                                onChange={(e) =>
                                  inputHandler("referenceDate", e.target.value)
                                }
                                value={newGatePass.referenceDate}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* other refrences */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Other Terms
                                </span>
                              }
                            >
                              <Input
                                size="default"
                                value={newGatePass.otherReferences}
                                onChange={(e) =>
                                  inputHandler(
                                    "otherReferences",
                                    e.target.value
                                  )
                                }
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        {/* delivery terms */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Terms of Delivery
                                </span>
                              }
                            >
                              <Input
                                size="default"
                                onChange={(e) =>
                                  inputHandler("deliveryTerms", e.target.value)
                                }
                                value={newGatePass.deliveryTerms}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* dispatch doc number */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Dispatch Doc Number
                                </span>
                              }
                            >
                              <Input
                                size="default"
                                onChange={(e) =>
                                  inputHandler(
                                    "dispatchDocNumber",
                                    e.target.value
                                  )
                                }
                                value={newGatePass.dispatchDocNumber}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* dispatch trough */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Dispatched Through
                                </span>
                              }
                            >
                              <Input
                                onChange={(e) =>
                                  inputHandler("dipatchThrough", e.target.value)
                                }
                                value={newGatePass.dipatchThrough}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                      <Row gutter={16}>
                        {/* destination */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <div
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: 350,
                                  }}
                                >
                                  Destination
                                </div>
                              }
                            >
                              <Input
                                size="default"
                                onChange={(e) =>
                                  inputHandler("destination", e.target.value)
                                }
                                value={newGatePass.destination}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* vehicle number */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Vehicle Number
                                </span>
                              }
                            >
                              <Input
                                size="default"
                                onChange={(e) =>
                                  inputHandler("vehicleNumber", e.target.value)
                                }
                                value={newGatePass.vehicleNumber}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={18}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Narration
                                </span>
                              }
                            >
                              <Input.TextArea
                                rows={4}
                                value={newGatePass?.narration}
                                onChange={(e) =>
                                  inputHandler("narration", e.target.value)
                                }
                                style={{ resize: "none" }}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                    </Col>
                  </Row>

                  <Divider />
                  <Row>
                    <Col span={4}>
                      <Descriptions size="small" title="Warehouse Details">
                        <Descriptions.Item
                          contentStyle={{
                            fontSize: window.innerWidth < 1600 && "0.7rem",
                          }}
                        >
                          Provide warehouse information
                        </Descriptions.Item>
                      </Descriptions>
                    </Col>
                    <Col span={20}>
                      <Row gutter={16}>
                        {/* billing id */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Billing Id
                                </span>
                              }
                            >
                              <MySelect
                                size="default"
                                value={newGatePass.billingId}
                                onChange={(value) => {
                                  inputHandler("billingId", value);
                                }}
                                options={billToOptions}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* pan number */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  PAN
                                </span>
                              }
                            >
                              <Input
                                disabled
                                size="default"
                                name="bill_pan"
                                value={newGatePass.billingPan}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                        {/* gstin */}
                        <Col span={6}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  GSTIN / UIN
                                </span>
                              }
                            >
                              <Input
                                disabled
                                size="default"
                                name="bill_gstin"
                                value={newGatePass.billingGSTIN}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                      {/* billing address */}
                      <Row>
                        <Col span={18}>
                          <Form size="small" layout="vertical">
                            <Form.Item
                              label={
                                <span
                                  style={{
                                    fontSize:
                                      window.innerWidth < 1600 && "0.7rem",
                                  }}
                                >
                                  Billing Address
                                </span>
                              }
                            >
                              <Input.TextArea
                                style={{ resize: "none" }}
                                rows={4}
                                onChange={(e) =>
                                  inputHandler("billinAddress", e.target.value)
                                }
                                value={newGatePass.billinAddress?.replaceAll(
                                  "<br>",
                                  " "
                                )}
                              />
                            </Form.Item>
                          </Form>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Divider />
                </div>
                <NavFooter
                  backFunction={() => setTransId(null)}
                  resetFunction={() => setShowResetConfirm(true)}
                  submitFunction={() => setActiveTab("2")}
                />
              </>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={
                <span onClick={() => setActiveTab("2")}>Component Details</span>
              }
              key="2"
              style={{ height: "100%", overflowY: "hidden" }}
            >
              <div style={{ height: "100%" }}>
                <EditBranchTransferComponents
                  transId={transId}
                  setTransId={setTransId}
                  setActiveTab={setActiveTab}
                  newGatePass={newGatePass}
                  resetData={resetData}
                  detailsResetFunction={resetFunction}
                  setPageLoading={setPageLoading}
                  pickuplocs={pickuplocation}
                  droplocs={droplocation}
                  onSuccess={onSuccess}
                />
              </div>
            </Tabs.TabPane>
          </Tabs>
        </div>
      )}
    </Drawer>
  );
}
