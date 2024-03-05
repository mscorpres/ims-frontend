import React, { useEffect, useState } from "react";
import { Button, Col, Drawer, Input, Row, Space } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import MyDataTable from "../../../../Components/MyDataTable";
import Loading from "../../../../Components/Loading";
import { CloseCircleTwoTone } from "@ant-design/icons";
import { imsAxios } from "../../../../axiosInterceptor";
import MySelect from "../../../../Components/MySelect";

function BomComponentModal({
  dataModal,
  setDataModal,
  addRowData,
  setAddRowData,
}) {
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState("false");
  const categoryOptions = [
    { text: "Part", value: "P" },
    { text: "Packing", value: "PCK" },
    { text: "Other", value: "O" },
    { text: "PCB", value: "PCB" },
  ];
  console.log("----", dataModal);
  // /ppr/fetchBOMComponent
  const getAllComponentList = async () => {
    setLoading("fetch");
    const response = await imsAxios.post("/ppr/fetchBOMComponent", {
      sku: dataModal.product,
      bom: dataModal.bomRecipe,
      qty: dataModal.quantity,
      serverref: dataModal.serverId ?? "",
      clientref: dataModal?.id,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code == 200) {
        let arr = data.data.map((row, index) => {
          return {
            ...row,
            id: v4(),
            index: index + 1,
          };
        });
        setAllData(arr);
      } else if (data.code == 500) {
        toast.error(data.message.sku);
      }
    }
  };

  const inputHandler = (name, id, value) => {
    console.log(name, id, value);
    if (name == "qty") {
      setAllData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, qty: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "rate") {
      setAllData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, rate: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "category") {
      setAllData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, category: value };
            }
          } else {
            return aa;
          }
        })
      );
    }
  };

  const reset = (i) => {
    setAllData((allDataComes) => {
      return allDataComes.filter((row) => row.id != i);
    });
  };
  const resetData = (i) => {
    console.log(i);
    // setAllData((allDataComes) => {
    //   return allDataComes.filter((row) => row.id != i);
    // });
  };

  const columns = [
    // { field: "index", headerName: "S No.", width: 8 },
    { field: "part", headerName: "Part", width: 70 },
    { field: "name", headerName: "Name", width: 400 },
    {
      field: "category",
      headerName: "Type",
      width: 100,
      renderCell: ({ row }) => (
        <MySelect
          value={row.category}
          onChange={(value) => inputHandler("category", row.id, value)}
          options={categoryOptions}
        />
      ),
    },
    {
      field: "bomqty",
      headerName: "BOM Qty",
      width: 100,
      renderCell: ({ row }) => (
        <Input
          disabled
          value={row.bomqty}
          onChange={(value) => inputHandler("bomqty", row.id, value)}
          options={categoryOptions}
        />
      ),
    },
    {
      field: "rate",
      headerName: "Rate",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          value={row?.rate}
          onChange={(e) => inputHandler("rate", row.id, e.target.value)}
        />
      ),
    },
    {
      field: "qty",
      headerName: "Required Qty",
      width: 150,
      renderCell: ({ row }) => (
        <Input
          suffix={row?.uom}
          value={row?.qty}
          placeholder="Qty"
          onChange={(e) => inputHandler("qty", row.id, e.target.value)}
        />
      ),
    },

    {
      field: "branchstock",
      headerName: "All Stock",
      width: 120,
      renderCell: ({ row }) => row.branchstock,
    },
    {
      field: "left_stock",
      headerName: "Left Stock",
      width: 80,
      renderCell: ({ row }) => "--",
    },
    {
      field: "popendingqty",
      headerName: "PO Qty",
      width: 100,
      renderCell: ({ row }) => row.popendingqty,
    },

    {
      type: "actions",
      headerName: "Delete",
      width: 80,
      getActions: ({ row }) => [
        <CloseCircleTwoTone
          onClick={() => reset(row?.id)}
          // onClick={() => console.log(row.serial)}
          style={{ color: "#1890ff", fontSize: "15px" }}
        />,
      ],
    },
  ];

  const updateFunction = async () => {
    // console.log(dataModal);
    const compArray = [];
    const reqArray = [];
    const rateArray = [];
    const category = [];
    allData.map((a) => compArray.push(a.component));
    allData.map((aa) => reqArray.push(aa.qty));
    allData.map((aa) => rateArray.push(aa.rate));
    allData.map((row) => category.push(row.category));
    setLoading("submit");
    const response = await imsAxios.post("/ppr/save_pprBomRM", {
      skucode: dataModal.product,
      bom: dataModal.bomRecipe,
      ord_qty: dataModal.quantity,
      category: category,
      rate: rateArray,
      component: compArray,
      req_qty: reqArray,
      serverref: "",
      clientref: dataModal.id,
    });
    setLoading(false);

    const { data } = response;
    if (data) {
      if (data.code == 200) {
        let arr = addRowData.map((row) => {
          if (row.id == dataModal.id) {
            return {
              ...row,
              serverId: data.data.serverref,
              aD: allData,
            };
          } else {
            return row;
          }
        });
        setAddRowData(arr);

        setDataModal((dm) => ({ ...dm, showModal: false }));
      } else if (data.code == 500) {
        toast.error(data.message.msg);
      }
    }
  };

  useEffect(() => {
    if (dataModal) {
      getAllComponentList();
    }
  }, [dataModal]);

  return (
    <Space>
      <Drawer
        width="55vw"
        title="BOM Component(s) List"
        placement="right"
        closable={false}
        onClose={() => setDataModal((dm) => ({ ...dm, showModal: false }))}
        open={dataModal.showModal}
        getContainer={false}
        style={{
          position: "absolute",
        }}
        extra={
          <Space>
            <CloseCircleFilled
              onClick={() =>
                setDataModal((dm) => ({ ...dm, showModal: false }))
              }
            />
          </Space>
        }
      >
        {loading === "fetch" && <Loading />}
        <div style={{ height: "85%" }}>
          <div style={{ height: "100%" }}>
            <MyDataTable columns={columns} data={allData} />
          </div>
        </div>
        <Row gutter={10} style={{ marginTop: "30px" }}>
          <Col span={24}>
            <div style={{ textAlign: "end" }}>
              <Button
                onClick={() => setDataModal(false)}
                // onClick={() => setDataModal(false)}
                style={{
                  marginRight: "5px",
                  backgroundColor: "red",
                  color: "white",
                }}
              >
                Reset
              </Button>
              <Button
                onClick={updateFunction}
                loading={loading === "submit"}
                type="primary"
              >
                Update
              </Button>
            </div>
          </Col>
        </Row>
      </Drawer>
    </Space>
  );
}

export default BomComponentModal;
