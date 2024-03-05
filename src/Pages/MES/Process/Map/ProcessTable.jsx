import React, { useState } from "react";
import MySelect from "../../../../Components/MySelect";
import FormTable2 from "../../../../Components/FormTable2";
import { Button, Form, Input, Row, Space, Typography } from "antd";
import SelectProcessModal from "./SelectProcessModal";
import { CloseOutlined } from "@ant-design/icons";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";

const ProcessTable = ({
  locationOptions,
  form,
  initialValues,
  skuBomOptions,
  skuSfgOptions,
}) => {
  const [showProcessModal, setShowProcessModal] = useState();
  const process = Form.useWatch("process");

  const handleSelectProcessClick = (fieldName) => {
    setShowProcessModal({ fieldName });
  };

  const removeSelectedProcess = (fieldName) => {
    form.setFieldValue(["process", fieldName, "process"], undefined);
  };

  const processColumn = {
    headerName: "Process",
    width: 150,
    // justify: "space-between",
    field: (row) => {
      return (
        <Row
          justify={!row.process ? "center" : "space-between"}
          align="middle"
          style={{ width: "100%", paddingLeft: 5 }}
        >
          {!row.process && (
            <Button
              type="link"
              onClick={() => handleSelectProcessClick(row.fieldName)}
            >
              Select
            </Button>
          )}

          {row.process && (
            <Typography.Text strong style={{ margin: 0, padding: 0 }}>
              <ToolTipEllipses text={row.process.name} />
            </Typography.Text>
          )}
          {row.process && (
            <Button
              size="small"
              type="link"
              onClick={() => removeSelectedProcess(row.fieldName)}
              icon={<CloseOutlined />}
            />
          )}
        </Row>
      );
    },
  };
  let updatedColumns = columns(
    skuBomOptions,
    skuSfgOptions,
    locationOptions,
    form
  );
  updatedColumns.splice(4, 0, processColumn);

  return (
    <div style={{ height: "100%" }}>
      <FormTable2
        newRow={{ ...initialValues.process[0], level: process?.length + 1 }}
        length={process?.length}
        addableRow={true}
        reverse={true}
        removableRows={true}
        nonRemovableColumns={1}
        columns={updatedColumns}
        listName="process"
        watchKeys={[]}
        nonListWatchKeys={[]}
        componentRequiredRef={[]}
        form={form}
        calculation={() => {}}

        //   rules={listRules}
      />
      <SelectProcessModal
        open={showProcessModal}
        close={() => setShowProcessModal(false)}
        form={form}
      />
    </div>
  );
};

export default ProcessTable;

const columns = (skuBomOptions, skuSfgOptions, locationOptions, form) => [
  {
    headerName: "#",
    name: "",
    width: 30,
    field: (_, index) => (
      <Typography.Text type="secondary">{index + 1}.</Typography.Text>
    ),
  },
  {
    headerName: "Is BOM Required?",
    name: "isBomRequired",
    width: 130,
    // flexStart: true,
    field: (row) => (
      <MySelect
        onChange={(value) => {
          if (value === "NO") {
            form.setFieldValue(["process", row?.fieldName, "bom"], undefined);
          }
        }}
        options={bomRequiredOptions}
      />
    ),
  },
  {
    headerName: "BOM",
    name: "bom",
    width: 200,
    flexStart: true,
    field: (row) => (
      <MySelect
        disabled={row?.isBomRequired === "NO"}
        options={skuBomOptions}
      />
    ),
  },
  {
    headerName: "SFG SKU",
    name: "sfgSku",
    minWidth: 150,
    flex: true,
    field: (row) => <MySelect options={skuSfgOptions} />,
  },

  {
    headerName: "Level",
    name: "level",
    width: 80,
    field: () => <Input />,
  },
  {
    headerName: "Process Location",
    name: "processLocation",
    width: 130,
    field: () => <MySelect options={locationOptions} />,
  },
  {
    headerName: "Pass Location",
    name: "passLocation",
    width: 130,
    field: () => <MySelect options={locationOptions} />,
  },
  {
    headerName: "Fail Location",
    name: "failLocation",
    width: 130,
    field: () => <MySelect options={locationOptions} />,
  },
  {
    headerName: "Lot Size",
    name: "lotSize",
    width: 100,
    field: (row) => <Input />,
  },
  {
    headerName: "Remark",
    name: "remark",
    width: 200,
    field: (row) => <Input />,
  },
];

const bomRequiredOptions = [
  {
    text: "Yes",
    value: "YES",
  },
  {
    text: "No",
    value: "NO",
  },
];
