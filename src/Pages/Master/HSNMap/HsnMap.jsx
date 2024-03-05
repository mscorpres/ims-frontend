import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import { Col, Form, Input, Row } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import NavFooter from "../../../Components/NavFooter";
import MyDataTable from "../../../Components/MyDataTable";
import { PlusCircleTwoTone, MinusCircleTwoTone } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import { getComponentOptions } from "../../../api/general";

import useApi from "../../../hooks/useApi";
const HsnMap = () => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [component, setComponenet] = useState({
    comp: "",
  });
  const [hstData, setHstData] = useState([]);
  console.log(hstData);

  const { executeFun, loading: loading1 } = useApi();
  const [rows, setRows] = useState([
    {
      id: v4(),
      hsnCode: "",
      tax: "",
    },
  ]);

  const addRows = () => {
    let arr = rows;
    arr = [
      ...arr,
      {
        id: v4(),
        hsnCode: "",
        tax: "",
      },
    ];
    setRows(arr);
  };

  const addRows1 = () => {
    let arr = hstData;
    arr = [
      ...arr,
      {
        id: v4(),
        hsnCode: "",
        tax: "",
      },
    ];
    setHstData(arr);
  };

  const removeRows = (id) => {
    let arr = rows;
    arr = arr.filter((row) => row.id != id);
    setRows(arr);
  };
  const removeRows1 = (id) => {
    let arr = hstData;
    arr = arr.filter((row) => row.id != id);
    setHstData(arr);
  };

  const getComponents = async (e) => {
    if (e.length > 2) {
      setSelectLoading(true);
      // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
      //   search: e,
      // });
      const response = await executeFun(() => getComponentOptions(e), "select");
      const { data } = response;
      setSelectLoading(false);
      let arr = [];
      if (data.code == 500) {
        arr = [];
      } else {
        arr = data.map((vList) => {
          return { text: vList.text, value: vList.id };
        });
      }
      // console.log("Array Vendor=>", arr);
      setAsyncOptions(arr);
    }
  };

  const getHsn = async (e) => {
    if (e.length > 2) {
      const { data } = await imsAxios.post("/backend/searchHsn", {
        searchTerm: e,
      });

      let arr = [];
      arr = data.map((vList) => {
        return { text: vList.text, value: vList.id };
      });
      // console.log("Array Vendor=>", arr);
      setAsyncOptions(arr);
    }
  };

  const inputHandler1 = (name, value, id) => {
    let arr = rows;
    arr = arr.map((row) => {
      if (row.id == id) {
        let obj = row;
        obj = {
          ...obj,
          [name]: value,
        };
        return obj;
      } else {
        return row;
      }
    });
    setRows(arr);
  };

  const inputHandler = async (name, id, value) => {
    console.log(name, id, value);
    if (name == "hsnlabel") {
      setHstData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, hsnlabel: value };
            }
          } else {
            return aa;
          }
        })
      );
    } else if (name == "hsntax") {
      setHstData((a) =>
        a.map((aa) => {
          if (aa.id == id) {
            {
              return { ...aa, hsntax: value };
            }
          } else {
            return aa;
          }
        })
      );
    }
  };

  const columns = [
    {
      renderHeader: () => (
        <PlusCircleTwoTone
          action="addRow"
          onClick={addRows1}
          style={{ fontSize: "15px" }}
        />
      ),
      field: "add",
      sortable: false,
      width: 50,
      renderCell: ({ row }) =>
        hstData.indexOf(row) >= 1 && (
          <MinusCircleTwoTone
            action="removeRow"
            onClick={() => removeRows1(row?.id)}
            style={{ fontSize: "15px" }}
          />
        ),
    },
    {
      headerName: "HSN Code",
      flex: 1,
      sortable: false,
      field: "hsnCode",
      renderCell: ({ row }) => (
        <MyAsyncSelect
          onBlur={() => setAsyncOptions([])}
          loadOptions={getHsn}
          optionsState={asyncOptions}
          value={row.hsnlabel}
          labelInValue
          selectLoading={selectLoading}
          onChange={(e) => inputHandler("hsnlabel", row.id, e)}
        />
      ),
    },
    {
      headerName: "Tax Percentage",
      width: 200,
      sortable: false,
      field: "tax",
      renderCell: ({ row }) => (
        <Input
          suffix="%"
          value={row.hsntax}
          onChange={(e) => inputHandler("hsntax", row.id, e.target.value)}
        />
      ),
    },
  ];

  const columns1 = [
    {
      renderHeader: () => (
        <PlusCircleTwoTone action="addRow" onClick={addRows} />
      ),
      field: "add",
      sortable: false,
      width: 50,
      renderCell: ({ row }) =>
        rows.indexOf(row) >= 1 && (
          <MinusCircleTwoTone
            action="removeRow"
            onClick={() => removeRows(row?.id)}
          />
        ),
    },
    {
      headerName: "HSN Code",
      flex: 1,
      sortable: false,
      field: "hsnCode",
      renderCell: ({ row }) => (
        <MyAsyncSelect
          onBlur={() => setAsyncOptions([])}
          loadOptions={getHsn}
          optionsState={asyncOptions}
          labelInValue
          selectLoading={selectLoading}
          onChange={(value) => inputHandler1("hsnCode", value, row.id)}
          value={row.hsnCode}
        />
      ),
    },
    {
      headerName: "Tax Percentage",
      width: 200,
      sortable: false,
      field: "tax",
      renderCell: ({ row }) => (
        <Input
          onChange={(e) => inputHandler1("tax", e.target.value, row.id)}
          suffix="%"
          value={row.tax}
        />
      ),
    },
  ];

  const submitHandler = async () => {
    if (component == "") {
      return toast.error("Please select a component");
    }
    let validationMessage = false;
    let arr = rows;
    arr.map((row) => {
      if (row.hsnCode == "") {
        validationMessage = "Please select a HSN Code";
      } else if (row.tax == "") {
        validationMessage = "Please input tax Percenrage";
      }
    });
    if (validationMessage) {
      return toast.error(validationMessage);
    }
    setSubmitLoading(true);
    const { data } = await imsAxios.post("/backend/mapHsn", {
      component: component.value,
      hsn: rows.map((row) => row.hsnCode.value),
      tax: rows.map((row) => row.tax),
    });
    setSubmitLoading(false);
    if (data.code == 200) {
      toast.success(data.message);
    } else {
      toast.error(data.message.msg);
    }
    // }
  };

  const compInputHandler = (name, value) => {
    setComponenet((component) => {
      return {
        ...component,
        [name]: value,
      };
    });
  };

  const getExistHsnData = async () => {
    const { data } = await imsAxios.post("/backend/fetchHsn", {
      component: component.comp.value,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setHstData(arr);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
    }
  };

  useEffect(() => {
    if (component.comp.value) {
      getExistHsnData();
    }
  }, [component.comp.value]);

  return (
    <div style={{ height: "95%" }}>
      {/* <InternalNav links={links} /> */}
      <Row gutter={16} style={{ padding: 10, height: "100%" }}>
        <Col span={8}>
          <Form layout="vertical">
            <Form.Item label="Component Name">
              <MyAsyncSelect
                onBlur={() => setAsyncOptions([])}
                loadOptions={getComponents}
                optionsState={asyncOptions}
                selectLoading={loading1("select")}
                value={component.comp}
                labelInValue
                onChange={(value) => {
                  compInputHandler("comp", value);
                }}
              />
            </Form.Item>
          </Form>
        </Col>
        <Col
          span={16}
          className="remove-table-footer remove-cell-border"
          style={{ height: "77%" }}
        >
          {hstData?.length > 1 ? (
            <MyDataTable columns={columns} data={hstData} hideHeaderMenu />
          ) : (
            <MyDataTable columns={columns1} data={rows} hideHeaderMenu />
          )}

          {/* {hstData.length < 0 && (
            <MyDataTable columns={columns1} data={rows} hideHeaderMenu />
          )} */}
        </Col>
      </Row>
      <NavFooter
        loading={submitLoading}
        nextLabel="Submit"
        submitFunction={submitHandler}
      />
    </div>
  );
};

export default HsnMap;
