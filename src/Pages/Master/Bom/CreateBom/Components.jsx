import React from "react";
import FormTable2 from "../../../../Components/FormTable2";
import { Input, Typography } from "antd";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";

const Components = ({
  asyncOptions,
  setAsyncOptions,
  getComponentOptions,
  loading,
  selectLoading,
  form,
}) => {
  const calculation = (fieldName, watchValues) => {};
  const ComponentSelect = (
    <MyAsyncSelect
      optionsState={asyncOptions}
      onBlur={() => setAsyncOptions([])}
      loadOptions={getComponentOptions}
      selectLoading={loading}
      labelInValue
    />
  );

  const componentColumn = {
    headerName: "Components",
    name: "component",
    width: 250,
    flex: true,
    field: () => ComponentSelect,
  };
  let columns = componentsItems();
  columns.splice(1, 0, componentColumn);

  return (
    <FormTable2
      removableRows={true}
      addableRow={true}
      nonRemovableColumns={1}
      //   columns={componentsItems().splice(2, 0, componentColumn)}
      columns={columns}
      listName="components"
      watchKeys={watchKeys}
      nonListWatchKeys={[]}
      componentRequiredRef={[]}
      form={form}
      calculation={calculation}
    />
  );
};

export default Components;

const watchKeys = ["component"];

const componentsItems = () => [
  {
    headerName: "#",
    name: "",
    width: 30,
    field: (_, index) => (
      <Typography.Text type="secondary">{index + 1}.</Typography.Text>
    ),
  },

  {
    headerName: "Qty",
    name: "qty",
    width: 250,
    flex: true,
    field: () => <Input />,
  },
];
