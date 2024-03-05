import React from "react";
import { downloadCSV } from "../../../Components/exportToCSV";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";

const DownloadButton = ({ rows, total, componentLabel }) => {
  const columns = [
    {
      headerName: "Location",
      field: "loc_name",
    },
    {
      headerName: "Qty",
      field: "closing",
    },
  ];

  const handleDownload = () => {
    const arr = [
      ...rows,

      {
        loc_name: "Total",
        closing: total,
      },
      {
        loc_name: componentLabel,
        closing: "",
      },
    ];
    downloadCSV(arr, columns, "Q5");
  };
  return (
    <CommonIcons
      type="primary"
      action="downloadButton"
      onClick={() => handleDownload()}
      disabled={rows.length == 0}
    />
  );
};

export default DownloadButton;
