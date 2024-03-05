import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import "primereact/resources/themes/lara-light-cyan/theme.css";

const rows = [
  {
    name: "Devesh",
    lastName: "Singh",
    age: 24,
    proffession: "Web Developer",
  },
  {
    name: "Daniel",
    lastName: "Jones",
    age: 20,
    proffession: "Imposter",
  },
  {
    name: "May",
    lastName: "June",
    age: 24,
    proffession: "Nothing",
  },
];

const columns = [
  {
    headerName: "Name",
    field: "name",
  },
  {
    headerName: "Last Name",
    field: "lastName",
  },
  {
    headerName: "Age",
    field: "age",
  },
  {
    headerName: "Proffession",
    field: "proffession",
  },
];

const MyDataTable1 = () => {
  return (
    <DataTable
      value={rows}
      tableStyle={{ minWidth: "100%" }}
      filterDisplay="row"
      globalFilterFields={["name"]}
    >
      {columns.map((column, index) => (
        <Column
          filter
          filterPlaceholder="Search by name"
          field={column.field}
          header={column.headerName}
        />
      ))}
    </DataTable>
  );
};

export default MyDataTable1;
