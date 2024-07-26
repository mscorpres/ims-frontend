import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import { Col, Input, Row } from "antd";
import { toast } from "react-toastify";
import MyDataTable from "@/Components/MyDataTable";
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import MyAsyncSelect from "@/Components/MyAsyncSelect";
import { imsAxios } from "@/axiosInterceptor";
import { getComponentOptions } from "@/api/general.ts";
import useApi from "@/hooks/useApi.ts";
import MyButton from "@/Components/MyButton";
import MySelect from "@/Components/MySelect.jsx";
import { fetchLocations } from "@/api/general.ts";
import { convertSelectOptions } from "@/utils/general";

function CreatePhysicalProduction() {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [locationOpitons, setLocationOptions] = useState([]);
  const [datee, setDatee] = useState([]);
  // const [availData, setAvailData] = useState({});
  const { executeFun, loading: loading1 } = useApi();
  const [searchInput, setSearchInput] = useState("");
  const [allData, setAllData] = useState({
    selType: "",

    component: [],
    existStock: [],
    physicalStock: [],
    uom: [],
    remark: [],
  });

  const getComponent = async (e) => {
    if (e?.length > 2) {
      const response = await executeFun(() => getComponentOptions(e), "select");
      const { data } = response;
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const handleFetchLocations = async () => {
    const response = await executeFun(() => fetchLocations("", "sf"), "select");

    const arr = convertSelectOptions(response.data);
    setLocationOptions(arr);
  };

  const [addrow, setAddRom] = useState([
    {
      id: v4(),
      comp: "",
      eStick: "",
      phyStock: "",
      location: "",
      u: "",
      rem: "",
    },
  ]);

  const getFound = (id) => {
    return addrow.find((row) => row.id === id);
  };

  const inputHandler = async (name, id, value) => {
    const found = getFound(id);
    if (name == "comp") {
      let qty = "";
      let unit = "";
      if (found?.location && value) {
        const { data } = await imsAxios.post("/audit/RMStock", {
          component: value,
          location: found?.location,
        });
        qty = data?.data.available_qty;
        unit = data?.data.unit;
      }

      // console.log(data.data);

      setAddRom((comp) =>
        comp.map((h) => {
          if (h.id == id) {
            {
              return { ...h, comp: value, eStick: qty, u: unit };
            }
          } else {
            return h;
          }
        })
      );
    } else if (name == "phyStock") {
      setAddRom((phyStock) =>
        phyStock.map((h) => {
          if (h.id == id) {
            {
              return { ...h, phyStock: value };
            }
          } else {
            return h;
          }
        })
      );
    } else if (name == "rem") {
      setAddRom((rem) =>
        rem.map((h) => {
          if (h.id == id) {
            {
              return { ...h, rem: value };
            }
          } else {
            return h;
          }
        })
      );
    } else if (name == "location") {
      let qty = "";
      let unit = "";
      if (found?.comp && value) {
        const { data } = await imsAxios.post("/sfPhysical/sfStock", {
          location: value,
          component: found?.comp,
        });
        qty = data?.available_qty;
        unit = data?.unit;
      }

      // console.log(data.data);

      setAddRom((comp) =>
        comp.map((h) => {
          if (h.id == id) {
            {
              return { ...h, location: value, eStick: qty, u: unit };
            }
          } else {
            return h;
          }
        })
      );
    }
  };

  const plusRow = () => {
    setAddRom((addrow) => [
      ...addrow,
      {
        id: v4(),
        comp: "",
        rem: "",
        phyStock: "",
        uom: "",
        rem: "",
      },
    ]);
  };

  const minusRow = (id) => {
    setAddRom((addrow) => {
      return addrow.filter((row) => row.id != id);
    });
  };

  const savePhysical = async () => {
    let comName = [];
    let existStock = [];
    let phyisalStock = [];
    let remarkArr = [];

    addrow.map((a) => comName.push(a.comp));
    addrow.map((a) => existStock.push(a.eStick));
    addrow.map((a) => phyisalStock.push(a.phyStock));
    addrow.map((a) => remarkArr.push(a.rem));
    setLoading(true);
    const response = await imsAxios.post("/sfPhysical/saveAudit", {
      // branch: "BRMSC012",
      component: comName,
      closing: existStock,
      audit: phyisalStock,
      remark: remarkArr,
      location: addrow.map((row) => row.location),
    });
    setLoading(false);
    console.log(response);
    if (response.success) {
      setAddRom([
        {
          id: v4(),
          comp: "",
          eStick: "",
          phyStock: "",
          u: "",
          rem: "",
        },
      ]);
      toast.success("Success");
    } else if (data.code == 500) {
      toast.error("Something Went Wrong");
      setLoading(false);
    }
  };

  const resetFunction = () => {
    setAddRom([
      {
        id: v4(),
        comp: "",
        eStick: "",
        phyStock: "",
        u: "",
        rem: "",
      },
    ]);
  };

  const columns = [
    {
      headerName: (
        <span onClick={plusRow}>
          <PlusCircleTwoTone
            style={{ cursor: "pointer", fontSize: "1.0rem" }}
          />
        </span>
      ),
      width: 100,
      field: "add",

      // width: "5
      sortable: false,
      renderCell: ({ row }) =>
        addrow.findIndex((r) => r.id == row.id) >= 1 && (
          <MinusCircleTwoTone
            onClick={() => minusRow(row?.id)}
            style={{ fontSize: "1.0rem", cursor: "pointer" }}
          />
        ),
      // sortable: false,
    },

    {
      headerName: "Part/Part Name",
      field: "product",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          style={{ width: "100%" }}
          onBlur={() => setAsyncOptions([])}
          onInputChange={(e) => setSearchInput(e)}
          loadOptions={getComponent}
          selectLoading={loading1("select")}
          value={addrow?.comp}
          optionsState={asyncOptions}
          onChange={(e) => inputHandler("comp", row.id, e)} // value={addRowData.product}
        />
      ),
    },
    {
      headerName: "Location",
      field: "location",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <MySelect
          style={{ width: "100%" }}
          value={addrow?.location}
          options={locationOpitons}
          onChange={(e) => inputHandler("location", row.id, e)} // value={addRowData.product}
        />
      ),
    },
    {
      headerName: "IMS Stock",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Input
          placeholder="---"
          disabled
          value={row.eStick ? `${row.eStick} ${row.u}` : "0"}
        />
      ),
    },
    {
      headerName: "Physical Stock",
      field: "quantity ",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Input
          placeholder="Qty"
          onChange={(e) => inputHandler("phyStock", row.id, e.target.value)}
        />
      ),
    },
    {
      headerName: "Remark",
      field: "remarks ",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Input
          placeholder="Remark"
          value={addrow?.remarks}
          onChange={(e) => inputHandler("rem", row.id, e.target.value)}
        />
      ),
    },
  ];

  useEffect(() => {
    handleFetchLocations();
  }, []);
  return (
    <div>
      <div style={{ height: "79%" }}>
        <div style={{ height: "75vh", margin: "10px" }}>
          <MyDataTable data={addrow} columns={columns} hideHeaderMenu />
        </div>
      </div>
      <Row gutter={16}>
        <Col span={24}>
          <div style={{ textAlign: "end", margin: "10px" }}>
            <MyButton
              variant="reset"
              onClick={resetFunction}
              style={{
                marginRight: "5px",
              }}
            >
              Reset
            </MyButton>
            <MyButton
              onClick={savePhysical}
              loading={loading}
              type="primary"
              variant="add"
            >
              Save
            </MyButton>
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default CreatePhysicalProduction;
