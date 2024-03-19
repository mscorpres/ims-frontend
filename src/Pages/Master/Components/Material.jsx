import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { Button, Col, Input, Row, Select, Skeleton } from "antd";
import MySelect from "../../../Components/MySelect";
import { PlusOutlined, MinusOutlined } from "@ant-design/icons";
import MaterialUpdate from "../Modal/MaterialUpdate";
import MyDataTable from "../../../Components/MyDataTable";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import TableActions from "../../../Components/TableActions.jsx/TableActions";
import ComponentImages from "./ComponentImages";
import { imsAxios } from "../../../axiosInterceptor";
import AddPhoto from "./AddPhoto";
import { Link } from "react-router-dom";
import { GridActionsCellItem } from "@mui/x-data-grid";

const Material = () => {
  const [material, setMaterial] = useState({
    partno: "",
    new_partno:"",
    unit: "",
    comp: "",
    shortnotes: "",
    groupSel: "",
    selType: "",
    hsn: "",
    percentage: "",
  });

  const [asyncOptions, setAsyncOptions] = useState([]);
  const [component, setComponent] = useState([]);
  const [showImages, setShowImages] = useState();
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [Uom, setUom] = useState([]);
  const [selectGroup, setSelectGroup] = useState([]);
  const [hsnData, setHsnData] = useState([
    {
      id: v4(),
      hsnCode: "",
      tax: "",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);
  const [materialModal, setMaterialModal] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const allComponent = async () => {
    setLoading(true);
    const { data } = await imsAxios.get("/component");

    let arr = data.data.map((row) => {
      return {
        ...row,
        id: v4(),
      };
    });
    setComponent(arr);
    setLoading(false);
  };

  const addHsnRow = () => {
    setHsnData((hsnData) => [
      ...hsnData,
      {
        id: v4(),
        hsnCode: "",
        tax: "",
      },
    ]);
  };

  const removeHsnRow = (id) => {
    setHsnData((hsnDate) => {
      return hsnDate.filter((row) => row.id != id);
    });
  };

  const hsnInputHandler = (name, id, value) => {
    setHsnData((rows) =>
      rows.map((row) => {
        if (row.id == id) {
          return { ...row, [name]: value };
        } else {
          return row;
        }
      })
    );
  };

  const fetchUOM = async () => {
    const { data } = await imsAxios.post("/uom/uomSelect2");
    let a = [];
    data?.data?.map((x) => a.push({ text: x.text, value: x.id }));
    setUom(a);
  };

  const fetchSelectGropu = async (e) => {
    const { data } = await imsAxios.post("/groups/groupSelect2", {
      searchTerm: e,
    });
    let a = [];
    data.data.map((x) => a.push({ text: x.text, value: x.id }));
    setSelectGroup(a);
  };

  const getOption = async (productSearchInput) => {
    if (productSearchInput?.length > 2) {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/backend/searchHsn", {
        searchTerm: productSearchInput,
      });
      setSelectLoading(false);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const resetFunction = async () => {
    setMaterial({
      partno: "",
      unit: { value: "", label: "" },
      Uom: "",
      comp: "",
      shortnotes: "",
      groupSel: { value: "", label: "" },
      selType: "",
      hsn: "",
      percentage: "",
    });
    setHsnData([
      {
        id: v4(),
        hsnCode: "",
        tax: "",
      },
    ]);
  };

  const addComponent = async (e) => {
    e.preventDefault();

    if (!material.partno) {
      toast.error("Please enter part code");
    } else if (!material.unit) {
      toast.error("Please enter unit");
    } else if (!material.comp) {
      toast.error("Please enter component name");
    } else if (!material.groupSel) {
      toast.error("Please enter group name");
    } else if (!material.selType) {
      toast.error("Please enter category name");
    } else {
      setLoading(true);
      let hsnArr = [];
      let taxArr = [];
      hsnData.map((rows) => hsnArr.push(rows.hsnCode));
      hsnData.map((rows) => taxArr.push(rows.tax));
      const { data } = await imsAxios.post("/component/addComponent", {
        part: material.partno,
        uom: material.unit,
        component: material.comp,
        comp_type: "R",
        c_category: material.selType,
        notes: material.shortnotes,
        group: material.groupSel,
        hsns: hsnArr,
        taxs: taxArr,
        new_partno: material.new_partno,
      });

      if (data.code === 200) {
        // allComponent();
        setMaterial({
          partno: "",
          unit: { value: "", label: "" },
          Uom: "",
          comp: "",
          shortnotes: "",
          groupSel: { value: "", label: "" },
          selType: "",
          hsn: "",
          percentage: "",
        });
        setHsnData([
          {
            id: v4(),
            hsnCode: "",
            tax: "",
          },
        ]);
        allComponent();
        setLoading(false);
        toast.success("Added Successfully");
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
  };

  const redirectToUpdateCategory = () => {};
  const selectionOption = [
    { label: "Component", value: "C" },
    { label: "Other", value: "O" },
  ];

  const columns = [
    // { field: "dt", headerName: "S.No.", width: 150 },
    {
      field: "actions",
      headerName: "",
      width: 30,
      type: "actions",
      getActions: ({ row }) => [
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label={
            <Link
              style={{
                textDecoration: "none",
                color: "black",
              }}
              to={`/master/component/${row.component_key}`}
              target="_blank"
            >
              Update
            </Link>
          }
        />,
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label="View Images"
          onClick={() =>
            setShowImages({
              partNumber: row.component_key,
              partCode: row.c_part_no,
            })
          }
        />,
        <GridActionsCellItem
          showInMenu
          // disabled={disabled}
          label="Upload Images"
          onClick={() =>
            setUploadingImage({
              key: row.component_key,
              label: row.c_name,
            })
          }
        />,
      ],
    },
    { field: "c_part_no", headerName: "Part", width: 100 },
    {
      field: "c_name",
      headerName: "Component",
      width: 350,
    },
    { field: "units_name", headerName: "UoM", width: 100 },
  ];

  const column = [
    {
      headerName: (
        <span onClick={addHsnRow}>
          <PlusOutlined
            style={{
              cursor: "pointer",
              fontSize: "1.0rem",
            }}
          />
        </span>
      ),
      width: 70,
      field: "add",
      sortable: false,
      renderCell: ({ row }) =>
        hsnData.findIndex((r) => r.id == row.id) >= 1 && (
          <MinusOutlined
            onClick={() => removeHsnRow(row?.id)}
            style={{
              fontSize: "1.0rem",
              cursor: "pointer",
            }}
          />
        ),
      // sortable: false,
    },
    {
      headerName: "HSN/SAC Code",
      field: "hsn",
      width: 450,
      sortable: false,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          selectLoading={selectLoading}
          onBlur={() => setAsyncOptions([])}
          loadOptions={getOption}
          value={hsnData?.hsnCode}
          optionsState={asyncOptions}
          onChange={(value) => hsnInputHandler("hsnCode", row.id, value)}
        />
      ),
    },
    {
      headerName: "Tax (%) Percentage",
      field: "tax",
      width: 150,
      sortable: false,
      renderCell: ({ row }) => (
        <Input
          placeholder="percentage"
          onChange={(e) => {
            hsnInputHandler("tax", row.id, e.target.value);
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    allComponent();
    fetchUOM();
    fetchSelectGropu();
    if (searchInput.length > 1) {
      let arr = component.filter(
        (service) =>
          service.c_part_no.toLowerCase() == searchInput.toLowerCase()
      );
      setSearchResult(arr);
    }
  }, [searchInput]);

  return (
    <div style={{ height: "90%" }}>
      <ComponentImages setShowImages={setShowImages} showImages={showImages} />
      <AddPhoto
        updatingImage={uploadingImage}
        setUpdatingImage={setUploadingImage}
      />
      <Row gutter={16} style={{ height: "100%", margin: "10px" }}>
        <Col style={{ height: "85%" }} span={12}>
          <Row gutter={16}>
            <Col span={12}>
              <div>
                <Input
                  style={{ width: "100%" }}
                  placeholder="Part Code"
                  name="partno"
                  value={material.partno}
                  onChange={(e) =>
                    setMaterial((material) => {
                      return {
                        ...material,
                        partno: e.target.value,
                      };
                    })
                  }
                />
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Input
                  style={{ width: "100%" }}
                  placeholder="Cat Part Code"
                  name="new_partno"
                  value={material.new_partno}
                  onChange={(e) =>
                    setMaterial((material) => {
                      return {
                        ...material,
                        new_partno: e.target.value,
                      };
                    })
                  }
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginTop: "4px" }}>
                <MySelect
                  style={{ width: "100%" }}
                  options={Uom}
                  placeholder="Please select UoM"
                  value={material.unit.value}
                  onChange={(e) =>
                    setMaterial((material) => {
                      return { ...material, unit: e };
                    })
                  }
                />
                {/* <Select
                /> */}
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Input
                  style={{
                    width: "100%",
                    marginTop: "4px",
                  }}
                  placeholder="Please Enter Component Name"
                  name="comp"
                  value={material.comp}
                  onChange={(e) =>
                    setMaterial((material) => {
                      return {
                        ...material,
                        comp: e.target.value,
                      };
                    })
                  }
                />
              </div>
            </Col>
            <Col span={12}>
              <div>
                <Input
                  style={{
                    width: "100%",
                    marginTop: "6px",
                  }}
                  placeholder="Description"
                  name="shortnotes"
                  value={material.shortnotes}
                  onChange={(e) =>
                    setMaterial((material) => {
                      return {
                        ...material,
                        shortnotes: e.target.value,
                      };
                    })
                  }
                />
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginTop: "4px" }}>
                <MySelect
                  style={{ width: "100%" }}
                  options={selectGroup}
                  placeholder="Group"
                  value={material.groupSel.value}
                  onChange={(e) =>
                    setMaterial((material) => {
                      return { ...material, groupSel: e };
                    })
                  }
                />
                {/* <Select
                /> */}
              </div>
            </Col>
            <Col span={12}>
              <div style={{ marginTop: "4px" }}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Select Type"
                  options={selectionOption}
                  value={material.selType}
                  onChange={(e) =>
                    setMaterial((material) => {
                      return { ...material, selType: e };
                    })
                  }
                />
                {/* <Select
                /> */}
              </div>
            </Col>
          </Row>

          <div style={{ height: "80%", marginTop: "25px" }}>
            <MyDataTable hideHeaderMenu data={hsnData} columns={column} />
          </div>

          <Row gutter={16}>
            <Col span={24}>
              <div style={{ textAlign: "end" }}>
                <Button
                  onClick={resetFunction}
                  style={{
                    marginTop: "5px",
                    marginRight: "5px",
                    backgroundColor: "red",
                    color: "white",
                  }}
                >
                  Reset
                </Button>
                <Button onClick={addComponent} type="primary">
                  Save
                </Button>
              </div>
            </Col>
          </Row>
        </Col>

        <Col span={12} style={{ height: "100%" }}>
          <div style={{ height: "95%" }}>
            <Skeleton active loading={loading}>
              <MyDataTable
                loading={loading}
                data={component}
                columns={columns}
              />
            </Skeleton>
          </div>
        </Col>
      </Row>
      <MaterialUpdate
        materialModal={materialModal}
        setMaterialModal={setMaterialModal}
        allComponent={allComponent}
      />
    </div>
  );
};

export default Material;
