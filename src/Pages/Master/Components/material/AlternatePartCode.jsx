import { Drawer, Row, Col, Form, Button } from "antd";
import useApi from "../../../../hooks/useApi";
import {
  getComponentOptions,
  updateAlternatePartCode,
} from "../../../../api/general";
import { useEffect, useState } from "react";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MyDataTable from "../../../gstreco/myDataTable";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
import { imsAxios } from "../../../../axiosInterceptor";
import { getAlternativePartCodes } from "../../../../api/master/component";
import TableActions from "../../../../Components/TableActions.jsx/TableActions";

const AlternatePartCode = ({ open, hide }) => {
  const [addedPartCodes, setAddedPartCodes] = useState([]);
  const [newPartCodes, setNewPartCodes] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);

  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();
  const newComponent = Form.useWatch("component", form);

  const handleFetchComponentOptions = async (searchTerm) => {
    const response = await executeFun(
      () => getComponentOptions(searchTerm, true),
      "select"
    );
    let { data } = response;
    if (data) {
      if (data[0]) {
        let arr = data.map((row) => ({
          text: row.text,
          value: row.id,
          partCode: row.newPart,
        }));

        setAsyncOptions(arr);
      }
    }
  };

  const handleFetchAlternates = async (componentKey) => {
    const response = await executeFun(
      () => getAlternativePartCodes(componentKey),
      "fetch"
    );
    setAddedPartCodes(response.data);
  };

  const handleDelete = (addedComponent) => {
    if (!addedComponent.added) {
      setNewPartCodes((curr) =>
        curr.filter((row) => row.id !== addedComponent.id)
      );
    } else {
      setAddedPartCodes((curr) =>
        curr.filter((row) => row.id !== addedComponent.id)
      );
    }
  };

  const handleUpdateAlternatives = async () => {
    const arr = [...addedPartCodes, ...newPartCodes].map(
      (row) => row.componentKey
    );
    const response = await executeFun(
      () => updateAlternatePartCode(arr, open),
      "select"
    );
    // if (response.success) {
    // setAlternatePartModal(false);
    // }
    // const partCodes = altPartCodeForm.getFieldsValue("partCode");
    // console.log("partCodes", partCodes);
    // updateAlternatePartCode
  };

  const actionColumn = {
    headerName: "",
    field: "actions",
    width: 100,
    type: "actions",
    getActions: ({ row }) => [
      <TableActions action="delete" onClick={() => handleDelete(row)} />,
    ],
  };
  useEffect(() => {
    if (newComponent) {
      const newPart = {
        id: newComponent.value,
        partCode: asyncOptions.find((row) => row.value === newComponent.value)
          ?.partCode,
        component: newComponent.label,
        componentKey: newComponent.value,
      };
      setNewPartCodes((curr) => [newPart, ...curr]);
    }
  }, [newComponent]);

  useEffect(() => {
    if (open) {
      handleFetchAlternates(open);
    }
  }, [open]);

  console.log("this is the component key", open);
  return (
    <Drawer
      width={600}
      destroyOnClose={true}
      title="Update Similar Part Code"
      open={open}
      footer={[
        <Row justify="end">
          <Col>
            <Button
              // loading={updateLoading}
              type="primary"
              onClick={handleUpdateAlternatives}
            >
              Update
            </Button>
          </Col>
        </Row>,
      ]}
      // confirmLoading={confirmLoading}
      onClose={hide}
    >
      {/* {modalLoading && <Loading />} */}
      <Form form={form} layout="vertical">
        <Row>
          {/* components select */}
          <Col span={24}>
            <Form.Item label="Select Components" name="component">
              <MyAsyncSelect
                optionsState={asyncOptions}
                onBlur={() => setAsyncOptions([])}
                // mode="multiple"
                labelInValue
                selectLoading={loading("select")}
                loadOptions={handleFetchComponentOptions}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
      <MyDataTable
        columns={[...columns, actionColumn]}
        data={[...newPartCodes, ...addedPartCodes]}
      />
    </Drawer>
  );
};
export default AlternatePartCode;
const columns = [
  {
    headerName: "Part Code",
    field: "partCode",
    width: 80,
  },
  {
    headerName: "Component",
    field: "component",
    width: 350,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.component} copy={true} />
    ),
  },
  {
    headerName: "",
    field: "added",
    width: 50,
    renderCell: ({ row }) =>
      row.added && (
        <div
          style={{
            width: 10,
            height: 10,
            background: "#047780",
            borderRadius: "100%",
          }}
        ></div>
      ),
  },
];
