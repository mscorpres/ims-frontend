import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Col, Row } from "antd";

import MaterialUpdate from "../../Modal/MaterialUpdate";

import ComponentImages from "./ComponentImages";
import { imsAxios } from "../../../../axiosInterceptor";
import AddPhoto from "./AddPhoto";
import ComponentsTable from "./ComponentsTable";

import { GridActionsCellItem } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import AddComponent from "./AddComponent.tsx";

const Material = () => {
  const [showImages, setShowImages] = useState();
  const [loading, setLoading] = useState(false);
  const [materialModal, setMaterialModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [components, setComponents] = useState([]);

  const getRows = async () => {
    setLoading("fetch");
    try {
      setComponents([]);
      const response = await imsAxios.get("/component");
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          const arr = data.data.map((row, index) => ({
            id: index + 1,
            componentName: row.c_name,
            partCode: row.c_part_no,
            key: row.component_key,
            unit: row.units_name,
          }));

          setComponents(arr);
        } else {
          toast.error(data.message.msg);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
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
            label: row.componentName,
          })
        }
      />,
    ],
  };

  return (
    <div style={{ height: "90%" }}>
      <ComponentImages setShowImages={setShowImages} showImages={showImages} />
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
            setLoading={setLoading}
            loading={loading}
          />
        </Col>
      </Row>
    </div>
  );
};

export default Material;
