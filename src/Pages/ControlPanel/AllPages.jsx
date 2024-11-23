import React, { useEffect, useState } from "react";
import MyDataTable from "../../Components/MyDataTable";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import { Col, Row, Button, Modal, Input, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import MySelect from "../../Components/MySelect";
import ToolTipEllipses from "../../Components/ToolTipEllipses";

const AllPages = () => {
  const [rows, setRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const columns = [
    {
      headerName: "S No.",
      field: "sno",
      width: 100,
      headerClassName: "header-background",
    },
    {
      headerName: "Page Name",
      field: "name",
      width: 200,
      headerClassName: "header-background",
    },
    {
      headerName: "Project",
      field: "project",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Route Name",
      field: "routeName",
      width: 200,
      headerClassName: "header-background",
    },
    {
      headerName: "Component",
      field: "component",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Path",
      field: "path",
      width: 300,
      headerClassName: "header-background",
      renderCell: ({ row }) => <ToolTipEllipses text={row.path} />,
    },
    {
      headerName: "Module",
      field: "module",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Sub Module",
      field: "subModule",
      width: 150,
      headerClassName: "header-background",
    },
    {
      headerName: "Page ID",
      field: "id",
      width: 400,
      headerClassName: "header-background",
      renderCell: ({ row }) => <ToolTipEllipses text={row.id} copy={true} />,
    },
  ];

  const getPages = async () => {
    try {
      const response = await imsAxios.get("/user/permission/allPages");
      if (response.status == "200") {
        const arr = response.data.map((row, index) => {
          return {
            ...row,
            sno: index + 1,
          };
        });
        setRows(arr);
        toast.success("Pages fetched successfully");
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      toast.error("Something went wrong, Please contact administrator");
    }
  };

  useEffect(() => {
    getPages();
  }, []);
  return (
    <>
      <Col
        style={{
          width: "100%",
          height: "90%",
          marginTop: "1rem",
          paddingLeft: "2rem",
          paddingRight: "2rem",
        }}
      >
        <Row
          style={{
            marginBottom: "1rem",
            right: "0",
            justifyContent: "flex-end",
          }}
        >
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => {
              setIsModalOpen(true);
            }}
          >
            Add Page
          </Button>
        </Row>

        <Row
          style={{
            height: "95%",
          }}
        >
          <MyDataTable columns={columns} data={rows} />
        </Row>
      </Col>
      <AddPageModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        getRows={getPages}
      />
    </>
  );
};

export default AllPages;

const AddPageModal = ({ isModalOpen, setIsModalOpen, getRows }) => {
  const [form] = Form.useForm();

  const options = [
    {
      text: "Finance",
      value: "Finance",
    },
    {
      text: "Store",
      value: "Store",
    },
    {
      text: "Inventory",
      value: "Inventory",
    },
    {
      text: "Production",
      value: "Production",
    },
    {
      text: "HRMS",
      value: "HRMS",
    },
    {
      text: "Legal",
      value: "Legal",
    },
  ];

  const test = async () => {
    try {
      const values = await form.validateFields();

      const response = await imsAxios.post(`/user/permission/addPage`, {
        name: values.pageName,
        project: values.project,
        route: values.routeName,
        component: values.component,
        path: values.path,
        module: values.module,
        subModule: values.subModule,
      });

      if (response.status == 200) {
        form.resetFields();
        setIsModalOpen(false);
        getRows();
        toast.success(response.data);
      } else {
        toast.error(response.data);
      }
    } catch (error) {
      toast.error("Something went wrong, Please contact administrator");
    }
  };

  return (
    <Modal
      title="Add New Page"
      open={isModalOpen}
      onOk={test}
      onCancel={() => {
        setIsModalOpen(false);
      }}
    >
      <Form form={form} layout="vertical">
        <Row gutter={35}>
          <Col span={12}>
            <Form.Item
              name="pageName"
              label="Page Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="project"
              label="Project"
              rules={[{ required: true }]}
            >
              <MySelect options={options} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={35}>
          <Col span={12}>
            <Form.Item
              name="routeName"
              label="Route Name"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="component"
              label="Component"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={35}>
          <Col span={12}>
            <Form.Item
              name="module"
              label="Module"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item
              name="subModule"
              label="Sub Module"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Form.Item
            style={{ width: "90%" }}
            name="path"
            label="Path"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
        </Row>
      </Form>
    </Modal>
  );
};
