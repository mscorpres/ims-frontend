import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import { Button, Col, DatePicker, Input, Row, Tabs } from "antd";
import { toast } from "react-toastify";
import MyDataTable from "../../../Components/MyDataTable";
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { getComponentOptions } from "../../../api/general.ts";
import useApi from "../../../hooks/useApi.ts";
import MyButton from "../../../Components/MyButton";
import PIAScan from "@/Pages/Store/MINLabel/PIAScan.tsx";
const { RangePicker } = DatePicker;

function CreatePhysical() {
  // console.log(addrow);

  return (
    <Tabs
      defaultActiveKey="1"
      // type="card"
      tabPosition="left"
      size={"small"}
      style={{ margin: 10, height: "95%" }}
      items={[
        {
          label: "Manual Entry",
          key: 1,
          children: <Manual />,
        },
        {
          label: "PIA",
          key: 2,
          style: { height: "100%" },
          children: <PIAScan />,
        },
      ]}
    />
  );
}

export default CreatePhysical;

const Manual = () => {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [datee, setDatee] = useState([]);
  // const [availData, setAvailData] = useState({});
  const { executeFun, laoding: loading1 } = useApi();
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
      // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: e,
      // });
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

  const [addrow, setAddRom] = useState([
    {
      id: v4(),
      comp: "",
      eStick: "",
      phyStock: "",
      u: "",
      rem: "",
    },
  ]);

  const inputHandler = async (name, id, value) => {
    // console.log(name, id, value);

    if (name == "comp") {
      const { data } = await imsAxios.post("/audit/RMStock", {
        component: value,
      });
      // console.log(data.data);
      const exist1 = data?.data.available_qty;
      const exist2 = data?.data.unit;

      setAddRom((comp) =>
        comp.map((h) => {
          if (h.id == id) {
            {
              return { ...h, comp: value, eStick: exist1, u: exist2 };
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
      },
    ]);
  };

  const minusRow = (id) => {
    setAddRom((addrow) => {
      return addrow.filter((row) => row.id != id);
    });
  };

  const savePhysical = async () => {
    setLoading(true);
    let comName = [];
    let existStock = [];
    let phyisalStock = [];
    let remarkArr = [];

    addrow.map((a) => comName.push(a.comp));
    addrow.map((a) => existStock.push(a.eStick));
    addrow.map((a) => phyisalStock.push(a.phyStock));
    addrow.map((a) => remarkArr.push(a.rem));

    const { data } = await imsAxios.post("/audit/saveAudit", {
      branch: "BRMSC012",
      component: comName,
      closing: existStock,
      audit: phyisalStock,
      remark: remarkArr,
    });

    console.log(data);
    if (data.code == 200) {
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
      setLoading(false);
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
          value={addrow?.comp}
          optionsState={asyncOptions}
          onChange={(e) => inputHandler("comp", row.id, e)} // value={addRowData.product}
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
                //   backgroundColor: "red",
                //   color: "white",
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
};
