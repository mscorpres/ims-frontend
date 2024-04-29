import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Drawer,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Typography,
} from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import useApi from "../../../hooks/useApi.ts";
import { getMINComponents, printLabels } from "../../../api/store/material-in";
import Loading from "../../../Components/Loading";
import MyButton from "../../../Components/MyButton";
import TableActions from "../../../Components/TableActions.jsx/TableActions";

const LabelDrawer = ({
  open,
  hide,
  preSelected,
  handleFetchMINOptions,
  selectLoading,
}) => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const [piaEnabled, setPiaEnabled] = useState(false);
  const [showEditBoxModal, setShowEditBoxModal] = useState(false);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();
  const selectedMIN = Form.useWatch("minId", form);

  const handleFetchComponents = async (minId) => {
    const response = await executeFun(() => getMINComponents(minId), "fetch");
    if (response.data[0].piaStatus === "Y") {
      setPiaEnabled(true);
    } else {
      setPiaEnabled(false);
    }

    form.setFieldsValue({
      components: response.data,
      minId: {
        label: minId,
        value: minId,
      },
    });
  };

  const handlePrintLabels = async () => {
    const values = await form.getFieldsValue();

    const obj = {
      minId: values.minId.value,
      components: values.components.map((row) => ({
        minQty: row.qty,
        partCode: row.partCode,
        componentKey: row.componentKey,
        // in case of pia
        boxes:
          row.piaStatus !== "N"
            ? boxes.map((box) => ({
                label: box.label,
                qty: box.qty,
              }))
            : undefined,
        //in case of non pia
        labelQty: row.piaStatus === "N" ? row.labelQty : undefined,
      })),
    };

    const response = await executeFun(() => printLabels(obj), "submit");
    if (response.success) {
      hide();
    }
  };
  useEffect(() => {
    if (preSelected) {
      form.setFieldValue("minId", preSelected);
    }
  }, [preSelected]);

  useEffect(() => {
    if (selectedMIN) {
      handleFetchComponents(selectedMIN.value);
    }
  }, [selectedMIN]);

  useEffect(() => {
    if (!open) {
      setBoxes([]);
      // form.setFieldValue("minId", undefined);
      form.setFieldValue("components", []);
      setPiaEnabled(false);
    }
  }, [open]);
  return (
    <Drawer
      open={open}
      onClose={hide}
      title="Print / Download Labels"
      width={500}
    >
      {loading("fetch") && <Loading />}
      <EditBoxModal
        open={showEditBoxModal}
        hide={() => setShowEditBoxModal(false)}
        setBoxes={setBoxes}
      />
      <Form form={form} layout="vertical">
        <Flex gap={5} align="center">
          <div style={{ width: "100%" }}>
            <Form.Item name="minId" label="Select MIN">
              <MyAsyncSelect
                labelInValue={true}
                loadOptions={(search) =>
                  handleFetchMINOptions(search, setAsyncOptions)
                }
                onBlur={() => setAsyncOptions([])}
                selectLoading={selectLoading}
                optionsState={asyncOptions}
              />
            </Form.Item>
          </div>
          <div style={{ marginTop: 5 }}>
            <MyButton
              loading={loading("submit")}
              onClick={handlePrintLabels}
              variant="print"
            />
          </div>
        </Flex>

        <Form.List name="components">
          {(fields) => (
            <Flex gap={6} vertical justify="end">
              {fields.map((field) => (
                <SingleCompoent
                  field={field}
                  form={form}
                  boxes={boxes}
                  setBoxes={setBoxes}
                  setShowEditBoxModal={setShowEditBoxModal}
                />
              ))}
            </Flex>
          )}
        </Form.List>
      </Form>
      {piaEnabled && (
        <Flex justify="center">
          <Typography.Text strong type="secondary">
            Total Qty:{" "}
            {boxes.reduce(
              (partialSum, a) => +Number(partialSum) + +Number(a.qty),
              0
            )}
          </Typography.Text>
        </Flex>
      )}
      {piaEnabled && (
        <div
          style={{
            height: "70%",
            overflow: "auto",
            overflowX: "hidden",
          }}
        >
          <Row gutter={[6, 6]}>
            {boxes.map((row, index) => (
              <Col span={8}>
                <Card size="small">
                  <Flex vertical align="center">
                    <Typography.Text strong>{row.label}</Typography.Text>
                    <Flex gap={5}>
                      <Typography.Text>Qty: {row.qty}</Typography.Text>
                      <TableActions
                        onClick={() =>
                          setShowEditBoxModal({ ...row, index: index })
                        }
                        action="edit"
                      />
                    </Flex>
                  </Flex>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Drawer>
  );
};

export default LabelDrawer;

const SingleCompoent = ({ field, form, setBoxes }) => {
  const piaStatus = Form.useWatch(["components", field.key, "piaStatus"], form);
  const partCode = Form.useWatch(["components", field.key, "partCode"], form);
  const minQty = Form.useWatch(["components", field.key, "qty"], form);
  const boxCount = Form.useWatch(["components", field.key, "boxCount"], form);

  const calculateBoxCount = () => {
    setBoxes([]);
    let calculated = +Number(minQty) / +Number(boxCount);
    const remaining = +Number(minQty) - Math.floor(calculated) * boxCount;

    for (let i = 0; i < boxCount; i++) {
      let newBox = {
        label: "B" + `${i + 1}`.padStart(3, "0"),
      };
      if (i === boxCount - 1) {
        newBox = {
          ...newBox,
          qty: Math.floor(calculated + remaining),
        };
      } else {
        newBox = {
          ...newBox,
          qty: Math.floor(calculated),
        };
      }

      setBoxes((curr) => [...curr, newBox]);
    }
  };

  return (
    <Card size="small">
      <Row gutter={6}>
        <Col span={5}>
          <Form.Item name={[field.key, "partCode"]} label="Part Code">
            {partCode}
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item name={[field.key, "qty"]} label="MIN Qty">
            {minQty}
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="PIA Enabled?">
            <Typography.Text strong>
              {piaStatus === "Y" ? "Yes" : "No"}
            </Typography.Text>
          </Form.Item>
        </Col>
        {piaStatus === "Y" && (
          <Col span={8}>
            <Form.Item name={[field.key, "boxCount"]} label="Box Count">
              <Input />
            </Form.Item>
          </Col>
        )}

        {piaStatus !== "Y" && (
          <Col span={8}>
            <Form.Item name={[field.key, "labelQty"]} label="Label Count">
              <Input />
            </Form.Item>
          </Col>
        )}
      </Row>
      {piaStatus === "Y" && (
        <Flex justify="end">
          <Button onClick={calculateBoxCount}>Calculate</Button>
        </Flex>
      )}
    </Card>
  );
};

const EditBoxModal = ({ open, hide, setBoxes }) => {
  const [form] = Form.useForm();

  const handleUpdateBox = async () => {
    const values = await form.validateFields();

    setBoxes((curr) => {
      let arr = curr;
      arr[open.index] = {
        ...arr[open.index],
        qty: values.qty,
      };
      return arr;
    });
    hide();
  };

  useEffect(() => {
    if (open) {
      form.setFieldValue("qty", open.qty);
    }
  }, [open]);
  return (
    <Modal
      open={open}
      onCancel={hide}
      title={`Update Qty of ${open.label ?? ""}`}
      onOk={handleUpdateBox}
      okText="Update"
    >
      <Form form={form} layout="vertical">
        <Form.Item name="qty" label="Updated Qty">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
