import { Drawer, Row, Col, Form } from "antd";
import useApi from "../../../../hooks/useApi";
import { getComponentOptions } from "../../../../api/general";
import { useEffect, useState } from "react";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import MyDataTable from "../../../gstreco/myDataTable";
import ToolTipEllipses from "../../../../Components/ToolTipEllipses";
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

        // console.log("arr", arr);
        setAsyncOptions(arr);
      }
    }
  };
  useEffect(() => {
    if (newComponent) {
      const newPart = {
        id: newComponent.value,
        partCode: asyncOptions.find((row) => row.value === newComponent.value)
          ?.partCode,
        partName: newComponent.label,
      };
      setNewPartCodes((curr) => [newPart, ...curr]);
    }
  }, [newComponent]);
  return (
    <Drawer
      width={600}
      title="Update Alternate Part Code"
      open={open}
      //   footer={[
      //     <Row justify="space-between">
      //       <Col span={4}></Col>
      //       <Col>
      //         <Button
      //           // loading={updateLoading}
      //           type="primary"
      //           onClick={() => updatePartCode()}
      //         >
      //           Update
      //         </Button>
      //       </Col>
      //     </Row>,
      //   ]}
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
        columns={columns}
        data={[...newPartCodes, ...addedPartCodes]}
      />
    </Drawer>
  );
};
export default AlternatePartCode;
const columns = [
  {
    headerName: "#",
    field: "id",
    width: 80,
  },
  {
    headerName: "Part Code",
    field: "partCode",
    width: 120,
  },
  {
    headerName: "Component",
    field: "partName",
    width: 350,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.partName} copy={true} />
    ),
  },
];
