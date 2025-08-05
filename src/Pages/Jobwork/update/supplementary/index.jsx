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
import { getComponentOptions } from "../../../../api/general.ts";

import useApi from "../../../../hooks/useApi.ts";

function UpdateJW() {
  const [updateData, setUpdateData] = useState({
    selectType: "",
    poType: "",
    PoID: "",
    compName: "",
    comment: "",
  });

  const [asyncOptions, setAsyncOptions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [searchInput1, setSearchInput1] = useState("");
  const [header, setHeader] = useState([]);
  const [component, setComponent] = useState([]);
  const [viewModal, setViewModal] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  // Separate state for alternative components to avoid conflicts
  const [altComponentOptions, setAltComponentOptions] = useState([]);
  const [altSearchInput, setAltSearchInput] = useState("");
  const setType = [{ label: "Supplymentary", value: "S" }];
  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Alternative", value: "alt" },
  ];

  const [allData, setAllData] = useState({
    name: "",
  });
  const [showAltPartCode, setShowAltPartCode] = useState(false);
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

  const getComponent = async (e) => {
    if (e?.length > 2) {
      const { data } = await imsAxios.post("/JWSupplementary/fetchJwOption", {
        searchTerm: e,
      });
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
        // Map backend status to frontend status values
        let status = "active"; // default
        if (row.part_status === "ALT") {
          status = "alt";
        } else if (row.part_status === "ACTIVE") {
          status = "active";
        }

        // Map alternative components from backend
        let altComponents = [];
        if (row.part_alt && row.part_alt.length > 0) {
          altComponents = row.part_alt
            .filter(
              (alt) =>
                alt.alt_component_part !== "N/A" &&
                alt.alt_component_name !== "N/A"
            )
            .map((alt) => ({
              text: alt.alt_component_name,
              value: alt.alt_component_key || alt.alt_component_part, // Use key if available, fallback to part
              part_code: alt.alt_component_part,
              component_key: alt.alt_component_key, // Store the key for API calls
              isFromBackend: true, // Flag to identify backend components
            }));
        }

        const mappedRow = {
          ...row,
          id: v4(),
          index: index + 1,
          status: status,
          alt_components: altComponents,
          // Map backend fields to frontend field names
          component_name: row.component_name,
          component_part: row.component_part, // Use component_part from API
          component_uom: row.component_uom, // Use component_uom from API
          recipe_qty: row.recipe_qty, // Use recipe_qty from API
          component_key: row.component_key,
          row_id: row.row_id, // Use row_id from API
        };

        return mappedRow;
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

      const response = await executeFun(() => getComponentOptions(e), "select");
      const { data } = response;
      let arr = [];
      arr = data.map((d) => {
        return {
          text: d.text,
          value: d.id,
          part_code: d.part_code, // Include part_code from API response
        };
      });
      setAsyncOptions(arr);
    }
  };

  const getAltComponentName = async (e) => {
    if (e?.length > 2) {
      const response = await executeFun(
        () => getComponentOptions(e),
        "altSelect"
      );
      const { data } = response;
      let arr = [];
      arr = data.map((d) => {
        return {
          text: d.text,
          value: d.id, // This is the component key
          part_code: d.part_code, // Include part_code from API response
          component_key: d.id, // Store the key for API calls
        };
      });
      setAltComponentOptions(arr);
    }
  };

  const inputHandler = async (name, id, value) => {
    if (name == "component_name") {
      const { data } = await imsAxios.post(
        "/JWSupplementary/getComponentData",
        {
          component: value,
        }
      );

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
    } else if (name == "status") {
      setComponent((status) =>
        status.map((v) => {
          if (v.id == id) {
            return { ...v, status: value };
          } else {
            return v;
          }
        })
      );

      // Check if any row has status as "alt"
      const updatedComponent = component.map((v) => {
        if (v.id == id) {
          return { ...v, status: value };
        } else {
          return v;
        }
      });

      const hasAlternateStatus = updatedComponent.some(
        (row) => row.status === "alt"
      );
      setShowAltPartCode(hasAlternateStatus);
    }
  };

  const getColumns = () => {
    const baseColumns = [
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
      {
        headerName: "Status",
        field: "status",
        width: 150,
        sortable: false,
        renderCell: ({ row }) => (
          <Select
            style={{ width: "100%" }}
            value={row?.status}
            options={statusOptions}
            onChange={(e) => inputHandler("status", row.id, e)}
            placeholder="Select Status"
          />
        ),
      },
      {
        headerName: "Alternative Components",
        field: "alt_components",
        width: 400,
        sortable: false,
        renderCell: ({ row }) => {
          if (row?.status === "alt") {
            return (
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    border: "1px solid #d9d9d9",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    minHeight: "32px",
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor: "#fff",
                    cursor: "text",
                    position: "relative",
                  }}
                >
                  {/* Display selected chips inside the input area */}
                  {(row.alt_components || []).map((item, index) => {
                    const partCode =
                      item.part_code ||
                      item.text.split(" ").pop() ||
                      item.value;
                    return (
                      <span
                        key={`${row.id}-${item.value}-${index}`}
                        style={{
                          background: "#6c757d",
                          color: "white",
                          padding: "1px 4px",
                          borderRadius: "8px",
                          fontSize: "10px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "2px",
                          maxWidth: "60px",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                        title={item.text} // Show full text on hover
                      >
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {partCode}
                        </span>
                        {!item.isFromBackend && (
                          <span
                            style={{
                              cursor: "pointer",
                              fontWeight: "bold",
                              fontSize: "8px",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              const updatedAltComponents = (
                                row.alt_components || []
                              ).filter(
                                (_, i) => i !== row.alt_components.indexOf(item)
                              );
                              setComponent((prev) =>
                                prev.map((comp) =>
                                  comp.id === row.id
                                    ? {
                                        ...comp,
                                        alt_components: updatedAltComponents,
                                      }
                                    : comp
                                )
                              );
                            }}
                          >
                            ×
                          </span>
                        )}
                      </span>
                    );
                  })}

                  {/* Inline select component */}
                  <div style={{ flex: 1, minWidth: "120px" }}>
                    <MyAsyncSelect
                      style={{
                        border: "none",
                        outline: "none",
                        width: "100%",
                      }}
                      loadOptions={getAltComponentName}
                      selectLoading={loading1("altSelect")}
                      placeholder={
                        (row.alt_components || []).length === 0
                          ? "Search and select components"
                          : ""
                      }
                      onInputChange={(e) => setAltSearchInput(e)}
                      optionsState={altComponentOptions}
                      onChange={(value) => {
                        const selectedOption = altComponentOptions.find(
                          (opt) => opt.value === value
                        );
                        if (selectedOption) {
                          const currentAltComponents = row.alt_components || [];
                          const isDuplicate = currentAltComponents.find(
                            (item) => item.value === value
                          );
                          if (!isDuplicate) {
                            const updatedAltComponents = [
                              ...currentAltComponents,
                              {
                                ...selectedOption,
                                part_code: selectedOption.part_code, // Ensure part_code is included
                                isFromBackend: false, // Flag to identify newly added components
                              },
                            ];
                            setComponent((prev) =>
                              prev.map((item) =>
                                item.id === row.id
                                  ? {
                                      ...item,
                                      alt_components: updatedAltComponents,
                                    }
                                  : item
                              )
                            );
                            // Clear the selection but keep dropdown open
                            return null; // This prevents the dropdown from closing
                          }
                        }
                      }}
                      onBlur={(e) => {
                        // Only close dropdown if clicking outside the component
                        if (!e.currentTarget.contains(e.relatedTarget)) {
                          setAltComponentOptions([]);
                        }
                      }}
                      value={null} // Keep the select empty for new selections
                    />
                  </div>
                </div>
              </div>
            );
          }
          return null;
        },
      },
    ];

    return baseColumns;
  };

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

      // Prepare alternate components data
      const alternateComponentsData = component
        .filter((row) => row.status === "alt" && row.alt_components?.length > 0)
        .map((row) => {
          // Get all alternative components (both existing from backend and newly added)
          const allAltComponents = row.alt_components.map((item) => {
            // For existing components from backend, use component_key if available
            if (item.component_key && item.component_key !== "N/A") {
              return item.component_key;
            }
            // For newly added components, use the value (which should be the key from API)
            return item.value;
          });

          return {
            row_id: row.row_id,
            component_key: row.component_key,
            alt_components: allAltComponents,
          };
        });

      const { data } = await imsAxios.post(
        "/JWSupplementary/updateJobworkRecipe",
        {
          original_po: updateData?.poType,
          supp_po_id: updateData?.PoID,
          row: rowArray1,
          part: rowArray,
          qty: qtyArray,
          remark: updateData?.comment,
          alternate_components: alternateComponentsData,
        }
      );

      if (data.code == 200) {
        setComponent([]);
        setUpdateData({
          selectType: "",
          poType: "",
          PoID: "",
          compName: "",
          comment: "",
        });
        setShowAltPartCode(false);
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
    setShowAltPartCode(false);
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
                <MyDataTable columns={getColumns()} data={component} />
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
