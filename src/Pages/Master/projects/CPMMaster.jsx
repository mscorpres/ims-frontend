import { useEffect, useState } from "react";
import {
  Card,
  Col,
  Row,
  Typography,
  Switch,
  Modal,
} from "antd";
import ViewBomOfProject from "./ViewBomOfProject";
import { imsAxios } from "../../../axiosInterceptor";

import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import NewProjectForm from "./NewProjectForm";
import { toast } from "react-toastify";
import { downloadCSVnested2 } from "../../../Components/exportToCSV";
import TableActions, {
  CommonIcons,
} from "../../../Components/TableActions.jsx/TableActions";
import UpdateProjectModal from "./UpdateProjectModal";

function CPMMaster() {
  const [rows, setRows] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editProject, setEditProject] = useState(false);
  const [viewProject , setViewProject] = useState(false);

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
      const data = await imsAxios.put('/ppr/update/project', updatedData);
      const response = data?.data
      if (response?.success || response.code == 200) {
        toast.success( response.message || "Project updated successfully!");
        setIsModalVisible(false);
        getAllDetailFun(); // Refresh the data after successful update
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to update the project. Please try again.");
    }
  };

  const handleDownload = () => {
    downloadCSVnested2(rows, columns, "All Projects");
  };

  const disableValidateHandler = async (row,status) => {
    const payload = {
      project: row.project,
      status: status ? "1" : "0",
    };

    Modal.confirm({
      title: "Changing Project Status",
      content: `Are you sure you want to change the status of ${row.name}?`,
      okText: "Continue",
      onOk: () => disableSubmitHandler(payload),
      cancelText: "Back",
    });
  };

  const disableSubmitHandler = async (values) => {
    const response = await imsAxios.put(
      `/backend/project/status/${values.project}`,
      values
    );
      if (response?.success) {
        getAllDetailFun();
        // getDataTree();
        toast.success(response.message);
      } else {
        toast.error(response.message);
      }

  };

  const getBomList = (row) => {
    const raw = row?.bomSubject ?? row?.bom;
    if (Array.isArray(raw)) return raw;
    return raw ? [raw] : [];
  };

  const getBomName = (item) =>
    item?.display_text ??
    item?.subject_name ??
    item?.name ??
    item?.text ??
    "";

  const getRecipeType = (item) => {
    const label = String(item?.bom_type_label ?? "")
      .trim()
      .toLowerCase();
    if (label === "sfg") return "semi";
    if (label === "fg") return "default";
    return String(
      item?.bom_recipe_type ??
        item?.recipe_type ??
        item?.type ??
        item?.bom_recipe ??
        ""
    )
      .trim()
      .toLowerCase();
  };
  const isFgType = (type) => ["default", "fg", "finished"].includes(type);
  const isSfgType = (type) => ["semi", "sfg", "semi-fg", "semifg"].includes(type);
  const getFgSfgBom = (row) => {
    const list = getBomList(row);
    const fgByType = list.find((item) => isFgType(getRecipeType(item)));
    const sfgByType = list.find((item) => isSfgType(getRecipeType(item)));
    if (fgByType || sfgByType) {
      return { fg: fgByType ?? null, sfg: sfgByType ?? null };
    }
    // Backend often sends [SFG, FG] when type is missing.
    if (list.length >= 2) {
      return { fg: list[1], sfg: list[0] };
    }
    return { fg: list[0] ?? null, sfg: null };
  };

  const columns = [
    { field: "index", headerName: "Sr. No", width: 80 },
    { field: "project", headerName: "Project Id", width: 180 },
    { field: "description", headerName: "Project Name", flex: 1 },
    {field:"qty",headerName:"Quantity",width:180,flex:1},
    {
      field: "costCenterName",
      headerName: "Cost Center",
      width: 180,
      flex: 1,
      valueGetter: (_value, row) =>
        _value?.row?.costcenter?.cost_center_name  ?? "",
    },
    {
      field: "fgBomName",
      headerName: "FG BOM",
      width: 200,
      flex: 1,
      valueGetter: (_value, row) => {
        const { fg } = getFgSfgBom(_value?.row ?? row);
        return getBomName(fg) || "";
      },
    },
    {
      field: "sfgBomName",
      headerName: "SFG BOM",
      width: 200,
      flex: 1,
      valueGetter: (_value, row) => {
        const { sfg } = getFgSfgBom(_value?.row ?? row);
        return getBomName(sfg) || "";
      },
    },
    { field: "insert_dt", headerName: "Insert Date", flex: 1 },
    {
      headerName: "Status",
      field: "projectStatus",
      width: 100,
      renderCell: ({row}) => (
        <>
          {row.status === 1 ? "Active" : "InActive"}
        </>
      ),
    },
    {
      headerName: "Modify Status",
      width: 180,
      field: "status",
      type: "actions",
      renderCell: ({ row }) => (
        <Switch
          size="small"
          checked={row.status === 1}
          onChange={(e) => {
            console.log(e)
            disableValidateHandler(row,e);
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      type: "actions",
      getActions: ({ row }) => [
        // Edit icon
        <TableActions
          key={`edit-${row?.id ?? row?.project ?? ""}`}
          action="edit"
          onClick={() => {
            setIsModalVisible(true);
            setEditProject(row);
          }}
        />,
        <TableActions
          key={`view-${row?.id ?? row?.project ?? ""}`}
          action="view"
          onClick={() => {
            setIsViewModalVisible(true);
            setViewProject(row);
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
          title={"Add New Project"}
        >
          <Typography.Title
            style={{ marginBottom: 30, marginTop: 10 }}
            level={4}
          ></Typography.Title>
          {/* {editProject ? (
            <EditProjectForm
              editProject={editProject}
              setEditProject={setEditProject}
              getAllDetailFun={getAllDetailFun}
            />
          ) : ( */}
            <NewProjectForm />
          {/* )} */}
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
      <ViewBomOfProject
        show={isViewModalVisible}
        hide={() => setIsViewModalVisible(false)}
        selectedBOM={viewProject}
      />
    </Row>
  );
}

export default CPMMaster;
