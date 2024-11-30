import { Button, Card, Col, Form, Input, Row, Select, Space } from "antd";
import React, { useEffect, useState } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import { toast } from "react-toastify";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { AiFillEdit } from "react-icons/ai";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import EditTCS from "./EditTCSModal";
import MySelect from "../../../Components/MySelect";

function NatureofTCS() {
  const [newTCS, setNewTCS] = useState({
    code: "",
    name: "",
    description: "",
    percentage: "",
    ledger: "",
  });
  // console.log(newTCS);
  const [loading, setLoading] = useState(false);
  const [allGLDataa, setAllGLData] = useState([]);
  const [formLoading, setFormLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [selectLoading, setSelectLoading] = useState(false);
  const [TCSList, setTCSList] = useState([]);
  const [editingTCS, setEditingTCS] = useState(null);

  const inputHandler = (name, value) => {
    setNewTCS((newTCS) => {
      return {
        ...newTCS,
        [name]: value,
      };
    });
  };

  // const getGLCodes = async (searchInput) => {
  //   setSelectLoading(true);
  //   const { data } = await imsAxios.post(
  //     "/tally/tds/tds_ledger_options",
  //     {
  //       search: searchInput,
  //     }
  //   );
  //   setSelectLoading(false);
  //   let arr = [];
  //   if (!data.msg) {
  //     arr = data.data.map((d) => {
  //       return { text: d.text, value: d.id };
  //     });
  //     setAsyncOptions(arr);
  //   } else {
  //     setAsyncOptions([]);
  //   }
  // };

  const getTCSList = async () => {
    setLoading(true);
    setTCSList([]);
    const { data } = await imsAxios.get("/tally/tcs/list");
    if (data.code == 200) {
      const arr = data.data.map((row) => {
        return {
          ...row,
          id: v4(),
        };
      });
      setTCSList(arr);
    } else {
      toast.error(data.message.msg);
    }

    setLoading(false);
    // console.log(data);
  };

  // const
  const columns = [
    {
      headerName: "Action",

      type: "actions",
      field: "action",
      width: 65,
      getActions: ({ row }) => [
        <GridActionsCellItem
          icon={<AiFillEdit />}
          onClick={() => setEditingTCS(row)}
          // label="Delete"
        />,
      ],
    },

    {
      headerName: "Code",
      field: "tcsCode",
      renderCell: ({ row }) => (
        <ToolTipEllipses text={row.tcsCode} copy={true} />
      ),
      width: 130,
    },
    {
      headerName: "Name",
      field: "name",
      renderCell: ({ row }) => <ToolTipEllipses text={row.name} />,
      width: 150,
    },
    {
      headerName: "Description",
      field: "desc",
      renderCell: ({ row }) => <ToolTipEllipses text={row.desc} />,
      width: 200,
    },
    {
      headerName: "Percentage",
      field: "percentage",
      width: 90,
    },
    {
      headerName: "G/L Code",
      field: "glName",
      renderCell: ({ row }) => <ToolTipEllipses text={`${row.glName}`} />,
      flex: 1,
    },
    {
      headerName: "Status",
      field: "status",
      renderCell: ({ row }) => (
        <span
          style={{
            border: "1px solid #27E1C1",
            padding: "2px 10px",
            borderRadius: "4px",
            color: "#27E1C1",
          }}
        >
          {row.status}
        </span>
      ),
      flex: 1,
    },
  ];

  const getGLList = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.get(
      `/tally/tcs/tcsLedgerOptions?search=${search}`
    );
    setSelectLoading(false);
    let arr = [];
    if (!data.msg) {
      arr = data.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };

  const createTCS = async () => {
    const { code, name, description, percentage, ledger } = newTCS;
    if (!code || !name || !description || !percentage || !ledger) {
      toast.error("Please enter all the fields");
    } else {
      setFormLoading(true);
      const { data } = await imsAxios.post("/tally/tcs/add", {
        ...newTCS,
        ledger: newTCS.ledger,
      });
      setFormLoading(false);
      // console.log(data);
      if (data.code == 200) {
        getTCSList();
        toast.success(data.message);
        reset();
      } else {
        toast.error(data.message.msg);
      }
    }
  };

  const reset = () => {
    setNewTCS({
      code: "",
      name: "",
      description: "",
      percentage: "",
      ledger: "",
    });
  };
  useEffect(() => {
    getTCSList();
  }, []);

  return (
    <>
      <div style={{ height: "90%" }}>
        <Row
          gutter={8}
          style={{
            height: "100%",
            margin: "5px",
          }}
        >
          <Col span={8}>
            <Card title="Add New TCS" size="small">
              <Form size="small" layout="vertical">
                <Row gutter={10}>
                  <Col span={12}>
                    <Form.Item label="TCS Code">
                      <Input
                        size="middle"
                        value={newTCS.code}
                        placeholder="Enter New TCS Code..."
                        onChange={(e) => inputHandler("code", e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="TCS Name">
                      <Input
                        size="middle"
                        value={newTCS.name}
                        placeholder="Enter New TCS Name..."
                        onChange={(e) => inputHandler("name", e.target.value)}
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={10}>
                  <Col span={12}>
                    <Form.Item label="Description">
                      <Input
                        size="middle"
                        value={newTCS.description}
                        placeholder="Enter Description"
                        onChange={(e) =>
                          inputHandler("description", e.target.value)
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Percentage">
                      <Input
                        suffix="%"
                        size="middle"
                        value={newTCS.percentage}
                        placeholder="Enter Percentage"
                        onChange={(e) =>
                          inputHandler("percentage", e.target.value)
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={10}>
                  <Col span={24}>
                    <Form.Item label="GL Code..">
                      {/* <MySelect
                         options={allGLDataa}
                         value={newTCS.ledger}
                         onChange={(e) =>
                           inputHandler("ledger", e)
                         }
                       /> */}
                      <MyAsyncSelect
                        selectLoading={selectLoading}
                        onBlur={() => setAsyncOptions([])}
                        value={newTCS.ledger}
                        onChange={(value) => {
                          inputHandler("ledger", value);
                        }}
                        loadOptions={getGLList}
                        optionsState={asyncOptions}
                        defaultOptions
                        placeholder="Select G/L..."
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row justify="end">
                  <Col>
                    <Space
                      align="center"
                      style={{
                        height: "100%",
                        paddingTop: 7,
                      }}
                    >
                      <Button
                        size="default"
                        onClick={createTCS}
                        loading={formLoading}
                        type="primary"
                      >
                        Save
                      </Button>
                      <Button size="default" onClick={reset}>
                        Reset
                      </Button>
                      <CommonIcons
                        action="downloadButton"
                        disabled={true}
                        //  onClick={() =>
                        //    downloadCSV(TDSList, columns, "TDS Report")
                        //  }
                      />
                    </Space>
                  </Col>
                </Row>
              </Form>
            </Card>
          </Col>

          <Col
            span={16}
            className="remove-table-footer"
            style={{ height: "100%" }}
          >
            <MyDataTable loading={loading} columns={columns} data={TCSList} />
          </Col>
        </Row>
      </div>
      <EditTCS
        editingTCS={editingTCS}
        setEditingTCS={setEditingTCS}
        getTCSList={getTCSList}
      />
    </>
  );
}

export default NatureofTCS;
