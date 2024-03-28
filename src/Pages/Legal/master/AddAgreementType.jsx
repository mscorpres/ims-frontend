import { Button, Card, Col, Form, Input, Row } from "antd";
import React from "react";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";
import { useEffect, useState } from "react";
import { v4 } from "uuid";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { toast } from "react-toastify";
import { EditOutlined } from "@ant-design/icons";
import MyButton from "../../../Components/MyButton";

function AddAgreementType() {
  const [rows, setRows] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState("");
  const [partysearch, setpartysearch] = useState("");
  const [form] = Form.useForm();
  const addRows = async (values) => {
    console.log("values", values);
    const data = await imsAxios.post("/qaProcessmaster/insert_Process", values);

    console.log("row Data", data);
    if (data.status === "200" || data.status === 200) {
      // getRows();
    }
  };

  const getpartydetails = async () => {
    console.log(partysearch);
    setRows([]);
    const response = await imsAxios.get("/agreement/fetchagreementtypes");
    console.log(response.data.data);
    if (response.status === 200) {
      const arr = response.data.data.map((row, index) => {
        return {
          index: index + 1,
          id: index,
          type_of_agreement: row.type_of_agreement,
          nature_of_agreement: row.nature_of_agreement,
        };
      });
      setRows(arr);
    }
  };

  useEffect(() => {
    getpartydetails();
  }, []);

  const submitForm = async () => {
    try {
      setLoading("select" / "fetch");
      const values = await form.validateFields();
      const response = await imsAxios.post("/agreement/addtypeofagreement", {
        type_of_agreement: values.type_of_agreement,
        nature_of_agreement: values.nature_of_agreement,
      });
      if (response.status === 200) {
        form.resetFields();
        toast.success(response.data.msg);
        getpartydetails();
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      headerName: "#",
      width: 50,
      field: "index",
    },
    {
      headerName: "Nature of Agreement",
      flex: 1,
      field: "nature_of_agreement",
    },
    {
      headerName: "Type of Agreement",
      flex: 1,
      field: "type_of_agreement",
    },
    {
      headerName: "Action",
      width: 100,
      renderCell: ({ row }) => <EditOutlined onClick={() => editRow(row)} />,
    },
  ];

  const editRow = (row) => {
    console.log(row);
  };

  const getStateOptions = async (searchTerm) => {
    setLoading("select");
    const response = await imsAxios.post("/backend/stateList", {
      search: searchTerm,
    });
    const { data } = response;
    if (data[0]) {
      let arr = data.map((row) => ({
        value: row.text,
        text: row.text,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
    setLoading(false);
  };
  const getpartyoptions = async (searchTerm) => {};

  return (
    <div>
      <Row gutter={10} span={24}>
        <Col span={8}>
          <Card>
            <Form form={form} layout="vertical">
              <Form.Item
                name="nature_of_agreement"
                label="Nature of Agreement"
                rules={rules.nature_of_agreement}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="type_of_agreement"
                label="Type of Agreement"
                rules={rules.type_of_agreement}
              >
                <Input />
              </Form.Item>
            </Form>
            <Row justify="end">
              <Col span={4}>
                <Button>Reset</Button>
              </Col>
              <Col span={4}>
                <MyButton variant="add" type="primary" onClick={submitForm}>
                  Submit
                </MyButton>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col style={{ height: "100%" }} span={16}>
          <div style={{ height: "15rem", marginTop: "20px" }}>
            <Row>
              <div style={{ height: "80vh", width: "99%", marginTop: "10px" }}>
                <MyDataTable columns={columns} data={rows} />
              </div>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default AddAgreementType;

const rules = {
  type_of_agreement: [
    {
      required: true,
      message: "Type of Agreement is required",
    },
  ],
  nature_of_agreement: [
    {
      required: true,
      message: "Nature of Agreement is required",
    },
  ],
};
