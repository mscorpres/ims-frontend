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
import { Typography } from "@mui/material";
// import CustomButton from "../../new/"

const Uom = () => {
  const [uomData, setUomData] = useState([]);

  // old code
  // const [loading, setLoading] = useState(false);
  // const [newUom, setNewUom] = useState({
  //   uom: "",
  //   description: "",
  // });

  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();

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

  useEffect(() => {
    handleFetchUOMList();
  }, []);

  return (
    <div
      style={{ height: "calc(100vh - 130px)", marginTop: 8, padding: 10, gap:12 }}
      className="grid grid-cols-[2fr_4fr] gap-4"
    >
      <div>
        <Typography variant="subtitle1">Create UOM</Typography>
        
  
      <Card size="small">
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Unit">
            <Input />
          </Form.Item>
          <Form.Item name="details" label="Specification">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Row justify="center">
            <Space>
              {/* <CustomButton /> */}
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
      </div>

      <div style={{ height: "calc(100vh - 130px)" }}>
        <MyDataTable
          loading={loading("fetch")}
          data={uomData}
          columns={columns}
        />
      </div>

    </div>
  );
};

export default Uom;
