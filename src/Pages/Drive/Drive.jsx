import {
  Button,
  Card,
  Col,
  Input,
  Modal,
  Row,
  Space,
  Typography,
  Upload,
} from "antd";
import { useEffect, useState } from "react";
import { imsAxios } from "../../axiosInterceptor";
import {
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import TableActions, {
  CommonIcons,
} from "../../Components/TableActions.jsx/TableActions";
import MyDataTable from "../../Components/MyDataTable";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Loading from "../../Components/Loading";
import { toast } from "react-toastify";

export default function Drive() {
  const [currentPath, setCurrentPath] = useState("/");
  const [currentDirectory, setCurrentDirectory] = useState("");
  const [currentItems, setCurrentItems] = useState([]);
  const [previosDirectory, setPreviousDirectory] = useState(null);
  const [addDirModal, setAddDirModal] = useState(false);
  const [addFileModal, setAddFileModal] = useState(false);
  const [newDirName, setNewDirName] = useState("");
  const [newFileName, setNewFileName] = useState("");
  const [newFileDescription, setNewFileDescription] = useState("");
  const [uploadFiles, setUploadFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.login);

  const openDir = (item) => {
    if (item.type === "dir") {
      setPreviousDirectory(currentDirectory);
      let str = currentPath;
      if (currentPath !== "/") {
        str = str + "/";
      }
      str = str + item.name;
      console.log(str);
      setCurrentPath(str);
      console.log(item.unique_id);
      setCurrentDirectory(item);
    }
  };
  const goBack = async () => {
    let arr = currentPath.split("/");
    arr.pop();
    let str = arr.join("/");
    if (str === "") {
      setCurrentPath("/");
    } else {
      setCurrentPath(str);
    }
    // const parent = dummyData.filter(
    //   (item) => item.unique_id === currentItems[0].parent
    // )[0].parent;
    setLoading("page");
    const response = await imsAxios.post("/drive/getSpecificDirectory", {
      id: currentDirectory.parent,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        setCurrentDirectory(data.data);
      }
    }
  };
  const getRootDirectory = async () => {
    setLoading("page");
    const response = await imsAxios.get("/drive/getRootDirectory");
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        setCurrentItems(data.data);
        // setCurrentDirectory(data.data[0].unique_id);
      }
    }
  };
  const getDirectories = async (parent) => {
    setLoading("page");
    const response = await imsAxios.post("/drive/setChildDirectories", {
      parent: parent.unique_id ?? "--",
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data.map((row, index) => ({
          ...row,
          id: row.ID,
          index: index + 1,
        }));
        setCurrentItems(arr);
      }
    }
  };
  const addDirectory = async () => {
    setLoading("submit");
    if (newDirName === "") {
      return toast.error("Please provide a deparment name");
    }
    const response = await imsAxios.post("/drive/newDirectory", {
      name: newDirName,
      parent: currentDirectory.unique_id,
    });
    setLoading(false);
    setAddDirModal(false);
    setNewDirName("");
    getDirectories(currentDirectory);
  };
  const uploadFilesHandler = async () => {
    let formData = new FormData();
    if (newFileName === "" || newFileDescription === "") {
      return toast.error("Please provide a file name and description");
    } else if (uploadFiles.length === 0) {
      return toast.error("Please provide a a file to upload");
    }
    formData.append("name", newFileName);
    formData.append("file", uploadFiles[0]);
    formData.append("parent", currentDirectory.unique_id);
    formData.append("description", newFileDescription);
    setLoading("submit");
    const data = await imsAxios.post("/drive/uploadFile", formData);
    setLoading(false);
    setAddFileModal(false);
    setNewFileName("");
    setNewFileDescription("");
    setUploadFiles([]);
    getDirectories(currentDirectory);
  };
  const props = {
    maxCount: 1,
    showUploadList: uploadFiles.length > 0,
    onRemove: (file) => {
      const index = uploadFiles.indexOf(file);
      const newFileList = uploadFiles.slice();
      newFileList.splice(index, 1);
      setUploadFiles(newFileList);
    },
    beforeUpload: (file) => {
      setUploadFiles([file]);
      return false;
    },
    uploadFiles,
  };
  const columns = [
    { headerName: "Sr.No", field: "index", flex: 1 },
    { headerName: "Name", field: "name", flex: 1 },
    { headerName: "Description", field: "description", flex: 1 },
    { headerName: "Inserted Date", field: "insert_dt", flex: 1 },
    { headerName: "Inserted Time", field: "insert_time", flex: 1 },
    {
      headerName: "Action",
      type: "actions",
      width: 100,
      getActions: ({ row }) => [
        // MIN icon
        // <TableActions
        //   action="add"
        //   disable={row.po_status == "C"}
        //   onClick={() => setMaterialInward(row.po_transaction)}
        //   label="MIN"
        // />,
        // Edit icon
        <a target="_blank" href={row.file_path}>
          <TableActions action="download" onClick={() => console.log(row)} />
        </a>,

        // VIEW Icon
      ],
    },
  ];
  useEffect(() => {
    setCurrentPath("/");
  }, []);
  useEffect(() => {
    if (currentPath === "/") {
      getRootDirectory();
      // let rootDir = dummyData[0];
      // setCurrentItems([rootDir]);
      // setCurrentDirectory("dir1");
    } else {
      // let arr = dummyData.filter((item) => item.parent === currentDirectory);
    }
  }, [currentPath]);
  useEffect(() => {
    setPreviousDirectory(currentItems[0]?.parent);
  }, [currentItems]);
  useEffect(() => {
    if (currentDirectory) {
      console.log("this is the current directory: ", currentDirectory);
      getDirectories(currentDirectory);
    }
  }, [currentDirectory]);
  useEffect(() => {
    setNewFileDescription("");
    setNewFileName("");
  }, [setAddFileModal]);
  useEffect(() => {
    setNewDirName("");
  }, [addDirModal]);
  const box = (box) => (
    <Col span={2}>
      <Card
        size="small"
        onClick={() => openDir(box)}
        style={{
          minWidth: 100,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 5,
          cursor: "pointer",
          position: "relative",
        }}
      >
        <Space>
          {box.type === "dir" && (
            <FolderOutlined style={{ position: "absolute", left: 5, top: 5 }} />
          )}
          {box.type === "file" && (
            <FileOutlined style={{ position: "absolute", left: 5, top: 5 }} />
          )}

          {box.name}
          {box.type === "file" && (
            <a href={box.file_path} target="_blank">
              <CommonIcons action="downloadButton" size="small" />
            </a>
          )}
        </Space>
      </Card>
    </Col>
  );
  return (
    <div className="App" style={{ padding: 10, paddingTop: 5, height: "90%" }}>
      {loading === "page" && <Loading />}
      <Modal
        title="New Department Name"
        open={addDirModal}
        onOk={addDirectory}
        confirmLoading={loading === "submit"}
        onCancel={() => setAddDirModal(false)}
      >
        <Typography.Text style={{ fontSize: 12 }}>
          Enter New Department Name
        </Typography.Text>
        <Input
          onChange={(e) => setNewDirName(e.target.value)}
          value={newDirName}
        />
      </Modal>
      <Modal
        title="Upload File"
        open={addFileModal}
        onOk={uploadFilesHandler}
        confirmLoading={loading === "submit"}
        onCancel={() => setAddFileModal(false)}
      >
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <Typography.Text style={{ fontSize: 12 }}>
              Enter File Name
            </Typography.Text>
            <Input
              onChange={(e) => setNewFileName(e.target.value)}
              value={newFileName}
            />
          </Col>
          <Col span={24}>
            <Typography.Text style={{ fontSize: 12 }}>
              Enter File Description
            </Typography.Text>
            <Input.TextArea
              onChange={(e) => setNewFileDescription(e.target.value)}
              rows={4}
              value={newFileDescription}
            />
          </Col>
          <Col span={24}>
            <Upload {...props}>
              <Button type="primary" icon={<UploadOutlined />}>
                Upload File
              </Button>
            </Upload>
          </Col>
        </Row>
      </Modal>
      <Row style={{ marginBottom: 10 }}>
        <Col>
          <Button disabled={currentPath === "/"} onClick={goBack}>
            Back
          </Button>

          {/* <Col>
          <Button type="text" onClick={goBack}>Add File</Button>
        </Col> */}
        </Col>
        <Col>
          <Button type="text" onClick={() => setAddDirModal(true)}>
            Add Department
          </Button>
        </Col>
        <Col>
          <Button type="text" onClick={() => setAddFileModal(true)}>
            Upload File
          </Button>
        </Col>
      </Row>
      <Row gutter={[0, 16]} style={{ height: "100%" }}>
        <Col span={24}>Current Path: {currentPath}</Col>
        <Col style={{ height: "100%" }} span={24}>
          {currentItems[0]?.type === "file" && (
            <Row style={{ height: "90%", width: "100%" }}>
              <Col span={24}>
                <MyDataTable columns={columns} rows={currentItems} />
              </Col>
            </Row>
          )}
          {currentItems[0]?.type === "dir" && (
            <Row gutter={[8, 8]}>{currentItems.map((item) => box(item))}</Row>
          )}
          {currentItems.length === 0 && (
            <Row justify="center" align="middle" style={{ height: "90%" }}>
              <Typography.Title level={4}>
                There are no files or folders in this directory...
              </Typography.Title>
            </Row>
          )}
        </Col>
      </Row>
    </div>
  );
}
