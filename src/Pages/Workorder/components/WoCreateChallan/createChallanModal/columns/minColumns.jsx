import { Input } from "antd";

/* ------------------------------------------------------------------ */
/* shared cell builders                                                */
/* ------------------------------------------------------------------ */

const actionColumn = (removeRow, CommonIcons, field = "actions") => ({
  field,
  width: 40,
  renderCell: ({ row }) => (
    <CommonIcons action="removeRow" onClick={() => removeRow(row.id)} />
  ),
});

const componentNameColumn = (inputHandler) => ({
  headerName: "Component Name",
  field: "component_name",
  width: 300,
  sortable: false,
  renderCell: ({ row }) => (
    <Input
      value={row.component_name}
      onChange={(e) => inputHandler("component_name", e.target.value, row.ID)}
      disabled={row.component_name}
    />
  ),
});

// Part Code as used by the shipment MIN tables (stretch, always disabled).
const shipmentPartCodeColumn = (inputHandler) => ({
  headerName: "Part Code",
  field: "part_code",
  flex: 1,
  sortable: false,
  renderCell: ({ row }) =>
    !row.total && (
      <Input
        disabled
        onChange={(e) => inputHandler("part_code", e.target.value, row.id)}
        value={row?.part_code}
        name="part_code"
        id={row.ID}
      />
    ),
});

// Part Code as used by the component MIN tables (fixed width, self-locking).
const compPartCodeColumn = (inputHandler) => ({
  headerName: "Part Code",
  field: "part_code",
  width: 80,
  sortable: false,
  renderCell: ({ row }) => (
    <Input
      value={row.part_code}
      onChange={(e) => inputHandler("part_code", e.target.value, row.ID)}
      disabled={row.part_code}
    />
  ),
});

// Read-only MIN detail column (min_date / min_id / min_rate / min_available_qty …).
const readonlyMinColumn = (inputHandler, headerName, field) => ({
  headerName,
  field,
  flex: 1,
  sortable: false,
  renderCell: ({ row }) =>
    !row.total && (
      <Input
        disabled
        onChange={(e) => inputHandler(field, e.target.value, row.id)}
        value={row?.[field]}
        name={field}
        id={row.ID}
      />
    ),
});

const outQtyColumn = (inputHandler, { idFromUpper = false } = {}) => ({
  headerName: "Out Qty",
  field: "out_qty",
  flex: 1,
  sortable: false,
  renderCell: ({ row }) =>
    !row.total && (
      <Input
        onChange={(e) =>
          inputHandler("out_qty", e.target.value, idFromUpper ? row?.ID : row.id)
        }
        value={row?.out_qty}
        name="out_qty"
        {...(idFromUpper ? {} : { id: row.ID })}
      />
    ),
});

/* ------------------------------------------------------------------ */
/* column sets                                                         */
/* ------------------------------------------------------------------ */

export const shipmentproductMinItems = (inputHandler, removeRow, CommonIcons) => [
  actionColumn(removeRow, CommonIcons),
  componentNameColumn(inputHandler),
  shipmentPartCodeColumn(inputHandler),
  readonlyMinColumn(inputHandler, "MIN Date", "min_date"),
  readonlyMinColumn(inputHandler, "MIN Id", "min_id"),
  readonlyMinColumn(inputHandler, "MIN Rate", "min_rate"),
  outQtyColumn(inputHandler, { idFromUpper: true }),
];

export const shipmentproductWithOutMinItems = (
  inputHandler,
  removeRow,
  CommonIcons
) => [
  actionColumn(removeRow, CommonIcons),
  componentNameColumn(inputHandler),
  shipmentPartCodeColumn(inputHandler),
  readonlyMinColumn(inputHandler, "MIN Date", "min_date"),
  readonlyMinColumn(inputHandler, "MIN Id", "min_id"),
  readonlyMinColumn(inputHandler, "MIN Rate", "min_rate"),
  readonlyMinColumn(inputHandler, "MIN Available Qty", "min_available_qty"),
  outQtyColumn(inputHandler),
];

export const compMinItems = (inputHandler, removeRow, CommonIcons) => [
  actionColumn(removeRow, CommonIcons, "Action"),
  componentNameColumn(inputHandler),
  compPartCodeColumn(inputHandler),
  readonlyMinColumn(inputHandler, "MIN Rate", "min_rate"),
  readonlyMinColumn(inputHandler, "MIN Available Qty", "min_available_qty"),
  readonlyMinColumn(inputHandler, "Total Out Qty", "total_out_qty"),
  outQtyColumn(inputHandler),
];

export const compWithOutMINItems = (inputHandler, removeRow, CommonIcons) => [
  actionColumn(removeRow, CommonIcons),
  componentNameColumn(inputHandler),
  compPartCodeColumn(inputHandler),
  readonlyMinColumn(inputHandler, "MIN Date", "min_date"),
  readonlyMinColumn(inputHandler, "MIN Id", "min_id"),
  readonlyMinColumn(inputHandler, "MIN Rate", "min_rate"),
  outQtyColumn(inputHandler),
];
