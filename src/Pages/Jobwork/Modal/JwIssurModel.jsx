import { useState, useEffect } from "react";
import { Button, Col, Drawer, Input, Row, Skeleton, Space, Modal } from "antd";
import { CloseCircleFilled, DeleteTwoTone } from "@ant-design/icons";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import FormTableDataGrid from "../../../Components/FormTableDataGrid";
import useLoading from "../../../hooks/useLoading";
import { saveJwMAterialIssue } from "../../../api/general";
import useApi from "../../../hooks/useApi";
import Loading from "../../../Components/Loading";

const JwIssurModel = ({ openModal, setOpenModal, datewiseFetchData }) => {
  const [loading, setLoading] = useLoading();
  const [closeLoading, setCloseLoading] = useLoading();
  const [view, setView] = useState([]);
  const [mainData, setMainData] = useState([]);
  const { executeFun, loading: loading1 } = useApi();

  const getFecthData = async () => {
    setLoading("fetch", true);
    const response = await imsAxios.post("/jobwork/jw_material_request_list", {
      jw_transaction: openModal.jw_transaction_id,
      po_transaction: openModal.sku_transaction_id,
      skucode: openModal.sku,
    });
    setLoading("fetch", false);
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
      setOpenModal(false);
    }
  };

  const compInputHandler = async (name, value, id) => {
    if (name == "qty") {
      setMainData((issueQty) =>
        issueQty.map((a) => {
          if (a.id == id) {
            {
              return { ...a, qty: value };
            }
          } else {
            return a;
          }
        })
      );
    }
  };

  const columns = [
    {
      field: "index",
      headerName: "S No.",
      width: 80,
      renderCell: ({ row }) => <span>{row.index}</span>,
    },
    {
      field: "part_code",
      headerName: "Part Code",
      width: 120,
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.part_code} copy={true} />
      ),
    },
    {
      field: "component_name",
      headerName: "Component",
      width: 700,
      renderCell: ({ row }) => <ToolTipEllipses text={row.component_name} />,
    },
    {
      field: "available_qty",
      headerName: "Available Qty",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.available_qty} />,
    },
    {
      field: "bom_req_qty",
      headerName: "BOM Qty",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.bom_req_qty} />,
    },
    {
      field: "pending_qty",
      headerName: "Required Qty",
      width: 150,
      renderCell: ({ row }) => <ToolTipEllipses text={row.pending_qty} />,
    },
    {
      field: "qty",
      headerName: "Issue Qty",
      width: 180,
      renderCell: ({ row }) => (
        <Input
          value={row.qty}
          type="number"
          placeholder="0"
          onChange={(e) => compInputHandler("qty", e.target.value, row.id)}
        />
      ),
    },
    {
      field: "Actions",
      headerName: "Actions",
      width: 200,
      renderCell: ({ row }) => (
        <>
          <DeleteTwoTone
            onClick={() => {
              Modal.confirm({
                okText: "Continue",
                cancelText: "Cancel",
                title:
                  `You are deleting (${row?.part_code}) ${row?.component_name} , Are you sure you want to continue?`,
                onOk() {
                  reset(row.id);
                },
                onCancel() {
                  // setEditingVBT(null);
                },
              });
              
            }}
            style={{ fontSize: "20px", marginLeft: "10px" }}
          />
        </>
      ),
    },
  ];

  const saveFun = async () => {
    setCloseLoading("fetch", true);
    let componentKey = [];
    let qtyArray = [];
    mainData.map((comKey) => componentKey.push(comKey.component_key));
    mainData.map((comKey) => qtyArray.push(comKey.qty ?? ""));
    let finalObj = {
      jobwork_jw_trans_id: openModal.jw_transaction_id,
      jobwork_po_trans_id: openModal.sku_transaction_id,
      component: componentKey,
      issue_qty: qtyArray,
    };
    // const response = await imsAxios.post("/jobwork/save_jw_material_issue");
    const response = await executeFun(
      () => saveJwMAterialIssue(finalObj),
      "select"
    );
    const { data } = response;
    setCloseLoading("fetch", false);
    if (data.code == 200) {
      setOpenModal(false);
      toast.success(data.message);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
    }
    console.log(data);
  };

  const reset = (i) => {
    setMainData((allDataComes) => {
      return allDataComes.filter((row) => row.id != i);
    });
  };
  const cancel = () => {
    setMainData([]);
    setOpenModal(false);
  };
  useEffect(() => {
    if (openModal) {
      getFecthData();
    }
  }, [openModal]);
  return (
    <Space>
      <Drawer
        width="100vw"
        title={`FG/SFG:${openModal.skucode} |  JW ID:${openModal.jw_transaction_id}`}
        placement="right"
        closable={false}
        onClose={cancel}
        open={openModal}
        getContainer={false}
        style={{
          position: "absolute",
        }}
        extra={
          <Space>
            <CloseCircleFilled onClick={cancel} />
          </Space>
        }
      >
        <Skeleton active loading={loading("fetch")}>
          <Row
            gutter={10}
            style={{ border: "1px solid grey", padding: "10px" }}
          >
            <Col span={8} style={{ fontWeight: "bolder", fontSize: "12px" }}>
              JW OP Id:{view.jw_jobwork_id}
            </Col>
            <Col span={8} style={{ fontWeight: "bolder", fontSize: "12px" }}>
              Jobwork ID:{view.jw_jobwork_id}
            </Col>
            <Col span={8} style={{ fontWeight: "bolder", fontSize: "12px" }}>
              FG/SFG Name & SKU:{`${view.product_name}/ ${view.sku_code}`}
            </Col>
            <Col span={8} style={{ fontWeight: "bolder", fontSize: "12px" }}>
              JW PO created by:{view.created_by}
            </Col>
            <Col span={8} style={{ fontWeight: "bolder", fontSize: "12px" }}>
              FG/SFG BOM of Recipe:{view.subject_name}
            </Col>
            <Col span={8} style={{ fontWeight: "bolder", fontSize: "12px" }}>
              Regisered Date & Time:{view.registered_date}
            </Col>
            <Col span={8} style={{ fontWeight: "bolder", fontSize: "12px" }}>
              FG/SFG Ord Qty:{view.ordered_qty}
            </Col>
            <Col span={8} style={{ fontWeight: "bolder", fontSize: "12px" }}>
              Job ID Status:{view.jw_status}
            </Col>
            <Col span={8} style={{ fontWeight: "bolder", fontSize: "12px" }}>
              FG/SFG processed Qty:{view.proceed_qty}
            </Col>
            <Col span={8} style={{ fontWeight: "bolder", fontSize: "12px" }}>
              Job Worker :{view.vendor_name}
            </Col>
          </Row>

          <div style={{ height: "70%", marginTop: "20px" }}>
            <div style={{ height: "100%" }}>
              {" "}
              {loading1("select") && <Loading />}
              <FormTableDataGrid
                loading={loading("fetch")}
                columns={columns}
                data={mainData}
              />
            </div>
          </div>
          <Row>
            <Col span={24}>
              <div style={{ textAlign: "end", marginTop: "40px" }}>
                <Button
                  loading={closeLoading("fetch")}
                  type="primary"
                  onClick={saveFun}
                >
                  Save
                </Button>
              </div>
            </Col>
          </Row>
        </Skeleton>
      </Drawer>
    </Space>
  );
};

export default JwIssurModel;
