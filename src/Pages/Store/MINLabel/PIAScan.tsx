import { useEffect, useRef, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Typography,
} from "antd";
import { InfoCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import MyButton from "@/Components/MyButton";
import Loading from "@/Components/Loading.jsx";
import MyAsyncSelect from "@/Components/MyAsyncSelect";
//module components
import SingleProduct from "./SingleProduct";
// types
import { ModalType, SelectOptionType } from "@/types/general";
//hooks
import useApi from "@/hooks/useApi";
//apis
import { fetchBoxDetails, updateBoxQty } from "@/api/store/material-in.js";
import { getComponentOptions, getComponentStock } from "@/api/general.ts";

function PIAScan() {
  const [ready, setReady] = useState(false);
  const [selectedPartCode, setSelectedPartCode] = useState(null);
  const [asyncOptions, setAsyncOptions] = useState<SelectOptionType[]>([]);
  const [successData, setSuccessData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stock, setStock] = useState(0);
  const [showResetHandler, setShowResetHandler] = useState(false);
  const [scannedData, setScannedData] = useState({
    string: "",
    loading: false,
  });
  const [scanLoading, setScanLoading] = useState(false);
  const { executeFun, loading } = useApi();

  const [scan] = Form.useForm();
  const ref = useRef(null);

  const components = Form.useWatch("components", {
    form: scan,
    preserve: true,
  });
  const selectedComponent = Form.useWatch("part", scan);

  // fetching data from qr code and setting into form and validating same part code
  const handleScan = (value: string) => {
    try {
      const parsed = JSON.parse(value.toString().split("/n")[0]);
      if (
        components.find(
          (row) =>
            row.label === parsed["label"] && row["MIN ID"] === parsed["MIN ID"]
        )
      ) {
        toast.error(`BOX ${parsed["label"]}  is already scanned`);
        return undefined;
      }

      if (parsed && parsed["Part Code"] == selectedPartCode) {
        handleFetchDetails(parsed["MIN ID"], parsed["label"]);
        return parsed;
      } else {
        toast.error(
          "The Part Code Does not match! Scan Again with correct Part code"
        );
      }
    } catch (error) {
      toast.error(
        "Some Error occurred while scanning the box, please scan the last box again"
      );
    }
  };
  // getting box details and adding it to the form
  const handleFetchDetails = async (minId: string, boxLabel: string) => {
    const response = await executeFun(
      () => fetchBoxDetails(minId, boxLabel),
      boxLabel
    );

    if (response.success) {
      const components = scan.getFieldValue("components");
      scan.setFieldValue(
        "components",
        components.map((row) => {
          if (row.label === boxLabel) {
            return {
              ...row,
              availabelQty: response.data.availabelQty,
            };
          } else {
            return row;
          }
        })
      );
    }
  };
  //fetching component stock from RM location
  const handleFetchComponentStock = async (componentKey?: string) => {
    const values = await scan.validateFields();
    const response = await executeFun(
      () => getComponentStock(componentKey ?? values.part, "rm"),
      "submit"
    );

    if (response.success) {
      setStock(response.data);
      return response.data;
    }
  };

  // calculating total available qty
  const getTotalAvailableQty = (components: []) => {
    return components?.reduce((partialSum, a) => {
      return partialSum + +Number(a.availabelQty ?? 0).toFixed(2);
    }, 0);
  };
  // veryfying stock and total available qty
  const handleVerify = async (componentKey: string) => {
    const stock = await handleFetchComponentStock(componentKey);
    const values = await scan.validateFields();
    const total = getTotalAvailableQty(values.components);
    // const total = values.components?.reduce((partialSum, a) => {
    //   return partialSum + +Number(a.availabelQty).toFixed(2);
    // }, 0);
    return { isVerified: total === stock, totalQty: total, stockQty: stock };
  };

  const validateHandler = async () => {
    let values = await scan.validateFields();
    const verifiied = await handleVerify(values.part);
    if (!verifiied?.isVerified) {
      return toast.error("Qty Entered and Stock does not matched");
    }

    setShowConfirm(true);
    setSuccessData({
      stockQty: verifiied.stockQty,
      count: values.components.length,
      totalQty: verifiied.totalQty,
      component: selectedPartCode,
    });
  };
  // submitting the form (first fetching stock and veryfying it then submitting)
  const handleSubmit = async () => {
    let values = await scan.validateFields();

    const response = await executeFun(
      () => updateBoxQty(values.part, values, stock),
      "submit"
    );

    if (response.success) {
      scan.resetFields();
      setShowConfirm(false);
      setSuccessData(null);
    }
  };
  // storing part code in state to validate same part code after scanning labels
  const handleGetPartCode = (componentKey: string) => {
    const foundComponent = asyncOptions.find(
      (row: SelectOptionType) => row.value === componentKey
    );
    setSelectedPartCode(foundComponent?.partCode);
  };
  const handleFetchComponentOptions = async (search: string) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );

    if (response.success) {
      const arr = response.data.map((row) => ({
        text: row.text,
        value: row.id,
        partCode: row.part_code,
      }));
      return setAsyncOptions(arr);
    }
    setAsyncOptions([]);
  };

  //focusing to hidden input and updating ready state
  const scanTheQr = () => {
    setReady(true);
    ref.current?.focus();
  };
  const handleReset = () => {
    scan.resetFields();
    setStock(0);
    setSelectedPartCode(null);
    setShowResetHandler(false);
  };

  useEffect(() => {
    if (selectedComponent) {
      scanTheQr();
      handleGetPartCode(selectedComponent);
      handleFetchComponentStock(selectedComponent);
    }
  }, [selectedComponent]);

  return (
    <Form
      initialValues={initialValues}
      layout="vertical"
      form={scan}
      style={{
        padding: 20,
        height: "100%",
        overflow: "hidden",
      }}
    >
      <SubmitConfirm
        show={showConfirm}
        hide={() => setShowConfirm(false)}
        loading={loading("submit")}
        stockQty={successData?.stockQty}
        count={successData?.count}
        totalQty={successData?.totalQty}
        component={successData?.component}
        submitHandler={handleSubmit}
      />
      <ResetConfirm
        show={showResetHandler}
        hide={() => setShowResetHandler(false)}
        resetHandler={handleReset}
      />
      {scanLoading && <Loading />}

      <Row
        justify="center"
        gutter={8}
        style={{
          padding: "0px 5px",
          height: "100%",

          overflow: "hidden",
        }}
      >
        <Col sm={4} xl={6} xxl={5}>
          <Flex gap={10} vertical>
            <Card size="small">
              <Form.Item label="Component" name="part">
                <MyAsyncSelect
                  onBlur={() => setAsyncOptions([])}
                  loadOptions={handleFetchComponentOptions}
                  optionsState={asyncOptions}
                  selectLoading={loading("select")}
                />
              </Form.Item>
              <MyButton
                text="Scan Label"
                variant="scan"
                type="default"
                onClick={scanTheQr}
                loading={loading("fetch") || scannedData.loading}
                style={{ width: "100%" }}
                disabled={!selectedComponent}
              />
              <Flex vertical gap={10} style={{ marginTop: 10 }}>
                <Flex justify="center">
                  <Typography.Text
                    strong
                    style={{
                      color: ready ? "green" : "brown",
                      fontSize: 14,
                      textAlign: "center",
                    }}
                  >
                    {ready
                      ? "Ready to Scan !!!"
                      : "Click the scan button to start scanning !!!"}
                  </Typography.Text>
                </Flex>
                <Form.Item name="remarks" label="Remarks">
                  <Input.TextArea rows={3} />
                </Form.Item>
                <MyButton
                  loading={loading("submit")}
                  block
                  disabled={
                    !(stock - getTotalAvailableQty(components ?? []) === 0) ||
                    !components ||
                    components?.length === 0
                  }
                  variant="save"
                  onClick={validateHandler}
                />
                <Flex vertical align="center" style={{ marginTop: 15 }} gap={3}>
                  <InfoCircleOutlined style={{ color: "grey" }} />
                  <Typography.Text
                    type="secondary"
                    strong
                    style={{ fontSize: 13, textAlign: "center" }}
                  >
                    Select a component and then click the scan button to start
                    scanning
                  </Typography.Text>
                </Flex>
                <MyButton
                  onClick={() => setShowResetHandler(true)}
                  variant="reset"
                />
              </Flex>
            </Card>
            <Card size="small" title="Scan Summary">
              <Flex gap={10} wrap="wrap" justify="space-between">
                <SingleDetail
                  label="Stock Qty"
                  value={
                    <Flex justify="space-between">
                      {stock?.toString()}
                      <ReloadOutlined
                        onClick={() => handleFetchComponentStock()}
                        style={{ color: "#02b0a9", cursor: "pointer" }}
                      />
                    </Flex>
                  }
                  // value={stock?.toString() ?? "--"}
                />

                <SingleDetail
                  label="Boxes Scanned"
                  value={components?.length ?? 0}
                />
                <SingleDetail
                  label="Qty Scanned"
                  value={getTotalAvailableQty(components ?? []).toString()}
                />
                <SingleDetail
                  label="Qty Difference"
                  value={(
                    stock - getTotalAvailableQty(components ?? [])
                  )?.toString()}
                />
              </Flex>
            </Card>
          </Flex>
          {/* hidden input */}
          {/* <Form.Item name="raw"> */}
          <input
            // style={{ height: 300, width: "100%" }}
            ref={ref}
            onBlur={() => {
              setReady(false);
            }}
            onKeyDown={(e) => {
              if (e.target.value.length === 1) {
                setScanLoading(true);
              }
              if (e.keyCode === 13) {
                let arr = scan.getFieldValue("components");
                setScanLoading(false);
                if (handleScan(e.target.value))
                  scan.setFieldValue("components", [
                    ...arr,
                    handleScan(e.target.value),
                  ]);

                setScannedData({
                  string: "",
                });
                e.target.value = "";
              }
            }}
            style={{
              width: 0,
              height: 0,
              opacity: 0,
              zIndex: -1,
              pointerEvents: "none",
            }}
          />
        </Col>
        <Col
          sm={20}
          xl={18}
          xxl={19}
          style={{
            height: "100%",
            overflowY: "hidden",
            border: "1px solid #eee",
            borderRadius: 10,
            padding: 10,
          }}
        >
          {components?.length === 0 && (
            <Flex
              justify="center"
              align="center"
              vertical
              style={{ height: "90%" }}
            >
              <Typography.Text type="secondary" strong style={{ fontSize: 20 }}>
                No Label Scanned!!
              </Typography.Text>
              <Typography.Text
                type="secondary"
                strong
                style={{ textAlign: "center" }}
              >
                Select a component and scan labels to see components...
              </Typography.Text>
            </Flex>
          )}
          {components?.length > 0 && (
            <Col span={24} style={{ height: "100%" }}>
              <Row gutter={[6, 6]} style={{ height: "100%" }}>
                <Col span={1}>
                  <Typography.Text strong type="secondary">
                    #
                  </Typography.Text>
                </Col>
                <Col span={1}>
                  <Typography.Text strong type="secondary">
                    Box
                  </Typography.Text>
                </Col>
                <Col span={2}>
                  <Typography.Text strong type="secondary">
                    Vendor
                  </Typography.Text>
                </Col>
                <Col span={2}>
                  <Typography.Text strong type="secondary">
                    Inv. Date
                  </Typography.Text>
                  {/* this above one */}
                </Col>
                <Col span={2}>
                  <Typography.Text strong type="secondary">
                    Cost Center
                  </Typography.Text>
                </Col>
                <Col span={2}>
                  <Typography.Text strong type="secondary">
                    Project
                  </Typography.Text>
                </Col>
                <Col span={3}>
                  <Typography.Text strong type="secondary">
                    MIN ID
                  </Typography.Text>
                </Col>
                <Col span={2}>
                  <Typography.Text strong type="secondary">
                    MIN Qty
                  </Typography.Text>
                </Col>
                <Col span={2}>
                  <Typography.Text strong type="secondary">
                    Box Qty
                  </Typography.Text>
                </Col>
                <Col span={2}>
                  <Typography.Text strong type="secondary">
                    Box Opened?
                  </Typography.Text>
                </Col>
                <Col span={2}>
                  <Typography.Text strong type="secondary">
                    Available Qty
                  </Typography.Text>
                </Col>
                <Divider />
                <Col span={24} style={{ height: "100%", overflow: "auto" }}>
                  <Form.List name="components">
                    {(fields, { add, remove }) => (
                      <Flex
                        vertical
                        gap={10}
                        // style={{ height: "100%", overflowY: "auto" }}
                      >
                        {fields.map((field, index) => (
                          <Form.Item noStyle>
                            <SingleProduct
                              field={field}
                              form={scan}
                              remove={remove}
                              loading={loading}
                              SingleDetail={SingleDetail}
                              index={index}
                            />
                          </Form.Item>
                        ))}
                        <Row justify="center">
                          {components?.length > 0 && (
                            <Typography.Text type="secondary">
                              ----End of the List----
                            </Typography.Text>
                          )}
                        </Row>
                      </Flex>
                    )}
                  </Form.List>
                </Col>
              </Row>
            </Col>
          )}
        </Col>
      </Row>
    </Form>
  );
}

