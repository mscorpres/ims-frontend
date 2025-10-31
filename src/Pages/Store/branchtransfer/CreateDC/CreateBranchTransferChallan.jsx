import { useState, useEffect } from "react";
import {
  Form,
  Input,
  Modal,
  Tabs,
} from "antd";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MySelect from "../../../../Components/MySelect";
import NavFooter from "../../../../Components/NavFooter";
import AddDCComponents from "./AddDCComponents";
import SuccessPage from "../SuccessPage";
import Loading from "../../../../Components/Loading";
import validateResponse from "../../../../Components/validateResponse";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";
import { getVendorOptions } from "../../../../api/general.ts";
import { convertSelectOptions } from "../../../../utils/general.ts";
import useApi from "../../../../hooks/useApi.ts";
import CustomFieldBox from "../../../../new/components/reuseable/CustomFieldBox.jsx";
import CustomButton from "../../../../new/components/reuseable/CustomButton.jsx";

export default function CreateBranchTransferChallan() {
  const [newGatePass, setNewGatePass] = useState({
    passType: "",
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
  });

  const { executeFun, loading: loading1 } = useApi();
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [billToOptions, setBillTopOptions] = useState([]);
  const [vendorBranches, setVendorBranches] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState();
  const [successPage, setSuccessPage] = useState(false);
  const [branchtransferType, setBranchtransferType] = useState("R");
  const [pickuplocation, setpickuplocation] = useState([]);
  const [droplocation, setdroplocation] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);

  const passTypes = [
    { text: "A21 to B29 Transfer", value: "A" },
    { text: "B29 to A21 Transfer", value: "B" },
  ];

  const getfromtolocations = async (value) => {
    const { data } = await imsAxios.post("/branchTransfer/transferLocations", {
      from_branch: newGatePass.pickupbranch,
      to_branch: value,
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
    setSelectLoading(true);
    const { data } = await imsAxios.post("/backend/billingAddressList", {
      search: "",
    });
    setSelectLoading(false);
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
    setNewGatePass({
      passType: "",
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
    });
    setShowResetConfirm(false);
  };
  useEffect(() => {
    getBillTo();
    getallbranchs();
  }, []);
  return (
    <div
      style={{
        height: "calc(100vh - 110px)",
        overflow: "hidden",
        marginTop: "12px",
      }}
    >
      {!successPage && (
        <>
          {pageLoading && <Loading />}
          <Tabs
            style={{
              padding: "0 10px",
              height: "calc(100vh - 190px)",
              overflow: "auto",
              overflowX: "hidden",
              position: "relative",
            }}
            activeKey={activeTab}
            size="small"
          >
            <Tabs.TabPane tab={""} key="1">
              <>
                <div
                  style={{
                    overflowY: "scroll",
                    overflowX: "hidden",
                    padding: "6px 12px",
                  }}
                >
                  {/* reset confirm modal */}
                  <Modal
                    title="Confirm Reset!"
                    open={showResetConfirm}
                    onCancel={() => setShowResetConfirm(false)}
                    footer={
                      <div className="flex justify-end " style={{ gap: 6 }}>
                        <CustomButton
                          size="small"
                          variant="text"
                          title={"No"}
                          onclick={() => setShowResetConfirm(false)}
                        />
                        <CustomButton
                          size="small"
                          title={"Yes"}
                          onclick={resetFunction}
                        />
                      </div>
                    }
                  >
                    <p>
                      Are you sure you want to reset the details of this
                      Delivery Challan?
                    </p>
                  </Modal>
                  {/* vendor */}
                  <div className="grid grid-cols-2 " style={{ gap: 12 }}>
                    <CustomFieldBox
                      title="Transfer Details"
                      subtitle={`Transfer Details`}
                    >
                      <div className="grid grid-cols-2 " style={{ gap: 12 }}>
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
                      </div>
                    </CustomFieldBox>
                    <CustomFieldBox
                      title="Party Details"
                      subtitle={`Type Name or Code of the vendor`}
                    >
                      <div className="grid grid-cols-2 " style={{ gap: 12 }}>
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
                              // onBlur={() => setAsyncOptions([])}
                              optionsState={asyncOptions}
                              value={newGatePass.vendorName}
                              onChange={(value) => {
                                inputHandler("vendorName", value);
                              }}
                              loadOptions={getVendors}
                            />
                          </Form.Item>
                        </Form>{" "}
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
                                  // background: "red",
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
                        </Form>{" "}
                        <Form size="small" layout="vertical">
                          <Form.Item label="GSTIN">
                            <Input
                              size="default"
                              value={newGatePass.vendorGSTIN}
                              disabled
                            />
                          </Form.Item>
                        </Form>{" "}
                      </div>
                      <Form size="small" layout="vertical">
                        <Form.Item
                          label={
                            <span
                              style={{
                                fontSize: window.innerWidth < 1600 && "0.7rem",
                              }}
                            >
                              Bill From Address
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
                    </CustomFieldBox>
                    <CustomFieldBox
                      title="DC Terms"
                      subtitle={`Provide Branch Transfer terms and other information`}
                    >
                      <div className="grid grid-cols-2 " style={{ gap: 12 }}>
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
                        </Form>{" "}
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
                              } // onChange={inputHandler}
                              value={newGatePass.referenceDate}
                            />
                          </Form.Item>
                        </Form>{" "}
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
                                inputHandler("otherReferences", e.target.value)
                              }
                            />
                          </Form.Item>
                        </Form>{" "}
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
                        </Form>{" "}
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
                          </Form.Item>{" "}
                        </Form>
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
                        </Form>{" "}
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
                        </Form>{" "}
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
                      </div>
                    </CustomFieldBox>
                    <CustomFieldBox
                      title="Warehouse Details"
                      subtitle={`Provide warehouse information`}
                    >
                      <div className="grid grid-cols-2 " style={{ gap: 12 }}>
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
                        </Form>{" "}
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
                        </Form>{" "}
                      </div>
                      <Form size="small" layout="vertical">
                        <Form.Item
                          label={
                            <span
                              style={{
                                fontSize: window.innerWidth < 1600 && "0.7rem",
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
                    </CustomFieldBox>
                  </div>
                </div>
                <NavFooter
                  resetFunction={() => setShowResetConfirm(true)}
                  submitFunction={() => setActiveTab("2")}
                />
              </>
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={""}
              key="2"
              style={{ height: "100%", overflowY: "hidden" }}
            >
              <div style={{ height: "100%" }}>
                <AddDCComponents
                  setActiveTab={setActiveTab}
                  newGatePass={newGatePass}
                  detailsResetFunction={resetFunction}
                  setSuccessPage={setSuccessPage}
                  setPageLoading={setPageLoading}
                  pickuplocs={pickuplocation}
                  droplocs={droplocation}
                />
              </div>
            </Tabs.TabPane>
          </Tabs>
        </>
      )}
      {successPage && (
        <SuccessPage
          successInfo={successPage}
          createNewDC={() => {
            setSuccessPage(false);
            setActiveTab("1");
          }}
        />
      )}
    </div>
  );
}
