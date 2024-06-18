import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Col, Modal, Row, Typography } from "antd";

import MaterialUpdate from "../../Modal/MaterialUpdate.jsx";

import ComponentImages from "./ComponentImages.jsx";

import AddPhoto from "./AddPhoto.jsx";
import ComponentsTable from "./ComponentsTable.jsx";

import { GridActionsCellItem } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import AddComponent from "./AddComponent.tsx";
import { useSelector } from "react-redux";
import useApi from "@/hooks/useApi";
import { approve, getComponentList } from "@/api/master/component.js";
import { ModalType } from "@/types/general.js";

const Material = () => {
  const [showImages, setShowImages] = useState();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [materialModal, setMaterialModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);

  const { user } = useSelector((state) => state.login);
  const { executeFun, loading } = useApi();

  const getRows = async () => {
    setComponents([]);
    const response = await executeFun(
      () => getComponentList(user?.id),
      "fetch"
    );

    setComponents(response.data);
  };

  const handleApprove = async () => {
    if (selectedComponent) {
      const response = await executeFun(
        () => approve(selectedComponent.key),
        "approve"
      );
      if (response.success) {
        setShowApproveModal(false);
        setSelectedComponent(null);
        getRows();
      }
    }
  };
  useEffect(() => {
    getRows();
  }, []);

  const actionColumn = {
    field: "actions",
    headerName: "",
    width: 30,
    type: "actions",
    getActions: ({ row }) => [
      <GridActionsCellItem
        showInMenu
        label={
          <Link
            style={{
              textDecoration: "none",
              color: "black",
            }}
            to={`/master/component/${row.key}`}
            target="_blank"
          >
            Update
          </Link>
        }
      />,
      <GridActionsCellItem
        showInMenu
        label="View Images"
        onClick={() =>
          setShowImages({
            partNumber: row.key,
            partCode: row.partCode,
          })
        }
      />,
      <GridActionsCellItem
        showInMenu
        label="Upload Images"
        onClick={() =>
          setUploadingImage({
            key: row.key,
            label: row.name,
          })
        }
      />,
      <GridActionsCellItem
        showInMenu
        disabled={!row.isApprover || row.isApproved}
        // hidden={true}
        label="Approve Component"
        onClick={() => {
          setSelectedComponent(row);
          setShowApproveModal(true);
        }}
      />,
    ],
  };

  return (
    <div style={{ height: "90%" }}>
      <ComponentImages setShowImages={setShowImages} showImages={showImages} />
      <ApproveModal
        show={showApproveModal}
        hide={() => setShowApproveModal(false)}
        submitHandler={handleApprove}
        loading={loading("approve")}
      />
      <AddPhoto
        updatingImage={uploadingImage}
        setUpdatingImage={setUploadingImage}
      />
      <MaterialUpdate
        materialModal={materialModal}
        setMaterialModal={setMaterialModal}
      />

      <Row gutter={[6, 6]} style={{ height: "100%", padding: "10px" }}>
        <Col
          span={8}
          style={{ height: "100%", overflow: "auto", overflowX: "hidden" }}
        >
          <AddComponent />
        </Col>
        <Col span={16} style={{ height: "100%" }}>
          <ComponentsTable
            actionColumn={actionColumn}
            getRows={getRows}
            components={components}
            setComponents={setComponents}
            loading={loading("fetch")}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Material;

interface ApproveModalType extends ModalType {}
const ApproveModal = ({
  show,
  hide,
  submitHandler,
  loading,
}: ApproveModalType) => {
  return (
    <Modal
      open={show}
      onCancel={hide}
      onOk={submitHandler}
      confirmLoading={loading}
      okText="Approve"
    >
      <Typography.Text strong>
        Are you sure you want to approve this component?
      </Typography.Text>
    </Modal>
  );
};
