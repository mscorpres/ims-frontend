import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Card } from "antd";

export default function FormTable({ columns, data, loading }) {
  return (
    <TableContainer style={{ height: "100%", border: "1px solid white", p: 0 }}>
      <Card
        size="small"
        style={{ width: "100%", height: "100%" }}
        bodyStyle={{
          padding: 0,
          height: "100%",
          width: "100%",
          overflow: "auto",
          backgroundColor: "#ffffff",
        }}
      >
        <Table
          stickyHeader
          sx={{ width: "100%", overflow: "auto" }}
          size="small"
          aria-label="a dense table"
        >
          <TableHead>
            <TableRow>
              {columns.map((row, index) => (
                <TableCell
                  sx={{
                    width: `${row.width && row.width}px !important`,
                    maxWidth: `${row.width && row.width}px !important`,
                    minWidth: `${row.width && row.width}px !important`,
                    background: "#e0f2f1",
                    padding: "0px 10px",
                    border: "none",

                    // textAlign: "center",
                  }}
                  key={index}
                  component="th"
                >
                  {row.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((row, index) => (
              <TableRow key={row?.id || index}>
                {columns.map((col, index) => (
                  <TableCell
                    key={index || col?.id}
                    size="small"
                    sx={{
                      width: `${row.width && row.width}px !important`,
                      justifyContent: "center",
                      // textAlign: "center",
                      padding: "2px 5px",

                      border: "none",
                    }}
                  >
                    {col.render
                      ? col.render({ row, rows: data })
                      : row[col.field]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </TableContainer>
    // {/* </TableContainer> */}
  );
}
