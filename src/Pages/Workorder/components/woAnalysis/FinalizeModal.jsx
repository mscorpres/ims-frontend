import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Typography,
} from "antd";
import { finalizeOrder, getFinalizeComponents } from "../api";
import { useEffect, useState } from "react";
import Loading from "../../../../Components/Loading";
import FormTable2 from "../../../../Components/FormTable2";
import WODetailsCard from "./WODetailsCard";
import ProductDetailsCard from "./ProductDetailsCard";

let resetDetails = [];

const FinalizeModal = ({ showView, setShowView, getRows }) => {
  const [details, setDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const getDetails = async (id, woId) => {
    try {
      setLoading("fetch");
      form.setFieldValue("components", []);
      const { components, details } = await getFinalizeComponents(
        id,
        woId,
        true
      );
      setLoading(false);
      setDetails(details);
      form.setFieldValue("components", components);
      resetDetails = components;
    } catch (error) {}
  };
  const validateHandler = async () => {
    const values = await form.validateFields();
    Modal.confirm({
      title: "Finalize Work Order",
      content: "Are you sure you want to finalize this work order?",
      onOk: () => submitHandler(values, showView),
      okText: "Finalize",
    });
  };

  const submitHandler = async (values, showView) => {
    setLoading("submit");
    const { error } = await finalizeOrder(values, showView);
    setLoading(false);
    if (!error) {
      setShowView(false);
      getRows();
    }
  };

  const resetHandler = () => {
    Modal.confirm({
      title: "Resetting Work Order Changes",
      content: "Are you sure you want to revert all the changes to work order?",
      onOk: () => form.setFieldValue("components", resetDetails),
      okText: "Reset",
    });
  };
  useEffect(() => {
    if (showView) {
      getDetails(showView.subjectId, showView.woId);
    }
  }, [showView]);

  return (
    <Drawer
      title="Finalize Work Order"
      placement="right"
      onClose={() => setShowView(false)}
      bodyStyle={{
        padding: 5,
      }}
      open={showView}
      width="100%"
    >
      {loading === "fetch" && <Loading />}
      <Form layout="vertical" form={form} style={{ height: "100%" }}>
        <Row gutter={6} style={{ height: "95%", overflow: "hidden" }}>
          <Col span={4} style={{ height: "100%", overflowY: "scroll" }}>
            <Row gutter={[0, 6]}>
              <WODetailsCard details={details} />
              <ProductDetailsCard details={details} />
              <Col span={24}>
                <Row justify="end">
                  <Space>
                    <Button
                      loading={loading === "submit"}
                      onClick={resetHandler}
                    >
                      Reset
                    </Button>
                    <Button
                      loading={loading === "submit"}
                      type="primary"
                      onClick={validateHandler}
                    >
                      Submit
                    </Button>
                  </Space>
                </Row>
              </Col>
            </Row>
          </Col>
          <Col span={20} style={{ height: "100%", overflow: "hidden" }}>
            <FormTable2
              removableRows={true}
              nonRemovableColumns={1}
              columns={componentsItems()}
              listName="components"
              watchKeys={[]}
              nonListWatchKeys={[]}
              componentRequiredRef={[]}
              form={form}
            />
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default FinalizeModal;

const componentsItems = () => [
  {
    headerName: "#",
    name: "",
    width: 30,
    field: (_, index) => (
      <Typography.Text type="secondary">{index + 1}.</Typography.Text>
    ),
  },
  {
    headerName: "Components",
    name: "component",
    width: 250,
    flex: true,
    field: (row) => (
      <Typography.Text style={{ fontSize: 12, justifySelf: "flex-start" }}>
        {row.component}
      </Typography.Text>
    ),
  },
  {
    headerName: "Part Code",
    name: "partCode",
    width: 150,
    field: (row) => (
      <Typography.Text style={{ fontSize: 12, justifySelf: "flex-start" }}>
        {row.partCode}
      </Typography.Text>
    ),
  },

  {
    headerName: "Qty",
    name: "qty",
    width: 200,
    field: (row) => <Input suffix={row.unit} />,
  },
];

const rules = {
  docId: [
    {
      required: true,
      message: "Please enter a doc ID",
    },
  ],
  docDate: [
    {
      required: true,
      message: "Please select document date",
    },
  ],
};
