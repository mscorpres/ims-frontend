import React, { useEffect, useState } from "react";
import "../../Modal/modal.css";
import { toast } from "react-toastify";
import { Button, Row, Col, Input, Skeleton, Form, Drawer, Space } from "antd";
import MySelect from "../../../../Components/MySelect";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import errorToast from "../../../../Components/errorToast";
import Loading from "../../../../Components/Loading";
import { imsAxios } from "../../../../axiosInterceptor";
const { TextArea } = Input;

const ViewModal = ({ viewVendor, setViewVendor }) => {
  const [allField, setAllField] = useState({
    branchCode: "",
    label: "",
    state: "",
    city: "",
    gst: "",
    pcode: "",
    email: "",
    mob: "",
    address: "",
    fax: "",
    addresscode: "",
  });
  const [resetData, setResetData] = useState({});
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [spinLoading, setSpinLoading] = useState(false);
  const [submitLoading, setsubmitLoading] = useState(false);
  const [allBranchData, setAllBranchData] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const fetchAllBranchList = async () => {
    setSkeletonLoading(true);
    const { data } = await imsAxios.post("/vendor/getAllBranchList", {
      vendor_id: viewVendor.vendor_code,
    });
    let a = [];
    data.data.final.map((d) => a.push({ text: d.text, value: d.id }));
    getBranchDetails(a[0].value, "skeletonLoading");
    setAllBranchData(a);
    const { data: data1 } = await imsAxios.post("/vendor/getBranchDetails", {
      addresscode: a[0].value,
    });

    setSkeletonLoading(false);
  };
  // console.log(allField);
  const getBranchDetails = async (branchId, loadingType) => {
    if (loadingType != "skeletonLoading") {
      setSpinLoading(true);
    }
    const { data } = await imsAxios.post("/vendor/getBranchDetails", {
      addresscode: branchId,
    });
    setSpinLoading(false);
    if (data.code == 200) {
      setAllField((allField) => {
        return {
          ...allField,
          branchCode: data.data.final[0].address_code,
          label: data.data.final[0].label,
          email: data.data.final[0].email_id,
          city: data.data.final[0].city,
          gst: data.data.final[0].gstin,
          pcode: data.data.final[0].pincode,
          mob: data.data.final[0].mobile_no,
          fax: data.data.final[0].fax,
          address: data.data.final[0].address,
          state: {
            value: data.data.final[0].statecode,
            label: data.data.final[0].statename,
          },
        };
      });
      setResetData((allField) => {
        return {
          ...allField,
          branchCode: data.data.final[0].address_code,
          label: data.data.final[0].label,
          email: data.data.final[0].email_id,
          city: data.data.final[0].city,
          gst: data.data.final[0].gstin,
          pcode: data.data.final[0].pincode,
          mob: data.data.final[0].mobile_no,
          fax: data.data.final[0].fax,
          address: data.data.final[0].address,
          state: {
            value: data.data.final[0].statecode,
            label: data.data.final[0].statename,
          },
        };
      });
    }
  };
  const getOption = async (a) => {
    // console.log(a)
    if (a?.length > 1) {
      const { data } = await imsAxios.post("/backend/stateList", {
        search: a,
      });

      let arr = [];

      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const updateBranch = async () => {
    if (allField.label == "") {
      return toast.error("Please enter branch name");
    } else if (allField.city == "") {
      return toast.error("Please enter City name");
    } else if (allField.address == "") {
      return toast.error("Please enter Complete branch address");
    } else if (allField.pcode == "") {
      return toast.error("Please enter branch Pincode");
    } else if (allField.gst == "") {
      return toast.error("Please enter branch GST Number");
    }
    setsubmitLoading(true);
    const { data } = await imsAxios.post("/vendor/updateBranchDetails", {
      label: allField.label,
      state: allField.state.value,
      city: allField.city,
      address: allField.address,
      pincode: allField.pcode,
      fax: allField.fax == "" && "--",
      email: allField.email == "" && "--",
      mobile: allField.mob == "" && "--",
      gstid: allField.gst,
      address_code: allField.branchCode,
      vendor_code: viewVendor.vendor_code,
    });
    setsubmitLoading(false);
    if (data.code == 200) {
      setViewVendor(null);
      toast.success(data.message);
    } else {
      toast.error(errorToast(data.message));
    }
  };

  const reset = () => {
    setAllField(resetData);
  };

  useEffect(() => {
    // console.log(viewVendor);
    if (viewVendor == false) {
      reset();
    } else if (viewVendor) {
      fetchAllBranchList();
    }
  }, [viewVendor]);

  return (
    <form>
      <Drawer
        title={`Edit Branch of Vendor: ${viewVendor?.vendor_code}`}
        centered
        confirmLoading={submitLoading}
        open={viewVendor}
        onClose={() => setViewVendor(false)}
        width="50vw"
      >
        <Skeleton loading={skeletonLoading} active />
        <Skeleton loading={skeletonLoading} active />
        {spinLoading && <Loading />}
        {!skeletonLoading && (
          <Form style={{ marginTop: -10 }} layout="vertical" size="small">
            <Row style={{ width: "100%" }}>
              <Col span={24}>
                <Form.Item label="Select Branch">
                  <MySelect
                    value={allField.branchCode}
                    options={allBranchData}
                    // placeholder="Select Branch"
                    onChange={(e) => {
                      getBranchDetails(e);
                      setAllField((allField) => {
                        return { ...allField, addresscode: e };
                      });
                    }}
                  />
                </Form.Item>
              </Col>

              <>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Branch Name">
                    <Input
                      size="default "
                      // placeholder="Branch Name"
                      value={allField.label}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, label: e.target.value };
                        })
                      }
                      // prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>

                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="State">
                    <MyAsyncSelect
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      value={allField?.state}
                      labelInValue
                      loadOptions={getOption}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, state: e };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="City">
                    <Input
                      size="default "
                      // placeholder="Branch City"
                      value={allField.city}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, city: e.target.value };
                        })
                      }
                      // prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="GST Number">
                    <Input
                      size="default "
                      // placeholder="Gst Number"
                      value={allField.gst}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, gst: e.target.value };
                        })
                      }
                      // prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Pin Code">
                    <Input
                      size="default "
                      // placeholder="Branch Pincode"
                      value={allField.pcode}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, pcode: e.target.value };
                        })
                      }
                      // prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Email">
                    <Input
                      size="default "
                      // placeholder="Email"
                      value={allField.email}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, email: e.target.value };
                        })
                      }
                      // prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Mobile">
                    <Input
                      size="default "
                      value={allField.mob}
                      // placeholder="Mobile"
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, mob: e.target.value };
                        })
                      }
                      // prefix={<UserOutlined />}
                    />
                  </Form.Item>
                </Col>
                <Col span={12} style={{ padding: "3px" }}>
                  <Form.Item label="Fax Number">
                    <Input
                      size="default "
                      // placeholder="Fax No"
                      value={allField.fax}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, fax: e.target.value };
                        })
                      }
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
                      value={allField.address}
                      onChange={(e) =>
                        setAllField((allField) => {
                          return { ...allField, address: e.target.value };
                        })
                      }
                    />
                  </Form.Item>
                </Col>
              </>
            </Row>
            <Row justify="end">
              <Space>
                <Button onClick={reset} size="default">
                  Reset
                </Button>
                <Button
                  size="default"
                  type="primary"
                  loading={submitLoading}
                  onClick={updateBranch}
                >
                  Submit
                </Button>
              </Space>
            </Row>
          </Form>
        )}
      </Drawer>
    </form>
  );
};

export default ViewModal;
