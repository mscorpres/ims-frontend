import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import {
  Button,
  Card,
  Descriptions,
  Input,
  Modal,
  Result,
  Skeleton,
  Tag,
  Typography,
} from "antd";
import { DeleteTwoTone } from "@ant-design/icons";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import { imsAxios } from "../../axiosInterceptor";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import FormTableDataGrid from "../../Components/FormTableDataGrid";
import Loading from "../../Components/Loading";
import useLoading from "../../hooks/useLoading";
import useApi from "../../hooks/useApi";
import { saveJwMAterialIssue } from "../../api/general";

// Editable cell keeps its own local input state so grid re-renders
// can never reset / steal focus from what the user is typing.
const IssueQtyCell = React.memo(({ id, onValueChange }) => {
  const [value, setValue] = useState("");
  return (
    <Input
      value={value}
      type="number"
      placeholder="0"
      onChange={(e) => {
        setValue(e.target.value);
        onValueChange("qty", e.target.value, id);
      }}
    />
  );
});

const JwIssueEdit = () => {
  const [searchParams] = useSearchParams();

  const jwId = searchParams.get("jwId");
  const skuTransId = searchParams.get("skuTransId");
  const sku = searchParams.get("sku");
  const skucode = searchParams.get("skucode");

  const [loading, setLoading] = useLoading();
  const [closeLoading, setCloseLoading] = useLoading();
  const [updated, setUpdated] = useState(false);
  const [view, setView] = useState([]);
  const [mainData, setMainData] = useState([]);
  const { executeFun, loading: loading1 } = useApi();
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

    const getFecthData = async () => {
      setLoading("fetch", true);
      try {
        const response = await imsAxios.post(
          "/jobwork/jw_material_request_list",
          {
            jw_transaction: jwId,
            po_transaction: skuTransId,
            skucode: sku,
          }
        );
        if (ignore) return;
        const { data } = response;
        if (data.code == 200) {
          data.headers.map((a) => setView(a));
          let arr = data.components.map((row, index) => {
            return {
              ...row,
              id: v4(),
              index: index + 1,
              qty: "",
            };
          });
          setMainData(arr);
        } else if (data.code == 500) {
          toast.error(data.message.msg);
        }
      } finally {
        if (!ignore) setLoading("fetch", false);
      }
    };

    getFecthData();
    return () => {
      ignore = true;
    };
  }, [jwId, skuTransId, sku]);

  const compInputHandler = useCallback((name, value, id) => {
    if (name == "qty") {
      setMainData((issueQty) =>
        issueQty.map((a) => {
          if (a.id == id) {
            return { ...a, qty: value };
          }
          return a;
        })
      );
    }
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
      {
        field: "index",
        headerName: "#",
        width: 50,
        renderCell: ({ row }) => <span>{row.index}</span>,
      },
      {
        field: "part_code",
        headerName: "Part Code",
        width: 110,
        renderCell: ({ row }) => (
          <ToolTipEllipses text={row.part_code} copy={true} />
        ),
      },
      {
        field: "component_name",
        headerName: "Component",
        flex: 1,
        minWidth: 250,
        renderCell: ({ row }) => <ToolTipEllipses text={row.component_name} />,
      },
      {
        field: "alts",
        headerName: "Alternative",
        width: 130,
        renderCell: ({ row }) => (
          <ToolTipEllipses
            text={
              row.alts_status === "ALT" && row.alts.length > 0
                ? row.alts.map((alt) => alt.alt_component_part).join(", ")
                : "--"
            }
          />
        ),
      },
      {
        field: "available_qty",
        headerName: "Available Qty",
        width: 120,
        renderCell: ({ row }) => <ToolTipEllipses text={row.available_qty} />,
      },
      {
        field: "bom_req_qty",
        headerName: "BOM Qty",
        width: 120,
        renderCell: ({ row }) => <ToolTipEllipses text={row.bom_req_qty} />,
      },
      {
        field: "pending_qty",
        headerName: "Required Qty",
        width: 120,
        renderCell: ({ row }) => <ToolTipEllipses text={row.pending_qty} />,
      },
      {
        field: "qty",
        headerName: "Issue Qty",
        width: 160,
        renderCell: ({ row }) => (
          <IssueQtyCell id={row.id} onValueChange={compInputHandler} />
        ),
      },
      {
        field: "Actions",
        headerName: "",
        width: 60,
        renderCell: ({ row }) => (
          <DeleteTwoTone
            onClick={() => {
              Modal.confirm({
                okText: "Continue",
                cancelText: "Cancel",
                title: `You are deleting (${row?.part_code}) ${row?.component_name} , Are you sure you want to continue?`,
                onOk() {
                  reset(row.id);
                },
                onCancel() {},
              });
            }}
            style={{ fontSize: "20px" }}
          />
        ),
      },
    ],
    [compInputHandler, reset]
  );

  const saveFun = async () => {
    setCloseLoading("fetch", true);
    let componentKey = [];
    let qtyArray = [];
    mainData.map((comKey) => componentKey.push(comKey.component_key));
    mainData.map((comKey) => qtyArray.push(comKey.qty ?? ""));
    let finalObj = {
      jobwork_jw_trans_id: jwId,
      jobwork_po_trans_id: skuTransId,
      component: componentKey,
      issue_qty: qtyArray,
    };
    const response = await executeFun(
      () => saveJwMAterialIssue(finalObj),
      "select"
    );
    const { data } = response;
    setCloseLoading("fetch", false);
    if (data.code == 200) {
      toast.success(data.message);
      // Signal the JW RM Issue list page (other tab) to refresh its rows.
      localStorage.setItem("jwIssueUpdated", String(Date.now()));
      setUpdated(true);
      setTimeout(() => window.close(), 1500);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
    }
  };

  const headerItems = [
    { key: "1", label: "JW PO ID", children: view?.jw_jobwork_id },
    {
      key: "2",
      label: "FG/SFG Name & SKU",
      children: `${view?.product_name ?? ""} / ${view?.sku_code ?? ""}`,
    },
    { key: "3", label: "JW PO Created By", children: view?.created_by },
    { key: "4", label: "BOM of Recipe", children: view?.subject_name },
    {
      key: "5",
      label: "Registered Date & Time",
      children: view?.registered_date,
    },
    {
      key: "6",
      label: "Job ID Status",
      children: view?.jw_status ? (
        <Tag color="blue">{view.jw_status}</Tag>
      ) : null,
    },
    { key: "7", label: "FG/SFG Ord Qty", children: view?.ordered_qty },
    { key: "8", label: "FG/SFG Processed Qty", children: view?.proceed_qty },
    { key: "9", label: "Job Worker", children: view?.vendor_name },
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
            title="Material Issued Successfully"
            subTitle={`${jwId} — the JW RM Issue list will refresh automatically. You can close this tab now.`}
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
            {`FG/SFG: ${skucode} | JW ID: ${jwId}`}
          </span>
        }
        extra={
          <Button size="small" onClick={() => window.close()}>
            Close Tab
          </Button>
        }
      >
        <Skeleton active loading={loading("fetch")} paragraph={{ rows: 3 }}>
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
        {loading1("select") && <Loading />}
        {!loading("fetch") && mainData.length > 0 ? (
          <FormTableDataGrid
            loading={loading("fetch") || loading1("select")}
            columns={columns}
            data={mainData}
          />
        ) : (
          <Loading />
        )}
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
        <Button
          loading={closeLoading("fetch")}
          type="primary"
          onClick={saveFun}
        >
          Save
        </Button>
      </div>
        </>
      )}
    </div>
  );
};

export default JwIssueEdit;
