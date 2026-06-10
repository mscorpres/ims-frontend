import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import {
  Button,
  Card,
  Descriptions,
  Input,
  Result,
  Skeleton,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import MyDataTable from "../../Components/MyDataTable";
import { imsAxios } from "../../axiosInterceptor";
import TableActions from "../../Components/TableActions.jsx/TableActions";
import { useSearchParams } from "react-router-dom";

// Editable cells keep their own local input state so grid re-renders
// can never reset / steal focus from what the user is typing.
const RateCell = React.memo(({ id, initialValue, onValueChange }) => {
  const [value, setValue] = useState(initialValue ?? "");
  return (
    <Input
      value={value}
      type="number"
      placeholder="Rate"
      onChange={(e) => {
        setValue(e.target.value);
        onValueChange("rate", e.target.value, id);
      }}
    />
  );
});

const QtyCell = React.memo(({ id, disabled, onValueChange }) => {
  const [value, setValue] = useState("");
  return (
    <Input
      disabled={disabled}
      type="number"
      placeholder="Enter qty"
      value={value}
      onChange={(e) => {
        setValue(e.target.value);
        onValueChange("bom_req", e.target.value, id);
      }}
    />
  );
});

function POAnalysisEdit() {
  const [searchParams] = useSearchParams();

  const jwId = searchParams.get("jwId");
  const skuKey = searchParams.get("skuKey");
  const vendor = searchParams.get("vendor");

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [view, setView] = useState([]);
  const [mainData, setMainData] = useState([]);
  const containerRef = useRef(null);

  // Size the page to exactly fill the viewport below the app header/nav,
  // so the table stretches to the footer and the footer sits at the bottom.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const setHeight = () => {
      const top = el.getBoundingClientRect().top;
      el.style.height = `${Math.max(window.innerHeight - top, 300)}px`;
    };
    setHeight();
    window.addEventListener("resize", setHeight);
    return () => window.removeEventListener("resize", setHeight);
  }, []);

  useEffect(() => {
    if (!jwId) return;
    let ignore = false;

    const getAllData = async () => {
      setLoading(true);
      try {
        const { data } = await imsAxios.post("/jobwork/fetchJwAnlyUpdate", {
          jw_transaction: jwId,
          po_transaction: jwId,
          skucode: skuKey,
        });
        if (ignore) return;
        setView(data?.headers);

        if (data.code == 200) {
          let arr = data.data.map((row, index) => ({
            ...row,
            id: v4(),
            index: index + 1,
            rate: row.rate,
            bom_req: row.bom_req_qty,
          }));
          setMainData(arr);
        } else if (data.code == 500) {
          toast.error(data.message.msg);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    getAllData();
    return () => {
      ignore = true;
    };
  }, [jwId, skuKey]);

  const compInputHandler = useCallback((name, value, id) => {
    setMainData((prev) =>
      prev.map((row) => {
        if (row.id == id) {
          return { ...row, [name]: value };
        }
        return row;
      })
    );
  }, []);

  const reset = useCallback((i) => {
    setMainData((allDataComes) => {
      let filteredData = allDataComes.filter((row) => row.id != i);
      return filteredData.map((row, index) => ({
        ...row,
        index: index + 1,
      }));
    });
  }, []);

  const columns = useMemo(
    () => [
      { field: "index", headerName: "#", width: 50 },
      { field: "part_code", headerName: "Part Code", width: 110 },
      {
        field: "component_name",
        headerName: "Component Name",
        flex: 1,
        minWidth: 220,
      },
      {
        field: "part_status",
        headerName: "Status",
        width: 90,
        renderCell: ({ row }) =>
          row?.part_status ? (
            <Tag color={row.part_status === "Active" ? "green" : "red"}>
              {row.part_status}
            </Tag>
          ) : null,
      },
      {
        field: "part_alt",
        headerName: "Alt Part",
        width: 130,
        renderCell: ({ row }) => {
          if (
            row?.part_alt &&
            Array.isArray(row.part_alt) &&
            row.part_alt.length > 0
          ) {
            const altParts = row.part_alt
              .filter((alt) => alt.alt_component_part !== "N/A")
              .map((alt) => alt.alt_component_part)
              .join(", ");

            const altNames = row.part_alt
              .filter((alt) => alt.alt_component_name !== "N/A")
              .map((alt) => alt.alt_component_name)
              .join(", ");

            return (
              <Tooltip title={altNames}>
                <span>{altParts}</span>
              </Tooltip>
            );
          }

          const altNames = Array.isArray(row?.alt_component_part)
            ? row.alt_component_part.join(", ")
            : "";
          const altParts = Array.isArray(row?.alt_component_part)
            ? row.alt_component_part.join(", ")
            : "";

          return (
            <Tooltip title={altNames}>
              <span>{altParts}</span>
            </Tooltip>
          );
        },
      },
      { field: "bom_req_qty", headerName: "BOM Required Qty", width: 150 },
      {
        field: "rate",
        headerName: "Rate",
        width: 140,
        renderCell: ({ row }) => (
          <RateCell
            id={row.id}
            initialValue={row.rate}
            onValueChange={compInputHandler}
          />
        ),
      },
      { field: "uom", headerName: "UoM", width: 80 },
      {
        field: "bom_req",
        headerName: "Update Qty",
        width: 160,
        renderCell: ({ row }) => (
          <QtyCell
            id={row.id}
            disabled={row?.recipeStatus == "PENDING"}
            onValueChange={compInputHandler}
          />
        ),
      },
      {
        field: "Actions",
        headerName: "",
        width: 60,
        renderCell: ({ row }) => (
          <TableActions
            action="delete"
            disabled={row?.recipeStatus == "PENDING"}
            onClick={() => reset(row.id)}
            style={{ fontSize: "20px" }}
          />
        ),
      },
    ],
    [compInputHandler, reset]
  );

  const updateFun = async () => {
    let allCompArray = [];
    let allQtyArray = [];
    mainData.map((a) => allCompArray.push(a.component_key));
    mainData.map((a) => allQtyArray.push(a.bom_req ?? ""));

    setSubmitLoading(true);

    const { data } = await imsAxios.post("/jobwork/updateJwAnlyComp", {
      component: allCompArray,
      qty: allQtyArray,
      sku_trans_id: view?.jobwork_sku_id,
      trans_id: view?.jobwork_id,
      rate: mainData.map((row) => row.rate ?? 0),
      part_alt: mainData.reduce((acc, row) => {
        if (Array.isArray(row.part_alt) && row.part_alt.length > 0) {
          const validAlts = row.part_alt
            .filter((alt) => alt.alt_component_part !== "N/A")
            .map((alt) => alt.alt_component_key);
          if (validAlts.length > 0) {
            acc[row.component_key] = validAlts;
          }
        }
        return acc;
      }, {}),
    });

    setSubmitLoading(false);
    if (data.code == 200) {
      toast.success("Updated successfully");
      // Signal the PO Analysis list page (other tab) to refresh its rows.
      localStorage.setItem("poAnalysisUpdated", String(Date.now()));
      setUpdated(true);
      setTimeout(() => window.close(), 3000);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
    }
  };

  const headerItems = [
    { key: "1", label: "JW PO ID", children: view?.jobwork_id },
    { key: "2", label: "FG/SFG Name & SKU", children: view?.product_name },
    { key: "3", label: "JW PO Created By", children: view?.created_by },
    { key: "4", label: "BOM of Recipe", children: view?.subject_name },
    { key: "5", label: "Registered Date & Time", children: view?.registered_date },
    {
      key: "6",
      label: "Job ID Status",
      children: view?.jw_status ? (
        <Tag color="blue">{view.jw_status}</Tag>
      ) : null,
    },
    { key: "7", label: "FG/SFG Ord Qty", children: view?.ordered_qty },
    { key: "8", label: "FG/SFG Processed Qty", children: view?.proceed_qty },
    { key: "9", label: "Vendor", children: view?.vendor_name },
  ];

  return (
    <div
      ref={containerRef}
      style={{
        padding: "0 8px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        overflow: "hidden",
      }}
    >
      {updated ? (
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Result
            status="success"
            title="Updated Successfully"
            subTitle={`${jwId} — the PO Analysis list will refresh automatically. You can close this tab now.`}
            extra={
              <Button type="primary" onClick={() => window.close()}>
                Close Tab
              </Button>
            }
          />
        </div>
      ) : (
        <>
      <Card
        size="small"
        title={
          <span style={{ fontSize: "15px", color: "#1890ff" }}>
            {`${jwId} / ${vendor}`}
          </span>
        }
        extra={
          <Button size="small" onClick={() => window.close()}>
            Close Tab
          </Button>
        }
      >
        <Skeleton active loading={loading} paragraph={{ rows: 3 }}>
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2, md: 3 }}
            items={headerItems}
            labelStyle={{ color: "#8c8c8c", fontSize: "12px" }}
            contentStyle={{ fontWeight: 500, fontSize: "12px" }}
          />
        </Skeleton>
      </Card>

      <div style={{ flex: 1, minHeight: 0 }}>
        <MyDataTable loading={loading} columns={columns} data={mainData} />
      </div>

      <div
        style={{
          padding: "8px 8px 10px 8px",
          background: "#fff",
          borderTop: "1px solid #e8e8e8",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography.Text type="secondary">
          {mainData.length} component{mainData.length === 1 ? "" : "s"}
        </Typography.Text>
        <Button loading={submitLoading} onClick={updateFun} type="primary">
          Update
        </Button>
      </div>
        </>
      )}
    </div>
  );
}

export default POAnalysisEdit;
