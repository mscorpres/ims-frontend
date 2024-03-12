import React, { useState, useEffect } from "react";
import { Button, Col, Input, Row, Select, Skeleton } from "antd";
// import InternalNav from "../../Components/InternalNav";
// import JobworkUpdate from "../links/JobworkUpdate";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import axios from "axios";
import { toast } from "react-toastify";
import UpdateViewModal from "../../Modal/UpdateViewModal";
import { EyeTwoTone, OrderedListOutlined } from "@ant-design/icons";
import { v4 } from "uuid";
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import MyDataTable from "../../../../Components/MyDataTable";
import { imsAxios } from "../../../../axiosInterceptor";
import { getComponentOptions } from "../../../../api/general";

import useApi from "../../../../hooks/useApi";

function UpdateJW() {
  const [updateData, setUpdateData] = useState({
    selectType: "",
    poType: "",
    PoID: "",
    compName: "",
    comment: "",
  });
  // console.log(updateData);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchInput1, setSearchInput1] = useState("");
  const [header, setHeader] = useState([]);
  const [component, setComponent] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const setType = [{ label: "Supplymentary", value: "S" }];

  const [allData, setAllData] = useState({
    name: "",
  });
  const { executeFun, loading: loading1 } = useApi();
  const [addField, setAddField] = useState([
    {
      id: v4(),
      name: "",
      part: "",
      uom: "",
      recipyQty: "",
      row_id: 0,
    },
  ]);
  // console.log(addField);

  const getComponent = async (e) => {
    if (e?.length > 2) {
      const { data } = await imsAxios.post("/JWSupplementary/fetchJwOption", {
        searchTerm: e,
      });
      console.log(data);
      let arr = [];
      arr = data.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const addRow = () => {
    setComponent((data) => [
      {
        id: v4(),
        component_key: "",
        component_name: "",
        component_part: "",
        component_uom: "",
        recipyQty: "",
        row_id: 0,
        new: true,
      },
      ...data,
    ]);
  };

  const removeRow = (id) => {
    setComponent((date) => {
      return date.filter((row) => row.id != id);
    });
  };

  const getAllHeaderData = async () => {
    setLoadingUpdate(true);
    const { data } = await imsAxios.post(
      "/JWSupplementary/fetchSupplementaryData",
      {
        sup_jobwork_id: updateData?.poType,
      }
    );
    if (data.code == 200) {
      setHeader(data?.data?.headers);
      let arr = data?.data?.components.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setComponent(arr);
      setLoadingUpdate(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoadingUpdate(false);
    }
  };

  const getComponentName = async (e) => {
    if (e?.length > 2) {
      // setSelectLoading(true);
      // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: e,
      // });
      // console.log(data);
      // setSelectLoading(false);
      const response = await executeFun(() => getComponentOptions(e), "select");
      const { data } = response;
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
      // return arr;
    }
  };

  const inputHandler = async (name, id, value) => {
    console.log(name, id, value);

    if (name == "component_name") {
      const { data } = await imsAxios.post(
        "/JWSupplementary/getComponentData",
        {
          component: value,
        }
      );

      console.log(data);

      setComponent((com) =>
        com.map((v) => {
          if (v.id == id) {
            {
              return {
                ...v,
                component_name: data?.data?.name,
                component_part: data?.data?.part,
                component_uom: data?.data?.unit,
                component_key: data?.data?.key,
              };
            }
          } else {
            return v;
          }
        })
      );
    } else if (name == "recipe_qty") {
      setComponent((qty) =>
        qty.map((v) => {
          if (v.id == id) {
            {
              return { ...v, recipe_qty: value };
            }
          } else {
            return v;
          }
        })
      );
    }
  };

  const columns = [
    {
      headerName: (
        <span onClick={addRow}>
          <PlusCircleTwoTone
            style={{ cursor: "pointer", fontSize: "1.0rem" }}
          />
        </span>
      ),
      width: 70,
      field: "add",
      sortable: false,
      renderCell: ({ row }) =>
        row.new && (
          <MinusCircleTwoTone
            onClick={() => removeRow(row?.id)}
            style={{ fontSize: "1.0rem", cursor: "pointer" }}
          />
        ),
    },
    {
      headerName: "Name",
      field: "component_name",
      width: 650,
      sortable: false,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          style={{ width: "100%" }}
          onBlur={() => setAsyncOptions([])}
          loadOptions={getComponentName}
          selectLoading={loading1("select")}
          value={row?.component_name}
          onInputChange={(e) => setSearchInput1(e)}
          optionsState={asyncOptions}
          onChange={(e) => inputHandler("component_name", row.id, e)}
        />
      ),
    },
    {
      headerName: "Part",
      field: "component_part",
      width: 150,
      sortable: false,
      renderCell: ({ row }) => <Input value={row.component_part} disabled />,
    },
    {
      headerName: "UoM",
      field: "component_uom",
      width: 150,
      sortable: false,
      renderCell: ({ row }) => <span>{row.component_uom}</span>,
    },
    {
      headerName: "Recipe Qty",
      field: "recipe_qty",
      width: 250,
      sortable: false,
      renderCell: ({ row }) => (
        <Input
          suffix={row.uom}
          placeholder="Qty"
          value={row.recipe_qty}
          onChange={(e) => inputHandler("recipe_qty", row.id, e.target.value)}
        />
      ),
    },
  ];

  const addUpdate = async () => {
    if (!updateData.comment) {
      toast.error("Please Fill comment");
    } else {
      setLoadingUpdate(true);
      let rowArray1 = [];
      let rowArray = [];
      let qtyArray = [];

      component.map((a) => rowArray1.push(a.row_id));
      component.map((a) => rowArray.push(a.component_key));
      component.map((a) => qtyArray.push(a.recipe_qty));

      const { data } = await imsAxios.post(
        "/JWSupplementary/updateJobworkRecipe",
        {
          original_po: updateData?.poType,
          supp_po_id: updateData?.PoID,
          row: rowArray1,
          part: rowArray,
          qty: qtyArray,
          remark: updateData?.comment,
        }
      );
      // console.log(data);
      if (data.code == 200) {
        setComponent([]);
        setUpdateData({
          selectType: "",
          poType: "",
          PoID: "",
          compName: "",
          comment: "",
        });
        toast.success(data.message);
        setLoadingUpdate(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoadingUpdate(false);
      }
    }
  };

  const reset = () => {
    setUpdateData({
      selectType: "",
      poType: "",
      PoID: "",
      compName: "",
      comment: "",
    });
    setComponent([]);
  };
  useEffect(() => {
    if (updateData?.poType) {
      getAllHeaderData();
    }
  }, [updateData?.poType]);

  return (
    <>
      <div style={{}}>
        {/* <InternalNav links={JobworkUpdate} /> */}
        <Row gutter={16}>
          <Col span={24}>
            <Row gutter={10} style={{ margin: "10px" }}>
              <Col span={6}>
                <Row gutter={10}>
                  <Col span={24}>
                    <span>JW PO Type</span>
                  </Col>
                  <Col span={24}>
                    <span style={{ fontSize: "10px", fontWeight: "bolder" }}>
                      JW PO Type Provide Jobwork PO type as in (New OR
                      Supplementary)
                    </span>
                  </Col>
                </Row>
              </Col>

              <Col span={4}>
                <text style={{ fontSize: "10px" }}>JW PO Type</text>
                <Select
                  placeholder="Please Select Option"
                  style={{ width: "100%" }}
                  options={setType}
                  value={updateData?.selectType}
                  onChange={(e) =>
                    setUpdateData((updateData) => {
                      return { ...updateData, selectType: e };
                    })
                  }
                />
              </Col>
              {updateData.selectType && (
                <>
                  <Col span={4}>
                    <text style={{ fontSize: "10px" }}>Original JW PO</text>
                    <MyAsyncSelect
                      style={{ width: "100%" }}
                      onBlur={() => setAsyncOptions([])}
                      onInputChange={(e) => setSearchInput(e)}
                      loadOptions={getComponent}
                      value={updateData?.poType}
                      optionsState={asyncOptions}
                      // onChange={(e) => inputHandler("productName", row.id, e)}
                      onChange={(e) =>
                        setUpdateData((updateData) => {
                          return { ...updateData, poType: e };
                        })
                      }
                    />
                  </Col>
                  <Col span={4}>
                    <text style={{ fontSize: "10px" }}>Supp. PO Id</text>
                    <Input
                      placeholder="PO ID"
                      value={updateData?.PoID}
                      onChange={(e) =>
                        setUpdateData((updateData) => {
                          return { ...updateData, PoID: e.target.value };
                        })
                      }
                    />
                  </Col>
                  <Col span={6}>
                    <text style={{ fontSize: "10px" }}>Comment*</text>
                    <Input
                      placeholder="PO ID"
                      value={updateData?.comment}
                      onChange={(e) =>
                        setUpdateData((updateData) => {
                          return { ...updateData, comment: e.target.value };
                        })
                      }
                    />
                  </Col>
                </>
              )}
            </Row>
          </Col>
        </Row>

        {component.length > 0 && (
          <Skeleton loading={loadingUpdate}>
            <div style={{ height: "94%" }}>
              <div style={{ height: "68vh", margin: "10px" }}>
                <MyDataTable columns={columns} data={component} />
              </div>
            </div>

            <Row gutter={16} style={{ margin: "5px" }}>
              <Col span={24}>
                <div style={{ textAlign: "end" }}>
                  {/* <Button style={{ marginRight: "5px" }}>Reset</Button> */}
                  <Button
                    onClick={reset}
                    style={{
                      marginRight: "5px",
                      background: "#EB455F",
                      color: "white",
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    onClick={() => setViewModal(true)}
                    style={{
                      marginRight: "5px",
                      background: "#10A19D",
                      color: "white",
                    }}
                  >
                    View
                  </Button>
                  <Button type="primary" onClick={addUpdate}>
                    Update
                  </Button>
                </div>
              </Col>
            </Row>
          </Skeleton>
        )}
      </div>
      <UpdateViewModal
        viewModal={viewModal}
        setViewModal={setViewModal}
        header={header}
        component={component}
        loadingUpdate={loadingUpdate}
      />
    </>
  );
}

export default UpdateJW;
