import { useState, useEffect } from "react";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { Input, Skeleton, Tabs, Typography } from "antd";
import FormTable from "../../../../Components/FormTable";
import NavFooter from "../../../../Components/NavFooter";
import { imsAxios } from "../../../../axiosInterceptor";

const ReqWithBomModal = ({ allBom, back, setTab, reset }) => {
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [submitLoading, setsubmitLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [tabItems, setTabItems] = useState([]);
  const [tabsExist, setTabsExist] = useState(["P", "PCK", "O", "PCB"]);
  const [activeKey, setActiveKey] = useState("P");
  const getFetcgData = async () => {
    setPageLoading(true);
    const { data } = await imsAxios.post("/production/FetchComponentWithBom", {
      bom: allBom.proBom,
      mfgQty: allBom.qty,
      pic_loc: allBom.locSecond,
      shiftLocation: allBom.locValue,
    });
    setPageLoading(false);
    let dataArray = [...data?.data?.filter((a) => a?.type == "P")];
    dataArray = dataArray.map((row) => {
      return {
        ...row,
        reqQty: "",
        remark: "",
        id: v4(),
      };
    });

    let dataArray1 = [...data?.data?.filter((aa) => aa?.type == "PCK")];
    dataArray1 = dataArray1.map((row) => {
      return {
        ...row,
        reqQty: "",
        id: v4(),
        remark: "",
      };
    });
    let dataArray2 = [...data?.data?.filter((aaa) => aaa?.type == "O")];
    dataArray2 = dataArray2.map((row) => {
      return {
        ...row,
        reqQty: "",
        remark: "",
        id: v4(),
      };
    });
    let dataArray3 = [...data?.data?.filter((aaa) => aaa?.type == "PCB")];
    dataArray3 = dataArray3.map((row) => {
      return {
        ...row,
        reqQty: "",
        remark: "",
        id: v4(),
      };
    });
    let arr = tableData;
    arr = [...dataArray, ...dataArray1, ...dataArray2, ...dataArray3];
    setTableData(arr);
  };

  const columns = [
    {
      headerName: "Component Name",
      flex: 1,
      sortable: false,
      field: "name",
      renderCell: ({ row }) => (
        <span
          style={{
            color:
              Number(row.leftQty) < Number(row?.mfgQTY * row?.qty) && "red",
          }}
        >
          {row.name}
        </span>
      ),
    },
    {
      headerName: "Component Code",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => <span>{row.partcode}</span>,
      field: "partcode",
    },
    {
      headerName: "Required QTY",
      renderCell: ({ row }) => (
        <span>
          {row?.mfgQTY * row?.qty} {row?.unit}
        </span>
      ),
    },
    {
      headerName: "Stock QTY",
      flex: 1,
      sortable: false,
      field: "qty",
      renderCell: ({ row }) => (
        <span>
          {row?.leftQty} {row?.unit}
        </span>
      ),
    },
    {
      headerName: "SF QTY",
      flex: 1,
      sortable: false,
      field: "sfQty",
      renderCell: ({ row }) => (
        <span>
          {row?.sfQty} {row?.unit}
        </span>
      ),
    },
    {
      headerName: "SF Control",
      flex: 1,
      sortable: false,
      field: "sfControlQty",
      renderCell: ({ row }) => (
        <span>
          {row?.sfControlQty} {row?.unit}
        </span>
      ),
    },
    {
      headerName: "Request",
      flex: 1,
      sortable: false,
      field: "request",
      renderCell: ({ row }) => (
        <Input
          size="default"
          placeholder="Qty"
          value={row.reqQty}
          onChange={(e) =>
            compInputHandler("reqQty", e.target.value, row.id, row.type)
          }
        />
      ),
    },
    {
      headerName: "Remarks",
      flex: 1,
      sortable: false,
      field: "remarks",
      renderCell: ({ row }) => (
        <Input
          size="default"
          placeholder="Remark"
          className="form-control form-control-sm"
          value={row.remark}
          onChange={(e) =>
            compInputHandler("remark", e.target.value, row.id, row.type)
          }
        />
      ),
    },
  ];

  const remove = (targetKey) => {
    let newActiveKey = activeKey;
    let lastIndex = -1;
    tabItems.forEach((item, i) => {
      if (item.key === targetKey) {
        lastIndex = i - 1;
      }
    });
    const newPanes = tabItems.filter((item) => item.key !== targetKey);
    let arr = newPanes.map((pane) => pane.key);
    setTabsExist(arr);

    if (newPanes.length && newActiveKey === targetKey) {
      if (lastIndex >= 0) {
        newActiveKey = newPanes[lastIndex].key;
      } else {
        newActiveKey = newPanes[0].key;
      }
    }
    if (newPanes.length == 1) {
      newPanes[0] = {
        ...newPanes[0],
        closable: false,
      };
    }
    setTabItems(newPanes);
    setActiveKey(newActiveKey);
  };
  const onChange = (newActiveKey) => {
    setActiveKey(newActiveKey);
  };
  const onEdit = (targetKey, action) => {
    remove(targetKey);
  };

  const compInputHandler = async (name, value, id) => {
    let arr = tableData;
    arr = arr.map((a) => {
      let obj = a;
      if (a.id == id) {
        obj = {
          ...obj,
          [name]: value,
        };
        return obj;
      } else {
        return obj;
      }
    });
    console.log(arr);
    setTableData(arr);
  };

  const sendRequest = async () => {
    let arr = [];
    arr = tabsExist.map((tab) => {
      return tableData.filter((row) => row.type == tab);
    });
    arr = arr.reduce((r, c) => {
      return [...r, ...c];
    });
    const finalObj = {
      component: arr.map((row) => row.key),
      qty: arr.map((row) => row.reqQty),
      mfgqty: allBom.qty,
      remark: arr.map((row) => row.remark),
      comment: allBom.remark,
      bom: allBom.proBom,
      location: allBom.locValue,
      product: allBom.proSku.value,
      pic_loc: allBom.locSecond,
    };

    setsubmitLoading(true);
    const { data } = await imsAxios.post(
      "/production/CreateMatrialRequestWithBom",
      finalObj
    );
    setsubmitLoading(false);
    if (data.code == 200) {
      toast.success(data.message);
      setTab(true);
      reset();
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (allBom.proBom.value || allBom.qty) {
      getFetcgData();
    }
  }, [allBom.proBom.value || allBom.qty]);
  useEffect(() => {
    let arr = tabsExist.map((tab) => {
      return {
        label:
          tab == "P"
            ? "Part"
            : tab == "PCK"
            ? "Packing"
            : tab == "1"
            ? "MFG Journal"
            : tab == "O"
            ? "Other"
            : tab == "PCB" && "PCB",

        key: tab,
        children: (
          <div style={{ height: "73vh" }}>
            <div style={{ height: "95%" }}>
              <FormTable
                loading={loading}
                columns={columns}
                data={tableData.filter((row) => row.type == tab)}
              />
            </div>
          </div>
        ),
      };
    });
    setTabItems(arr);
  }, [tableData]);

  return (
    <div
      style={{ height: "calc(100vh - 180px)", margin: 10, overflow: "auto" }}
    >
      <div style={{ margin: 12 }}>
        <Skeleton active loading={pageLoading} />
        <Skeleton active loading={pageLoading} />
        <Skeleton active loading={pageLoading} />
      </div>
      {!pageLoading && (
        <Tabs
          type="editable-card"
          onChange={onChange}
          activeKey={activeKey}
          onEdit={onEdit}
          items={tabItems}
          hideAdd={true}
          tabBarExtraContent={{
            right: (
              <Typography.Text style={{ marginRight: 10 }}>
                {tableData.filter((row) => row.type == activeKey).length} Items
              </Typography.Text>
            ),
          }}
        />
      )}

      {/* footer */}
      <NavFooter
        loading={submitLoading}
        submitFunction={sendRequest}
        nextLabel="Send Request"
        backFunction={back}
      />
    </div>
  );
};

export default ReqWithBomModal;