export default PIAScan;

const SingleDetail = ({
  label,
  value,
}: {
  label: string;
  value?: string | React.ReactNodez;
}) => {
  return (
    <Flex vertical gap={5}>
      <Typography.Text style={{ fontSize: "0.8rem" }} strong>
        {label}
      </Typography.Text>
      <Typography.Text>{value ?? "--"}</Typography.Text>
    </Flex>
  );
};

const initialValues = {
  components: [],
};

interface ConfirmProps {
  show: boolean;
  hide: () => void;
  loading: true;
  stockQty: string | number;
  count: number;
  totalQty: string | number;
  component: string;
  submitHandler: () => void;
}
const SubmitConfirm = ({
  show,
  hide,
  loading,
  stockQty,
  count,
  totalQty,
  component,
  submitHandler,
}: ConfirmProps) => {
  return (
    <Modal
      confirmLoading={loading}
      title="Confirm Updating Boxes"
      open={show}
      onCancel={hide}
      okText="Continue"
      onOk={submitHandler}
    >
      <Flex vertical gap={15}>
        <Typography.Text strong>
          Total Available Quantity ({totalQty}) is verified with the stock Qty (
          {stockQty}) of component {component}.
        </Typography.Text>

        <Typography.Text strong>
          Are you sure you want to update available quantities of these boxes?
        </Typography.Text>
        <Typography.Text strong>Total Boxes Scanned: {count}</Typography.Text>
      </Flex>
    </Modal>
  );
};

interface ResetProps extends ModalType {
  resetHandler: () => void;
}
const ResetConfirm = (props: ResetProps) => {
  return (
    <Modal
      open={props.show}
      onCancel={props.hide}
      onOk={props.resetHandler}
      okText="Reset"
    >
      <Flex vertical>
        <Typography.Text strong>
          Are you sure you want to reset?
        </Typography.Text>
        <Typography.Text>All the progress will be lost</Typography.Text>
      </Flex>
    </Modal>
  );
};
