import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Typography,
} from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import NavFooter from "../../../Components/NavFooter";
import validateResponse from "../../../Components/validateResponse";
import Loading from "../../../Components/Loading";
import { imsAxios } from "../../../axiosInterceptor";

import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import NewProjectForm from "./NewProjectForm";
import { toast } from "react-toastify";
import { downloadCSV } from "../../../Components/exportToCSV";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import EditProjectForm from "./EditProjectForm";
import UpdateProjectModal from "./UpdateProjectModal";

function CPMMaster() {
  const [rows, setRows] = useState([]);
  // const [asyncOptions, setAsyncOptions] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editProject, setEditProject] = useState(false);

  const getAllDetailFun = async () => {
    setLoading("table");
    const response = await imsAxios.post("/ppr/allProjects");
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row, index) => {
          return {
            ...row,
            id: v4(),
            index: index + 1,
          };
        });
        setRows(arr);
      } else {
        toast.error(data.message.msg);
      }
    }
  };

  const handleSubmit = async (updatedData) => {
    try {
      const response = await imsAxios.put('/ppr/update/project', updatedData);
      if (response.data.code === 200) {
        toast.success("Project updated successfully!");
        setIsModalVisible(false);
        getAllDetailFun(); // Refresh the data after successful update
      } else {
        toast.error(response.data.message.msg);
      }
    } catch (error) {
      toast.error("Failed to update the project. Please try again.");
    }
  };

  const handleDownload = () => {
    downloadCSV(rows, columns, "All Projects");
  };
  const columns = [
    { field: "index", headerName: "Sr. No", width: 80 },
    { field: "project", headerName: "Project Id", width: 180 },
    { field: "description", headerName: "Project Name", flex: 1 },
    { field: "insert_dt", headerName: "Insert Date", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      type: "actions",
      getActions: ({ row }) => [
        // Edit icon
        <TableActions
          action="edit"
          onClick={() => {
            setIsModalVisible(true);
            setEditProject(row);
          }}
        />,
      ],
    },
  ];

  useEffect(() => {
    getAllDetailFun();
  }, []);
  return (
    <Row gutter={10} style={{ height: "90%", padding: 10 }}>
      <Col span={6}>
        <Card
          size="small"
          style={{ marginTop: "8%" }}
          title={editProject ? "Edit Project" : "Add New Project"}
        >
          <Typography.Title
            style={{ marginBottom: 30, marginTop: 10 }}
            level={4}
          ></Typography.Title>
          {editProject ? (
            <EditProjectForm
              editProject={editProject}
              setEditProject={setEditProject}
              getAllDetailFun={getAllDetailFun}
            />
          ) : (
            <NewProjectForm />
          )}
        </Card>
      </Col>
      <Col style={{ height: "95%" }} span={18}>
        <Row justify="end" style={{ margin: "5x 0" }}>
          <CommonIcons
            disabled={rows.length === 0}
            onClick={handleDownload}
            action="downloadButton"
          />
        </Row>
        <MyDataTable
          data={rows}
          columns={columns}
          loading={loading === "table"}
        />
      </Col>
      {/* <NavFooter
        submithtmlType="submit"
        submitButton={true}
        formName="edit-project"
        nextLabel="Submit"
        resetFunction={resetFunction}
      /> */}
      <UpdateProjectModal
        data={editProject}
        setIsModalVisible={setIsModalVisible}
        isModalVisible={isModalVisible}
        onUpdate={handleSubmit}
      />
    </Row>
  );
}

export default CPMMaster;
