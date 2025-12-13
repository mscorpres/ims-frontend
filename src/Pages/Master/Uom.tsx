import React, { useEffect, useState } from "react";
// import { toast } from "react-toastify";
import { Card, Col, Form, Input, Row, Space } from "antd";
import MyDataTable from "../../Components/MyDataTable";
// import { v4 } from "uuid";
// import { imsAxios } from "../../axiosInterceptor";
import MyButton from "../../Components/MyButton";
import useApi from "../../hooks/useApi.ts";
import { createUOM, getUOMList } from "../../api/master/uom";
import { ResponseType } from "../../types/general.ts";

const Uom = () => {
  const [uomData, setUomData] = useState([]);
  const [isDirty, setIsDirty] = useState(false);

  // old code
  // const [loading, setLoading] = useState(false);
  // const [newUom, setNewUom] = useState({
  //   uom: "",
  //   description: "",
  // });

  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();

  // Watch form values to detect changes
  const formValues = Form.useWatch([], form);
  const initialData = { name: "", details: "" };

  //   fetch uom
  const handleFetchUOMList = async () => {
    const response = await executeFun(() => getUOMList(), "fetch");
    setUomData(response.data ?? []);

    // old code
    // setLoading(true);
    // const { data } = await imsAxios.get("/uom");
    // let arr = data.data.map((row, index) => {
    //   return {
    //     ...row,
    //     index: index + 1,
    //     id: v4(),
    //   };
    // });
    // setUomData(arr);
    // setLoading(false);
  };

  //   add UOM
  const submitHandler = async () => {
    const values = await form.validateFields();
    const response: ResponseType = await executeFun(
      () => createUOM(values),
      "submit"
    );
    if (response.success) {
      form.resetFields();
      setIsDirty(false);
      handleFetchUOMList();
    }

    // old code
    // e.preventDefault();
    // if (!newUom.uom) {
    //   toast.error("Please Add UoM");
    // } else if (!newUom.description) {
    //   toast.error("Please Add Description");
    // } else {
    //   setLoading(true);
    //   const { data } = await imsAxios.post("/uom/insert", {
    //     uom: newUom.uom,
    //     description: newUom.description,
    //   });
    //   if (data.code === 200) {
    //     setNewUom({
    //       uom: "",
    //       description: "",
    //     });
    //     fetchUOm();
    //     setLoading(false);
    //   } else {
    //     toast.error(data.message.msg);
    //     setLoading(false);
    //   }
    // }
  };

  const resetHandler = () => {
    form.resetFields();
    setIsDirty(false);

    //old code
    // setNewUom({
    //   uom: "",
    //   description: "",
    // });
  };

  const columns = [
    { field: "id", headerName: "#", width: 30 },
    { field: "name", headerName: "Unit", minWidth: 170, flex: 1 },
    { field: "details", headerName: "Specification", minWidth: 170, flex: 1 },
  ];
  // old code
  // const columns = [
  //   { field: "index", headerName: "S.No", width: 170 },
  //   { field: "units_name", headerName: "Unit", width: 170 },
  //   { field: "units_details", headerName: "Specification", width: 170 },
  // ];

  // Check if form has unsaved changes
  useEffect(() => {
    if (formValues) {
      const currentData = {
        name: formValues.name || "",
        details: formValues.details || "",
      };
      const hasChanges =
        JSON.stringify(currentData) !== JSON.stringify(initialData);
      setIsDirty(hasChanges);
    } else {
      setIsDirty(false);
    }
  }, [formValues]);

  // Warn user when leaving the page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  useEffect(() => {
    handleFetchUOMList();
  }, []);

  return (
    <div style={{ height: "100%" }}>
      <Row gutter={6} style={{ padding: 10 }} justify="center">
        <Col span={4}>
          <Card size="small" title="Create UOM">
            <Form form={form} layout="vertical">
              <Form.Item name="name" label="Unit">
                <Input />
              </Form.Item>
              <Form.Item name="details" label="Specification">
                <Input.TextArea rows={3} />
              </Form.Item>
              <Row justify="center">
                <Space>
                  <MyButton onClick={resetHandler} variant="reset" />
                  <MyButton
                    loading={loading("submit")}
                    onClick={submitHandler}
                    variant="submit"
                  />
                </Space>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={8}>
          <div className="m-2" style={{ height: "100%" }}>
            <div style={{ height: "80vh" }}>
              <MyDataTable
                loading={loading("fetch")}
                data={uomData}
                columns={columns}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Uom;
