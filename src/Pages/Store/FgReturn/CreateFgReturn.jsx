import { Col, Descriptions, Divider, Form, Input, Row } from "antd";
import React, { useEffect, useState } from "react";
import NavFooter from "../../../Components/NavFooter";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import useApi from "../../../hooks/useApi.ts";
import { getProductsOptions } from "../../../api/general";
import { imsAxios } from "../../../axiosInterceptor";
import MySelect from "../../../Components/MySelect";
import { toast } from "react-toastify";

function CreateFgReturn() {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [bomOptions, setBomOptions] = useState([]);
  const [locationlist, setLocationList] = useState([]);
  const [fgReturn] = Form.useForm();
  const sku = Form.useWatch("sku", fgReturn);
  const selectedStatus = Form.useWatch("status", fgReturn);
  const statusOptions = [
    { text: "Okay (can be reused)", value: "okay" },
    { text: "Not Okay (damaged)", value: "notOkay" },
  ];

  const { executeFun, loading1 } = useApi();
  const getOption = async (searchInput) => {
    setAsyncOptions([]);
    const response = await executeFun(
      () => getProductsOptions(searchInput, true),
      "select"
    );
    let { data } = response;

    setAsyncOptions(data);
  };
  const getExistingDetails = async (sku) => {
    // setAsyncOptions([]);
    setLoading("page");
    const response = await imsAxios.post("/ppr/fetchProductData", {
      search: sku,
    });
    setLoading(false);

    const { data } = response;
    if (data) {
      const bomArr = data.bom.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      fgReturn.setFieldValue("uom", data.other.uom);
      setBomOptions(bomArr);
      //   createPPRForm.setFieldValue(
      //     "existingQty",
      //     data?.other?.existingplanedQty
      //   );
      //   createPPRForm.setFieldValue("stock", data?.other?.stockInHand);
      //   createPPRForm.setFieldValue("uom", data?.other?.uom);
    }
  }; //to get location from database
  const locationList = async (search) => {
    const { data } = await imsAxios.post("/backend/fetchLocation", {
      searchTerm: search,
    });
    let locArr = [];
    locArr = data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setLocationList(locArr);
  };
  const getLocations = async () => {
    const { data } = await imsAxios.get("/ppr/mfg_locations");
    const arr = [];
    data.data.map((a) => arr.push({ text: a.text, value: a.id }));
    setLocationList(arr);
  };
  const resetFunction = () => {
    fgReturn.resetFields();
  };
  const validateHandler = async () => {
    setLoading(true);
    const values = await fgReturn.validateFields();
    let payload = {
      product_sku: values.sku?.key,
      bom_id: values.bom?.key,
      qty_return: values.qty,
      location_in: values.location,
      fg_status: values.status == "okay" ? "OK" : "NOT_OK",
      remark: values.remarks,
    };

    // console.log("payload", payload);
    const response = await imsAxios.post("/fg_return/saveFG_return", payload);
    // console.log("response", response);
    if (response.success == true) {
      toast.success(response.message);
      resetFunction();
      setLoading(false);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (sku) {
      getExistingDetails(sku.value);
    }
  }, [sku]);
  useEffect(() => {
    if (selectedStatus) {
      getLocations();
    }
  }, [selectedStatus]);

  return (
    <div style={{ height: "90%" }}>
      <Row gutter={10} style={{ margin: "10px" }} justify="center">
        <Form form={fgReturn} layout="vertical">
          <Row>
            <Col span={6}>
              <Descriptions size="small" title="FG Details">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Enter FG details like SKU and BOM.
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={18}>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="SKU Code"
                    name="sku"
                    rules={[
                      {
                        required: true,
                        message: "Please provide the sku.",
                      },
                    ]}
                  >
                    <MyAsyncSelect
                      loadOptions={getOption}
                      optionsState={asyncOptions}
                      onBlur={() => setAsyncOptions([])}
                      labelInValue
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="bom"
                    label="BOM"
                    rules={[
                      {
                        required: true,
                        message: "Please provide the BOM.",
                      },
                    ]}
                  >
                    <MyAsyncSelect
                      loadOptions={getExistingDetails}
                      optionsState={bomOptions}
                      onBlur={() => setAsyncOptions([])}
                      labelInValue
                    />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="uom"
                    label="UoM"
                    rules={[
                      {
                        required: true,
                        message: "Please provide the UoM.",
                      },
                    ]}
                  >
                    <Input disabled />
                  </Form.Item>
                </Col>
              </Row>
            </Col>
          </Row>
          <Divider />
          <Row>
            <Col span={6}>
              <Descriptions size="small" title="Return Details">
                <Descriptions.Item
                  contentStyle={{
                    fontSize: window.innerWidth < 1600 && "0.7rem",
                  }}
                >
                  Enter Item details like Qty,location and its usage condition.
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col span={18}>
              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="Quantity"
                    name="qty"
                    rules={[
                      {
                        required: true,
                        message: "Please provide the Quantity.",
                      },
                    ]}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    name="status"
                    label="Condition of Item"
                    rules={[
                      {
                        required: true,
                        message: "Please provide the Condition of Item.",
                      },
                    ]}
                  >
                    <MySelect options={statusOptions} />
                  </Form.Item>
                </Col>
                {/* {selectedStatus == "okay" && ( */}
                <Col span={6}>
                  <Form.Item
                    name="location"
                    label="Location"
                    // rules={[
                    //   {
                    //     required: true,
                    //     message: "Please provide the Location.",
                    //   },
                    // ]}
                  >
                    <MyAsyncSelect
                      disabled={selectedStatus != "okay"}
                      loadOptions={getLocations}
                      optionsState={locationlist}
                    />
                  </Form.Item>
                </Col>
                <Col span={10}>
                  {" "}
                  <Form.Item name="remarks" label="Remarks">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                </Col>
                {/* )} */}
              </Row>
            </Col>
          </Row>
        </Form>{" "}
        <Divider />
      </Row>
      <NavFooter
        resetFunction={resetFunction}
        submitFunction={validateHandler}
        nextLabel="Submit"
        loading={loading}
      />
    </div>
  );
}

export default CreateFgReturn;
