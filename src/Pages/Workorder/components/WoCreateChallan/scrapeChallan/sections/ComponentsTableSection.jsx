import { Card, Col } from "antd";
import FormTable2 from "../../../../../../Components/FormTable2";
import { defaultValues, listRules } from "../constants";
import { scrapeChallanColumns } from "../scrapeChallanColumns";

const ComponentsTableSection = ({
  challanForm,
  calculation,
  asyncOptions,
  setAsyncOptions,
  handleFetchComponentOptions,
  handleFetchComponentDetails,
}) => (
  <Col span={18}>
    <Card style={{ height: "10rem" }}>
      <FormTable2
        removableRows
        nonRemovableColumns={1}
        columns={scrapeChallanColumns({
          asyncOptions,
          setAsyncOptions,
          handleFetchComponentOptions,
          handleFetchComponentDetails,
        })}
        listName="components"
        watchKeys={["rate", "qty", "gstRate"]}
        nonListWatchKeys={["gstType"]}
        componentRequiredRef={["rate", "qty"]}
        form={challanForm}
        calculation={calculation}
        rules={listRules}
        addableRow
        reverse
        newRow={defaultValues.components[0]}
      />
    </Card>
  </Col>
);

export default ComponentsTableSection;
