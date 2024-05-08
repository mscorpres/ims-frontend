import { Card, Col, Divider, Flex, Form, Input, Row, Typography } from "antd";
import { useEffect, useRef, useState } from "react";

import MyButton from "@/Components/MyButton";
import { fetchBoxDetails, updateBoxQty } from "@/api/store/material-in.js";
import useApi from "@/hooks/useApi";
import useDebounce from "@/hooks/useDebounce";
import Loading from "@/Components/Loading.jsx";
import SingleProduct from "./SingleProduct";
import { toast, ToastContainer } from "react-toastify";
import { getComponentOptions } from "@/api/general.ts";
import MyAsyncSelect from "@/Components/MyAsyncSelect";
import { imsAxios } from "@/axiosInterceptor";
function PIAScan() {
  var obj;
  const [details, setDetails] = useState(defaultDetails);
  const [ready, setReady] = useState(false);
  const [componentData, setComponentData] = useState({});
  const [boxChecked, setBoxCheck] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [validateButton, setValidateButton] = useState(true);
  const [scannedData, setScannedData] = useState({
    string: "",
    loading: false,
  });

  const { executeFun, loading } = useApi();
  const updatedString = useDebounce(scannedData.string, 1000);
  console.log("here in", ready);
  const [scan] = Form.useForm();
  const ref = useRef(null);
  // const availQty = Form.useWatch("availabelQty");

  const components = Form.useWatch("components", {
    form: scan,
    preserve: true,
  });
  const handleScan = (value: string) => {
    let parsed;
    try {
      console.log("string is", value);
      // parsed = JSON.parse(value);
      parsed = JSON.parse(value);
      console.log("parse", parsed);
      console.log("componentData", componentData);
      if (parsed && parsed["Part Code"] == componentData.part_code) {
        handleFetchDetails(parsed["MIN ID"], parsed["label"]);
      } else {
        toast.error(
          "The Part Code Does not match! Scan Again with correct Part code"
        );
        setScannedData({
          loading: false,
          string: "",
        });
      }
    } catch (error) {
      console.log(error);
      setScannedData({
        loading: false,
        string: "",
      });
    }
  };
  const handleFetchDetails = async (minId: string, boxLabel: string) => {
    const response = await executeFun(
      () => fetchBoxDetails(minId, boxLabel),
      "fetch"
    );
    console.log("response----", response);

    if (response.success) {
      setDetails(response.data);
      scan.setFieldValue("availabelQty", response.data.availabelQty);

      const components = scan.getFieldValue("components");
      console.log("components", components.text);
      console.log("components", components);
      // console.log("availQty", availQty);

      components.push(response.data);
      scan.setFieldValue("components", components);
      setScannedData({
        loading: false,
        string: "",
      });
    }
  };
  const reset = () => {
    scan.resetFields();
    setDetails(defaultDetails);
    setScannedData({
      string: "",
      loading: false,
    });
    scanTheQr();
  };
  const submitData = async () => {
    let values = await scan.validateFields();
    const response = await executeFun(
      () => updateBoxQty(details.minId, details.boxLabel, values.availabelQty),
      "submit"
    );

    if (response.success) {
      reset();
    }
  };
  const scanTheQr = () => {
    setReady(true);
    console.log("here in scan the qr");

    ref.current?.focus();
  };
  useEffect(() => {
    console.log("scan finish");
    if (updatedString) {
      if (updatedString.length > 10) {
        handleScan(updatedString);
      }
      setScannedData((curr) => ({
        ...curr,
        loading: false,
      }));
    }
  }, [updatedString]);
  useEffect(() => {
    if (scannedData.string.length === 1) {
      setScannedData((curr) => ({
        ...curr,
        loading: true,
      }));
    }
  }, [scannedData]);
  useEffect(() => {
    scanTheQr();
  }, []);
  const getComponentOption = async (search) => {
    // setLoading("select");
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search,
    // });
    // setLoading(false);
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    const { data } = response;
    getData(response);
  };
  const sentData = async () => {
    console.log("comp", componentData);
    const values = await scan.validateFields();
    //     {
    //   "minId": ["MIN/24-25/0002"],
    //   "box": ["Box1"],
    //   "avlQty" : ["4800"],
    //   “is_open” : [“true/false”]
    //   “component” : “”
    // }

    obj = {
      minId: values?.components?.map((r) => r.minId),
      box: values?.components?.map((r) => r.boxLabel),
      avlQty: values?.components?.map((r) => r.availabelQty),
      is_open: values?.components?.map((r) =>
        r.opened == true ? "true" : "false"
      ),
      component: componentData?.id,
    };
    console.log("obj", obj);
    let a = Number(
      obj.avlQty?.reduce((partialSum, a) => {
        return partialSum + Number(a);
      }, 0)
    ).toFixed(2);
    console.log("a", a);

    const response = await imsAxios.post("/minBoxLablePrint/getComponetQty", {
      component: componentData?.id,
    });
    console.log("response");
    let { data } = response;
    if (response.success) {
      toast.info(data.stock);
    }
    if (a == data.stock) {
      console.log("is equal");
      submit(obj);
    } else {
      console.log("not equal");
    }
  };
  const submit = async () => {
    let response = await imsAxios.post("/minBoxLablePrint/updateAvailQty", obj);
    console.log("obj-------------------------", response);
  };
  const getData = (response) => {
    const { data } = response;
    if (data) {
      if (data.length) {
        const arr = data.map((row) => ({
          text: row.text,
          value: row.id,
          partCode: row.part_code,
        }));

        setAsyncOptions(arr);
        console.log("response", response);

        setComponentData(response.data[0]);
      }
    }
  };

  return (
    <Form
      initialValues={initialValues}
      layout="vertical"
      form={scan}
      style={{ padding: 20 }}
    >
      <Row gutter={6} style={{ padding: "0px 5px", height: "90%" }}>
        <Col span={4} style={{ height: "100%", overflowY: "auto" }}>
          <Card size="small">
            {/* <Flex vertical justify="center" gap={10}> */}
            <Col span={20}>
              <Form.Item label="Part Code" name="part">
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={getComponentOption}
                  optionsState={asyncOptions}
                  selectLoading={loading("select")}
                />
              </Form.Item>
            </Col>
            {/* <Flex justify="center"> */}
            <Col span={4}>
              <MyButton
                size="large"
                text="Scan Label"
                variant="scan"
                type="default"
                onClick={scanTheQr}
                loading={loading("fetch") || scannedData.loading}
                style={{ width: 170 }}
              />
            </Col>
            {/* </Flex> */}
            <Flex justify="center">
              <Typography.Text
                strong
                style={{ color: ready ? "green" : "red", fontSize: 10 }}
              >
                {ready
                  ? "Ready to Scan !!!"
                  : "Click the scan button to start scanning !!!"}
              </Typography.Text>
            </Flex>
            {/* </Flex> */}
            <Col>
              <MyButton variant="save" onClick={sentData}>
                save
              </MyButton>
            </Col>
          </Card>
          {/* hidden input */}
          <Input
            ref={ref}
            onChange={(e) => {
              setScannedData(() => ({
                loading: true,
                string: e.target.value,
              }));
              // }
            }}
            onBlur={() => {
              setReady(false);
            }}
            value={scannedData.string}
            style={{ opacity: 0, zIndex: -1, pointerEvents: "none", width: 10 }}
          />
        </Col>
        <Col span={20}>
          <Row justify="center">
            <div style={{ flex: 1 }}>
              <Col
                span={24}
                style={{
                  height: "30rem",
                  // overflowX: "hidden",
                  overflowY: "auto",
                }}
              >
                <Form.List name="components">
                  {(fields, { add, remove }) => (
                    <>
                      <Col span={24}>
                        {fields.map((field, index) => (
                          <Form.Item noStyle>
                            <SingleProduct
                              fields={fields}
                              field={field}
                              index={index}
                              add={add}
                              form={scan}
                              remove={remove}
                              loading={loading}
                              scannedData={scannedData}
                              SingleDetail={SingleDetail}
                              details={details}
                              reset={reset}
                              submitData={submitData}
                              scanTheQr={scanTheQr}
                              ready={ready}
                              ref={ref}
                              setScannedData={setScannedData}
                              setReady={setReady}
                              setBoxCheck={setBoxCheck}
                              boxChecked={boxChecked}
                            />
                          </Form.Item>
                        ))}
                        <Row justify="center">
                          <Typography.Text type="secondary">
                            ----End of the List----
                          </Typography.Text>
                        </Row>
                      </Col>
                    </>
                  )}
                </Form.List>
              </Col>
            </div>
          </Row>
        </Col>
      </Row>
    </Form>
  );
}

export default PIAScan;

const SingleDetail = ({ label, value }: { label: string; value?: string }) => {
  return (
    <Flex vertical gap={5}>
      <Typography.Text style={{ fontSize: "0.8rem" }} strong>
        {label}
      </Typography.Text>
      <Typography.Text>{value ?? "--"}</Typography.Text>
    </Flex>
  );
};

const defaultDetails = {
  minId: undefined,
  minDate: undefined,
  component: undefined,
  partCode: undefined,
  minQty: undefined,
  costCenter: undefined,
  vendor: undefined,
  vendorCode: undefined,
  boxLabel: undefined,
  boxDate: undefined,
  boxQty: undefined,
  project: undefined,
};
const initialValues = {
  components: [],
};
