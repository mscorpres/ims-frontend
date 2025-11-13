import React, { useState } from "react";
import { Button, Card, Col, Drawer, Row, Space, Input, Timeline, message } from "antd";
import MyDataTable from "../../../../Components/MyDataTable";
import printFunction, {
  downloadFunction,
} from "../../../../Components/printFunction";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
import { imsAxios } from "../../../../axiosInterceptor";

export default function ViewComponentReqSidebar({
  showViewSidebar,
  setShowViewSideBar,
  componentData,
  getPoLogs,
  setnewPoLogs,
  newPoLogs,
}) {
  console.log("po newPoLogs", newPoLogs);
  
  const [loading, setLoading] = useState(null);

  const [remarks, setRemarks] = useState({});
 
  const [actionLoading, setActionLoading] = useState(null);

  const printFun = async () => {
    setLoading("print");
    const { data } = await imsAxios.post("/poPrint", {
      poid: componentData?.poid,
    });

    printFunction(data.data.buffer.data);
    setLoading(null);
  };

  const handleDownload = async () => {
    setLoading("download");
    const { data } = await imsAxios.post("/poPrint", {
      poid: componentData?.poid,
    });
    setLoading(null);
    let filename = `PO ${componentData?.poid}`;
    downloadFunction(data.data.buffer.data, filename);
  };


  const handleRemarkChange = (componentKey, value) => {
    setRemarks(prev => ({
      ...prev,
      [componentKey]: value
    }));
  };


  const handleStatusUpdate = async (status) => {
   
    try {
     
      setActionLoading(status === "A" ? "approve" : "reject");

    
      const components = componentData?.components?.map(row => ({
        component_key: row.componentID, 
        status: status,
        remark: remarks[row.componentID] || "" 
      }));

    
      const response = await imsAxios.post("/purchaseOrder/updatePOComponentStatus", {
        po_transaction: componentData?.poid,
        components: components
      });

    
      if (response.data.code === 200) {
        message.success(
          status === "A" 
            ? "Components approved successfully!" 
            : "Components rejected successfully!"
        );
        
       
        setShowViewSideBar(null);
        
      
        setRemarks({});
      } else {
        message.error(response.data.message?.msg || "Failed to update status");
      }

    } catch (error) {
      console.error("Error updating component status:", error);
      message.error("An error occurred while updating status");
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      headerName: "SR. No",
      field: "po_transaction",
      valueGetter: ({ row }) => {
        return `${componentData?.components?.indexOf(row) + 1}`;
      },
      width: 80,
      id: "Sr. No",
    },
    {
      headerName: "Component Name / Part No.",
      field: "componentID",
      valueGetter: ({ row }) => {
        return `${row.po_components} / ${row.componentID}`;
      },
      id: "po_components",
      flex: 1,
    },
    {
      headerName: "Ordered Qty",
      field: "ordered_qty",
      id: "ordered_qty",
      width: 120,
    },
    {
      headerName: "Ordered Rate",
      field: "rate",
      id: "rate",
      width: 120,
    },
    {
      headerName: "Last Purchased Rate",
      field: "last_purchase_rate",
      id: "last_purchase_rate",
      width: 120,
    },
    {
      headerName: "Tolerance",
      field: "tolerance",
      id: "tolerance",
      width: 120,
    },

  
    {
      headerName: "Remark",
      field: "remark",
      id: "remark",
      flex: 1,
      renderCell: ({ row }) => (
        <Input.TextArea
          placeholder="Enter remark (optional)"
          value={remarks[row.componentID] || ""}
          onChange={(e) => handleRemarkChange(row.componentID, e.target.value)}
          rows={2}
          style={{ width: "100%" }}
        />
      ),
    },
  ];

  console.log(componentData);

  return (
    <Drawer
      bodyStyle={{ padding: 5 }}
      title={
        <>
          <span
            style={{
              color: componentData?.status == "C" && "red",
            }}
          >
            {componentData?.poid}
          </span>
          <span> / </span>
          <span>
            {componentData?.components?.length} Item
            {componentData?.components?.length > 1 ? "s" : ""}
          </span>
        </>
      }
      width="100vw"
      onClose={() => {
        setShowViewSideBar(null);
        setRemarks({}); 
      }}
      open={showViewSidebar}
      extra={
        <Space>
          <CommonIcons
            action="printButton"
            loading={loading == "print"}
            onClick={printFun}
          />
          <CommonIcons
            action="downloadButton"
            loading={loading == "download"}
            onClick={handleDownload}
          />
        </Space>
      }
    >
      <Row gutter={20} style={{ height: "95%" }}>
        <Col span={16}>
          <div style={{ height: "calc(100% - 60px)" }} className="remove-table-footer">
            <MyDataTable
              pagination={undefined}
              rows={componentData?.components}
              columns={columns}
            />
          </div>
          
          
          <div 
            style={{ 
              marginTop: 16, 
              display: "flex", 
              justifyContent: "flex-end", 
              gap: 12 
            }}
          >
            <Button
              type="primary"
              size="large"
              style={{ 
                backgroundColor: "#52c41a", 
                borderColor: "#52c41a",
                minWidth: 120
              }}
              loading={actionLoading === "approve"}
              onClick={() => handleStatusUpdate("A")}
            >
              Approve 
            </Button>
            <Button
              type="primary"
              danger
              size="large"
              style={{ minWidth: 120 }}
              loading={actionLoading === "reject"}
              onClick={() => handleStatusUpdate("R")}
            >
              Reject
            </Button>
          </div>
        </Col>

        <Col span={8}>
          <Card
            title="PO logs"
            size="small"
            style={{ maxHeight: "100%" }}
            bodyStyle={{ height: "95%", overflowY: "auto" }}
          >
            <Timeline
              items={newPoLogs.map((row) => ({
                children: (
                  <>
                    <strong>{row.po_log_status}</strong>
                    <div style={{ fontSize: "10px" }}>
                      By {row.user_name} on {row.date} {row.time}
                    </div>
                    <div style={{ fontSize: "13px" }}>
                      Remark:{" "}
                      {row.po_log_remark.length === 0
                        ? "--"
                        : row.po_log_remark}
                    </div>
                  </>
                ),
              }))}
            />
          </Card>
        </Col>
      </Row>
    </Drawer>
  );
}