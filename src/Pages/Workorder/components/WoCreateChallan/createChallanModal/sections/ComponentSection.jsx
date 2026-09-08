import { Card, Col, Skeleton } from "antd";
import FormTable2 from "../../../../../../Components/FormTable2";
import MyDataTable from "../../../../../../Components/MyDataTable";
import { CommonIcons } from "../../../../../../Components/TableActions.jsx/TableActions";
import { listRules } from "../constants";
import { componentsItems } from "../columns/componentColumns";
import { compMinItems, compWithOutMINItems } from "../columns/minColumns";

// for return challan
const ComponentSection = ({
  form,
  calculation,
  gsttype,
  location,
  setlocationlist,
  getLocationList,
  locationlist,
  minRows,
  removeRow,
  inputHandler,
  rows,
  editShipment,
  componentsLoading,
  syncOutQty,
}) => {
  const componentsTable = (
    <FormTable2
      removableRows
      nonRemovableColumns={1}
      columns={componentsItems(
        location,
        gsttype,
        getLocationList,
        setlocationlist,
        locationlist,
        syncOutQty
      )}
      listName="components"
      watchKeys={["rate", "qty", "gstRate"]}
      nonListWatchKeys={["gstType"]}
      componentRequiredRef={["rate", "qty"]}
      form={form}
      calculation={calculation}
      rules={listRules}
    />
  );

  const minTableColumns = editShipment
    ? compWithOutMINItems(inputHandler, removeRow, CommonIcons, rows, minRows)
    : compMinItems(inputHandler, removeRow, CommonIcons, rows, minRows);

  return (
    <Col span={29} style={{ height: "100%", overflow: "hidden" }}>
      <Card
        style={{
          height: "35%",
          overflowY: "scroll",
          overflowX: "scroll",
          maxHeight: "35%",
          marginTop: "20px",
        }}
      >
        {componentsLoading ? (
          <Skeleton active paragraph={{ rows: 5 }} />
        ) : (
          componentsTable
        )}
      </Card>
      <Card
        style={{
          height: "calc(100% - 290px)",
          marginTop: editShipment ? "20px" : "30px",
          overflow: "hidden",
        }}
        bodyStyle={editShipment ? undefined : { height: "100%", padding: 4 }}
      >
        <div style={{ height: "100%", width: "100%" }}>
          <MyDataTable columns={minTableColumns} data={minRows} />
        </div>
      </Card>
    </Col>
  );
};

export default ComponentSection;
