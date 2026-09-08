import { Card, Col } from "antd";
import FormTable2 from "../../../../../../Components/FormTable2";
import MyDataTable from "../../../../../../Components/MyDataTable";
import { CommonIcons } from "../../../../../../Components/TableActions.jsx/TableActions";
import { listRules } from "../constants";
import {
  shipmentproductItems,
  shipmentproductItemsEdit,
} from "../columns/shipmentProductColumns";
import {
  shipmentproductMinItems,
  shipmentproductWithOutMinItems,
} from "../columns/minColumns";

const ProductSection = ({
  form,
  calculation,
  location,
  gsttype,
  setlocationlist,
  getLocationList,
  locationlist,
  getComponentOptions,
  asyncOptions,
  setAsyncOptions,
  getComponentDetails,
  editShipment,
  inputHandler,
  rows,
  minRows,
  removeRow,
}) => {
  const productColumns = editShipment
    ? shipmentproductItemsEdit(
        location,
        gsttype,
        getLocationList,
        setlocationlist,
        locationlist,
        getComponentOptions,
        asyncOptions,
        setAsyncOptions,
        getComponentDetails
      )
    : shipmentproductItems(
        location,
        gsttype,
        getLocationList,
        setlocationlist,
        locationlist,
        getComponentOptions,
        asyncOptions,
        setAsyncOptions,
        getComponentDetails
      );

  const minColumns = editShipment
    ? shipmentproductMinItems(inputHandler, removeRow, CommonIcons, rows, minRows)
    : shipmentproductWithOutMinItems(
        inputHandler,
        removeRow,
        CommonIcons,
        rows,
        minRows
      );

  return (
    <Col span={29} style={{ height: "100%", overflow: "hidden" }}>
      <Card>
        <FormTable2
          nonRemovableColumns={1}
          columns={productColumns}
          listName="components"
          watchKeys={["rate", "qty", "gstRate"]}
          nonListWatchKeys={["gstType"]}
          componentRequiredRef={["rate", "qty"]}
          form={form}
          calculation={calculation}
          {...(editShipment ? { rules: listRules } : {})}
        />
      </Card>
      <Card
        style={
          editShipment
            ? {
                height: "80%",
                maxHeight: "73%",
                marginTop: "20px",
                overflow: "hidden",
              }
            : {
                height: "calc(100% - 200px)",
                marginTop: "20px",
                overflow: "hidden",
              }
        }
        bodyStyle={{ height: "100%", padding: 4 }}
      >
        <div style={{ height: "100%", width: "100%" }}>
          <MyDataTable columns={minColumns} data={minRows} />
        </div>
      </Card>
    </Col>
  );
};

export default ProductSection;
