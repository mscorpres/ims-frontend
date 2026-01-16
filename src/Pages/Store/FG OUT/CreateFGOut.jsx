import React, { useEffect, useState } from "react";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import { Col, Row, Select, Button, Input } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";
import MySelect from "../../../Components/MySelect";

const { TextArea } = Input;
const CreateFGOut = () => {
  const [loading, setLoading] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [selLoading, setSelLoading] = useState(false);
   const [locationOptions, setLocationOptions] = useState([]);
  const options = [
    { label: "Sale", value: "SL001" },
    { label: "Replacement", value: "REPL" },
    { label: "Other", value: "OT001" },
  ];
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [createFgOut, setCreateFgOut] = useState({
    selectType: "",
    comment: "",
    sih: "",
    pro: [],
    qty: [],
    remark: [],
    // uom: [],`
  });

  const [addRowData, setAddRowData] = useState([
    {
      id: v4(),
      product: "",
      quantity: "",
      total: "",
      location: "",
      remarks: "",
      uom: "",
    },
  ]);


  const plusRow = () => {
    setAddRowData((addRowData) => [
      ...addRowData,
      {
        id: v4(),
        product: "",
        quantity: "",
        total: "",
        location: "",
        remarks: "",
      },
    ]);
  };

  const minusRow = (id) => {
    setAddRowData((addRowData) => {
      return addRowData.filter((row) => row.id != id);
    });
  };

    const getLocations = async () => {
    const { data } = await imsAxios.get("/ppr/mfg_locations");
    const arr = [];
    data.data.map((a) => arr.push({ text: a.text, value: a.id }));
    setLocationOptions(arr);
  };


  useEffect(() => {
    getLocations();
  }, [])
  

  const getOption = async (productSearchInput) => {
    if (productSearchInput?.length > 2) {
      setSelLoading(true);
      const { data } = await imsAxios.post("/fgOUT/fetchProduct", {
        searchTerm: productSearchInput,
      });
      setSelLoading(false);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
      // return arr;
    }
  };

  const compInputHandler = async (name, id, value) => {
    console.log(name, id, value);
    if (name == "product") {
      const { data } = await imsAxios.post("/fgOUT/fetchProductData", {
        search: value,
      });
      const totalValue = data?.data?.total;
      const unitValue = data?.data?.unit;
      // console.log(totalValue);
      setAddRowData((product) =>
        product.map((h) => {
          if (h.id == id) {
            {
              return {
                ...h,
                product: value,
                total: totalValue,
                uom: unitValue,
              };
            }
          } else {
            return h;
          }
        })
      );
    } else if (name == "quantity") {
      setAddRowData((quantity) =>
        quantity.map((h) => {
          if (h.id == id) {
            {
              return { ...h, quantity: value };
            }
          } else {
            return h;
          }
        })
      );
    } else if (name == "remarks") {
      setAddRowData((remarks) =>
        remarks.map((h) => {
          if (h.id == id) {
            {
              return { ...h, remarks: value.target.value };
            }
          } else {
            return h;
          }
        })
      );
    } else if (name == "location") {
      setAddRowData((location) =>
        location.map((h) => {
          if (h.id == id) {
            {
              return { ...h, location: value };
            }
          } else {
            return h;
          }
        })
      );
    }
  };

  const addFGOut = async (e) => {
    e.preventDefault();
    let arrPro = [];
    let arrQty = [];
    let arrRemark = [];
    let arrLoc = [];
    addRowData.map((a) => arrPro.push(a.product));
    addRowData.map((a) => arrQty.push(a.quantity));
    addRowData.map((a) => arrRemark.push(a.remarks));
    addRowData.map((a) => arrLoc.push(a.location));
    // addRowData.map((a) => console.log(a));
    // console.log(arrQty);

    if (!createFgOut.selectType) {
      toast.error("Please Select Option");
    } else {
      setLoadingUpdate(true);
      const { data } = await imsAxios.post("/fgout/createFgOut", {
        fg_out_type: createFgOut.selectType,
        product: arrPro,
        qty: arrQty,
        location: arrLoc,
        remark: arrRemark,
        comment: createFgOut.comment,
      });
      if (data.code == 200) {
        resetFunction();

        toast.success(data.message);
        setLoadingUpdate(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoadingUpdate(false);
      }
    }
  };

  const resetFunction = async () => {
    setCreateFgOut({
      selectType: "",
      comment: "",
    });
    setAddRowData([
      {
        id: v4(),
        product: "",
        quantity: "",

        total: "",
        location: "",
        remarks: "",
      },
    ]);
    toast.success("Form Reset");
  };

  const columns = [
    {
      headerName: (
        <span onClick={plusRow}>
          <PlusCircleTwoTone
            style={{
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          />
          {/* <PlusSquareFilled style={{ cursor: "pointer", fontSize: "1.5rem" }} /> */}
        </span>
      ),
      width: 80,
      field: "add",

      // width: "5
      sortable: false,
      renderCell: ({ row }) =>
        addRowData.findIndex((r) => r.id == row.id) >= 1 && (
          <MinusCircleTwoTone
            onClick={() => minusRow(row?.id)}
            style={{
              fontSize: "1.1rem",
              cursor: "pointer",
            }}
          />
        ),
      // sortable: false,
    },

    {
      headerName: "Product / SKU",
      field: "product",
      width: 400,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          selectLoading={selLoading}
          style={{ width: "100%" }}
          onBlur={() => setAsyncOptions([])}
          onInputChange={(e) => setSearchInput(e)}
          loadOptions={getOption}
          value={addRowData?.product}
          optionsState={asyncOptions}
          onChange={(e) => compInputHandler("product", row.id, e)}
          // placeholder="Part/Name"
        />
      ),
    },
    {
      headerName: "	Stock In Hand",
      // field: "qty",
      width: 170,
      renderCell: ({ row }) => (
        <Input suffix={row?.uom} disabled value={row?.total} />
      ),
    },
    {
      headerName: "Issue Qty|UoM",
      field: "quantity ",
      width: 170,
      renderCell: ({ row }) => (
        <Input
          placeholder="Qty"
          suffix={row?.uom}
          value={addRowData?.quantity}
          onChange={(e) => compInputHandler("quantity", row.id, e.target.value)}
        />
      ),
    },
    {
      headerName: "Location",
      field: "location",
      width: 400,
      renderCell: ({ row }) => (
        <MySelect
          value={row?.location}
          onChange={(value) => compInputHandler("location", row.id, value)
          
          }
          options={locationOptions}
        />
      ),
    },
    {
      headerName: "Remark",
      field: "remarks ",
      width: 250,

      renderCell: ({ row }) => (
        <Input
          placeholder="Remark"
          value={addRowData?.remarks}
          onChange={(e) => compInputHandler("remarks", row.id, e)}
        />
      ),
    },
  ];

  return (
    <>
      <Row gutter={10} style={{ margin: "5px", height: "85%" }}>
        <Col span={5}>
          <Row gutter={16}>
            <Col span={24}>
              <Select
                style={{
                  width: "100%",
                  marginBottom: "10px",
                }}
                options={options}
                placeholder="Select"
                value={createFgOut.selectType}
                onChange={(e) =>
                  setCreateFgOut((createFgOut) => {
                    return {
                      ...createFgOut,
                      selectType: e,
                    };
                  })
                }
              />
            </Col>
            <Col span={24}>
              <TextArea
                rows={5}
                placeholder="Comment(Optional)"
                className="form-control"
                value={createFgOut.comment}
                onChange={(e) =>
                  setCreateFgOut((createFgOut) => {
                    return {
                      ...createFgOut,
                      comment: e.target.value,
                    };
                  })
                }
              />
            </Col>
          </Row>
        </Col>
        <Col span={19}>
          <MyDataTable
            loading={loading}
            data={addRowData}
            columns={columns}
            hideHeaderMenu
          />
        </Col>
      </Row>
      <Row style={{ margin: "10px" }}>
        <Col span={24}>
          <div style={{ textAlign: "end" }}>
            <MyButton
              onClick={resetFunction}
              // style={{
              //   backgroundColor: "red",
              //   color: "white",
              //   marginRight: "5px",
              // }}
              variant="reset"
            >
              Reset{" "}
            </MyButton>
            <Button
              type="primary"
              onClick={addFGOut}
              loading={loadingUpdate}
              // style={{ backgroundColor: "#0e5185", color: "white" }}
            >
              Create Fg Out{" "}
            </Button>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default CreateFGOut;
