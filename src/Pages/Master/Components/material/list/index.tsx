import ToolTipEllipses from "@/Components/ToolTipEllipses";
import MyDataTable from "@/Components/MyDataTable";
import { useState } from "react";
import { Flex, Switch } from "antd";

export default function List({ actionColumn, components, loading }) {
  const [showRejected, setShowRejected] = useState(false);
  console.log("this is the components", components);
  const [includeDisabled, setIncludeDisabled] = useState(false);
  return (
    <Flex vertical style={{ height: "100%" }}>
      <Flex gap={20} justify="flex-end" style={{ marginBottom: 10 }}>
        <Flex align="middle" gap={5}>
          <label style={{ fontSize: 13 }} htmlFor="showRejected">
            Show Rejected
          </label>
          <Switch
            id="showRejected"
            checked={showRejected}
            onChange={setShowRejected}
          />
        </Flex>

        <Flex align="middle" gap={5}>
          <label style={{ fontSize: 13 }} htmlFor="includeDisabled">
            Include Disabled
          </label>
          <Switch
            id="includeDisabled"
            checked={showRejected ? true : includeDisabled}
            onChange={setIncludeDisabled}
            disabled={showRejected}
          />
        </Flex>
      </Flex>
      <Flex style={{ height: "100%" }}>
        <MyDataTable
          loading={loading}
          // data={components}
          data={filteredCompnents(components, showRejected, includeDisabled)}
          columns={[actionColumn, ...columns]}
        />
      </Flex>
    </Flex>
  );
}

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Part Code",
    field: "partCode",
    width: 120,
  },
  {
    headerName: "Name",
    field: "name",
    minWidth: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
    flex: 1,
  },
  {
    headerName: "Is Approved?",
    field: "isApproved",
    width: 100,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.isApproved ? "Yes" : "No"} />
    ),
  },
  {
    headerName: "Is Enabled?",
    field: "isEnabled",
    width: 100,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.isEnabled ? "Yes" : "No"} />
    ),
  },

  {
    headerName: "UoM",
    field: "unit",
    width: 120,
  },
];

const filteredCompnents = (components, showRejected, includeDisabled) => {
  let arr = components;

  return arr
    .filter((row) => (showRejected ? !row.isApproved : row.isApproved))
    .filter((row) =>
      showRejected ? row : includeDisabled ? row : row.isEnabled
    );
};
