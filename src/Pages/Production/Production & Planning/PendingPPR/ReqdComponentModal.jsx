import {
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import { useState, useEffect } from "react";
import { imsAxios } from "../../../../axiosInterceptor";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import MySelect from "../../../../Components/MySelect";
import FormTable from "../../../../Components/FormTable";
import Loading from "../../../../Components/Loading";
import { toast } from "react-toastify";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MyButton from "../../../../Components/MyButton";
import CustomButton from "../../../../new/components/reuseable/CustomButton";
import { Add, Check } from "@mui/icons-material";

export default function ReqdComponentModal({
  editPPR,
  reqdKeys,
  sqdComponents,
  setSqdComponents,
  asyncOptions,
  setAsyncOptions,

  setRqdSaved,
}) {
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const typeOptions = [
    { text: "Part", value: "P" },
    { text: "Packing", value: "PCK" },
    { text: "Other", value: "O" },
    { text: "PCB", value: "PCB" },
  ];
  const getDetails = async (forcefully) => {
    console.log("reqdKeys ppr", reqdKeys);
    if (sqdComponents.length === 0 || forcefully) {
      setLoading("fetch");
      const response = await imsAxios.post("/ppr/fetchRQDBom", reqdKeys);
      setLoading(false);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          let arr = data.data.map((row, index) => ({
            ...row,
            id: v4(),
            index: index + 1,
          }));
          setSqdComponents(arr);
        } else {
          setSqdComponents([]);
        }
      }
    }
  };
  const getComponentDetails = async (bomId, componentId, pprId, sku) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post("/bom/fetchBomComponentDetails", {
        subject: bomId,
        ppr: pprId,
        sku,
        component: componentId,
      });
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const value = data.data;

          return {
            partCode: value.part_code,
            bomQty: value.bom_qty,
            poQty: value.popendingqty,
            allStock: value.branchstock,
            type: value.bom_catergory.id,
            rqdQty: value.rqd_qty,
          };
        } else {
          toast.error(data.message.msg);
          return {
            error: true,
          };
        }
      }
    } catch (error) {
      console.log("error while fetching component details", error);
    } finally {
      setLoading(false);
    }
  };
  const inputHandler = async (name, value, id) => {
    let arr = sqdComponents;

    if (name === "component") {
      const data = await getComponentDetails(
        reqdKeys.bom,
        value,
        reqdKeys.ppr,
        reqdKeys.sku
      );
      arr = arr.map((row) => {
        let obj = row;
        if (obj.id === id) {
          if (data.error) {
            const finalObj = {
              ...obj,
              [name]: {
                label: "",
                value: "",
              },
            };
            return finalObj;
          }
          if (!data.error) {
            obj = {
              ...obj,
              [name]: value,
              part: data.partCode,
              bomqty: data.bomQty,
              branchstock: data.allStock,
              popendingqty: data.poQty,
              category: data.type,
              newValidated: true,
            };

            return obj;
          }
        } else {
          return obj;
        }
      });
    } else {
      arr = arr.map((row) => {
        let obj = row;
        if (obj.id === id) {
          obj = {
            ...obj,
            [name]: value,
          };

          return obj;
        } else {
          return obj;
        }
      });
    }

    setSqdComponents(arr);
  };
  const submitHandler = async () => {
    try {
      const payload = {
        project_name: reqdKeys.projectId,
        ppr: reqdKeys.ppr,
        sku: reqdKeys.sku,
        bom: reqdKeys.bom,
        ppr_qty: reqdKeys.qty,
        rqd: reqdKeys.rqd,

        component: sqdComponents.map((row) => row.component),
        category: sqdComponents.map((row) => row.category),
        rate: sqdComponents.map((row) => row.rate),
        req_qty: sqdComponents.map((row) => row.qty),
      };
      setLoading("submit");
      const response = await imsAxios.post("/ppr/update_RQDBomRM", payload);
      setLoading(false);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          // setReqdKeys(false);
          setRqdSaved(true);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const validateHandler = () => {
    Modal.confirm({
      title: "Saving RQD Components",
      content: "Are you sure you want to save these RQD Components?",
      okText: "Continue",
      onOk: submitHandler,
    });
  };
  const removeRow = (id) => {
    setSqdComponents((rows) => rows.filter((row) => row.id !== id));
  };
  const confirmRemove = (row) => {
    Modal.confirm({
      title: "Remove Component",
      content: (
        <Typography.Text>
          Are you sure you want to delete the <strong>{row.part}</strong>?
        </Typography.Text>
      ),
      confirmLoading: loading === "remove",
      okText: "Remove",
      cancelText: "Back",
      onOk: () =>
        reqdKeys.rqd === "D" ? removeRow(row.id) : removeRowsAPI(row),
    });
  };
  const removeRowsAPI = async (row) => {
    try {
      setLoading("remove");
      const response = await imsAxios.post("/ppr/removeComponentFromRqd", {
        skucode: reqdKeys.sku,
        bom: reqdKeys.bom,
        ppr: reqdKeys.ppr,
        component: row.component,
      });
      const { data } = response;
      if (data.code === 200) {
        getDetails(true);
        toast.success(data.message);
      } else {
        toast.error(data.message.msg);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const getNewComponentOptions = async (searhTerm) => {
    setLoading("select");
    const response = await imsAxios.post("backend/getComponentByNameAndNo", {
      search: searhTerm,
    });

    setLoading(false);
    const { data } = response;
    if (data) {
      if (data[0]) {
        let arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        console.log("this is the arr", arr);
        setAsyncOptions(arr);
      }
    }
  };

  const save = async (row) => {
    try {
      setLoading(row.id);
      const response = await imsAxios.post("/ppr/addNewComponentInRqd", {
        ppr: editPPR?.ppr,
        skucode: reqdKeys.sku,
        bom: reqdKeys.bom,
        rate: row.qty,
        component: row.component,
      });
      const { data } = response;
      if (data.code === 200) {
        inputHandler("saved", true, row.id);
      } else {
        toast.error(data.message.msg);
      }
    } catch (error) {
      console.log("error while saving new component", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { headerName: "#", render: ({ row }) => row.index },
    {
      headerName: "",
      // headerName: <CommonIcons action="addRow" onClick={addRow} />,
      width: 40,
      render: ({ row }) =>
        sqdComponents.length > 1 && (
          <CommonIcons action="removeRow" onClick={() => confirmRemove(row)} />
        ),
    },
    {
      headerName: "Name",
      width: 300,
      render: ({ row }) =>
        row.type === "addNewRow" ? (
          <MyAsyncSelect
            style={{ width: 200 }}
            loadOptions={getNewComponentOptions}
            optionsState={asyncOptions}
            selectLoading={loading === "loading"}
            onBlur={() => setAsyncOptions([])}
            onChange={(value) => inputHandler("component", value, row.id)}
          />
        ) : (
          <div style={{ width: 300 }}>
            <ToolTipEllipses text={row.name} />
          </div>
        ),
    },
    {
      headerName: "Part Code",
      width: 100,
      render: ({ row }) => row.part,
    },
    {
      headerName: "Type",

      render: ({ row }) => (
        <MySelect
          onChange={(value) => inputHandler("category", value, row.id)}
          options={typeOptions}
          value={row.category}
        />
      ),
      width: 120,
    },
    {
      headerName: "BOM Qty",
      render: ({ row }) => row.bomqty,
    },
    {
      headerName: "Rate",
      width: 120,

      render: ({ row }) => (
        <Input
          style={{ width: 120 }}
          onChange={(e) => inputHandler("rate", e.target.value, row.id)}
          value={row.rate}
        />
      ),
    },
    {
      headerName: "RQD QTY",
      width: 150,
      render: ({ row }) => (
        <Input
          style={{ width: 120 }}
          onChange={(e) => inputHandler("qty", e.target.value, row.id)}
          value={row.qty}
        />
      ),
    },
    {
      headerName: "All Stock",
      render: ({ row }) => row.branchstock,
    },
    {
      headerName: "Last Order Left Stock",
      render: ({ row }) => "--",
    },
    {
      headerName: "PO QTY",
      render: ({ row }) => row.popendingqty,
    },
    {
      headerName: "Actions",
      // width: 30,
      type: "actions",
      render: ({ row }) =>
        row.newValidated && !row.saved ? (
          <CommonIcons
            loading={loading === row.id}
            action="checkButton"
            onClick={() => save(row)}
          />
        ) : (
          row.saved && <Typography.Text strong>Saved</Typography.Text>
        ),
    },
  ];

  useEffect(() => {
    if (reqdKeys) {
      getDetails(true);
    }
  }, [reqdKeys]);
  return (
    <Col span={24} style={{ height: 700, overflow: "auto" }}>
      {loading === "fetch" && <Loading />}
      <NewComponentModal
        show={showAddModal}
        hide={() => setShowAddModal(false)}
        getNewComponentOptions={getNewComponentOptions}
        asyncOptions={asyncOptions}
        setAsyncOptions={setAsyncOptions}
        typeOptions={typeOptions}
        getComponentDetails={getComponentDetails}
        getDetails={getDetails}
        reqdKeys={reqdKeys}
        selectLoading={loading === "select"}
      />
      <Row justify="end" style={{ marginBottom: 10, marginRight: 10 }}>
        <Space>
          <CustomButton
            size="small"
            title={"Add Component"}
            onclick={() => setShowAddModal(true)}
            starticon={<Add fontSize="small" />}
          />

          <CustomButton
            size="small"
            title={"Save RQD"}
            onclick={validateHandler}
            starticon={<Check fontSize="small" />}
            loading={loading === "submit"}
          />
        </Space>
      </Row>
      <FormTable columns={columns} data={sqdComponents} />
    </Col>
  );
}

const NewComponentModal = ({
  show,
  hide,
  getNewComponentOptions,
  asyncOptions,
  setAsyncOptions,
  typeOptions,
  getComponentDetails,
  reqdKeys,
  getDetails,
  selectLoading,
}) => {
  const [details, setDetails] = useState({
    partCode: "--",
    allStock: "--",
    lastOrderStock: "--",
    poQty: "--",
    rqdQty: "--",
    bomQty: "--",
  });
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const component = Form.useWatch("component", form);

  const handleGetComponentDetails = async (componentKey) => {
    setDetails({
      partCode: "--",
      allStock: "--",
      lastOrderStock: "--",
      poQty: "--",
      rqdQty: "--",
      bomQty: "--",
    });
    setLoading("details");
    const response = await getComponentDetails(
      reqdKeys.bom,
      componentKey,
      reqdKeys.ppr,
      reqdKeys.sku
    );
    setLoading(false);
    form.setFieldValue("bomQty", response.bomQty);
    form.setFieldValue("type", response.type);
    setDetails({
      partCode: response.partCode,
      allStock: response.allStock,
      rqdQty: response.rqdQty,
      poQty: response.poQty,
      bomQty: response.bomQty,
    });
  };

  const submitHandler = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ppr: reqdKeys.ppr,
        skucode: reqdKeys.sku,
        bom: reqdKeys.bom,
        component: values.component.value,
        rate: values.rate,
      };
      setLoading("submit");
      const response = await imsAxios.post(
        "/ppr/addNewComponentInRqd",
        payload
      );
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          getDetails(true);
          resetHandler();
          hide();
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const resetHandler = () => {
    form.resetFields();
    setDetails({
      partCode: "--",
      allStock: "--",
      lastOrderStock: "--",
      poQty: "--",
      rqdQty: "--",
      bomQty: "--",
    });
  };

  useEffect(() => {
    if (component) {
      handleGetComponentDetails(component.value);
    }
  }, [component]);
  useEffect(() => {
    if (!show) {
      resetHandler();
    }
  }, [show]);
  return (
    <Modal
      title="Add Component"
      open={show}
      onOk={submitHandler}
      okText="Add"
      confirmLoading={loading === "submit"}
      onCancel={hide}
      footer={(_, { OkBtn, CancelBtn }) => (
        <>
          <CancelBtn />
          <MyButton variant="reset" onClick={resetHandler} />
          <OkBtn />
        </>
      )}
    >
      <Form initialValues={{}} form={form} layout="vertical">
        <Row gutter={6}>
          <Col span={24}>
            <Form.Item name="component" label="Component">
              <MyAsyncSelect
                labelInValue={true}
                loadOptions={getNewComponentOptions}
                optionsState={asyncOptions}
                selectLoading={selectLoading}
                onBlur={() => setAsyncOptions([])}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="rate" label="Rate">
              <Input />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name="type" label="Type`">
              <MySelect disabled={true} options={typeOptions} />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Card size="small">
              <Row gutter={[10, 10]}>
                <Col span={8}>
                  <Typography.Text strong> Part Code</Typography.Text>
                  <br />
                  <Typography.Text strong type="secondary">
                    {loading !== "details" && details.partCode}
                    {loading === "details" && (
                      <Skeleton.Input size="small" active />
                    )}
                  </Typography.Text>
                </Col>
                <Col span={8}>
                  <Typography.Text strong> All Stock</Typography.Text>
                  <br />
                  <Typography.Text strong type="secondary">
                    {loading !== "details" && details.allStock}
                    {loading === "details" && (
                      <Skeleton.Input size="small" active />
                    )}
                  </Typography.Text>
                </Col>
                <Col span={8}>
                  <Typography.Text strong> RQD Qty</Typography.Text>
                  <br />
                  <Typography.Text strong type="secondary">
                    {loading !== "details" && details.rqdQty}
                    {loading === "details" && (
                      <Skeleton.Input size="small" active />
                    )}
                  </Typography.Text>
                </Col>
                <Col span={8}>
                  <Typography.Text strong> BOM Qty</Typography.Text>
                  <br />
                  <Typography.Text strong type="secondary">
                    {loading !== "details" && details.bomQty}
                    {loading === "details" && (
                      <Skeleton.Input size="small" active />
                    )}
                  </Typography.Text>
                </Col>
                <Col span={8}>
                  <Typography.Text strong>PO Qty</Typography.Text>
                  <br />
                  <Typography.Text strong type="secondary">
                    {loading !== "details" && details.poQty}
                    {loading === "details" && (
                      <Skeleton.Input size="small" active />
                    )}
                  </Typography.Text>
                </Col>
              </Row>
            </Card>
          </Col>
          {/* <Col span={12}>
            <Form.Item name="allStock" label="All Stock">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="lastStock" label="Last Order Stock">
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="poQty" label="PO Qty">
              <Input />
            </Form.Item>
          </Col> */}
        </Row>
      </Form>
    </Modal>
  );
};
