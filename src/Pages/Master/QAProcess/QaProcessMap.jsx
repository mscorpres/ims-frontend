import { imsAxios } from "../../../axiosInterceptor";
import React, { useEffect, useState } from "react";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import MySelect from "../../../Components/MySelect";
import { Button, Card, Col, Form, Input, Row, Space, Upload } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import NavFooter from "../../../Components/NavFooter";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import { InboxOutlined } from "@ant-design/icons";
import useApi from "../../../hooks/useApi";
import { getProductsOptions } from "../../../api/general";
import Loading from "../../../Components/Loading";

const QaProcessMap = () => {
  //states of qaprocessMap

  const [qaProcessInputs, setQaProcessInput] = useState([
    {
      id: v4(),
      bomRequired: "",
      bom: "",
      process: "",
      processLevel: "",
      sku: "",
      ProcessLocation: "",
      passLocation: "",
      failLocation: "",
      lot_size: "",
      processRemark: "",
    },
  ]);
  const bomRequiredOptions = [
    { label: "YES", value: "YES" },
    { label: "NO", value: "NO" },
  ];

  const [qaProcessData, setQaProcessData] = useState({
    sku: "",
    sfg_sku: [],
    process: [],
    subject: [],
    bomRequired: [],
    processLevel: [],
    processRemark: [],
    processLoc: [],
    pass_loc: [],
    fail_loc: [],
    lot_size: [],
    // qa_process_key:[],
  });

  const [skuoptions, setskuoptions] = useState([]);
  const [bomoptions, SetBomOptions] = useState([]);
  const [formfield, setformfield] = useState(false);
  const [processListOptions, setProcessListOptions] = useState([]);
  const [locationlist, setLocationList] = useState([]);
  const [skuList, setskulist] = useState([]);

  const { executeFun, loading } = useApi();
  //get sku data
  const sku = async (e) => {
    setskuoptions("");
    setformfield(false);
    setQaProcessInput([
      {
        id: v4(),
        bomRequired: "",
        bom: "",
        process: "",
        processLevel: "",
        sku: "",
        ProcessLocation: "",
        passLocation: "",
        failLocation: "",
        lot_size: "",
        processRemark: "",
      },
    ]);
    const response = await executeFun(
      () => getProductsOptions(e, true),
      "select"
    );
    let { data } = response;
    let arr = [];
    arr = data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setskuoptions(arr);
    processList();
  };
  //get BOM for Single Product If bom Rquired
  const bom = async () => {
    const { data } = await imsAxios.post("/backend/fetchBomForProduct", {
      search: qaProcessData.sku,
    });
    let bomarr = [];
    bomarr = data.data.map((d) => {
      return { text: d.bomname, value: d.bomid };
    });
    SetBomOptions(bomarr);
    processList();
  };
  useEffect(() => {
    processList();
    locationList();
  }, []);

  const getskulist = async () => {
    const response = await imsAxios.post("backend/fetchallsfgForProduct", {
      search: qaProcessData.sku,
    });
    const { data } = response;
    let skuarr = [];
    skuarr = data.data.map((d) => {
      return { text: d.sfgid, value: d.sfgsku };
    });
    setskulist(skuarr);
  };

  // for view the list of processes
  const processList = async () => {
    const { data } = await imsAxios.post("/qaProcessmaster/view_process");
    let processArr = [];
    processArr = data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setProcessListOptions(processArr);
  };
  //to get location from database
  const locationList = async () => {
    const { data } = await imsAxios.post("/backend/fetchLocation");
    let locArr = [];
    locArr = data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setLocationList(locArr);
  };

  const handleyesno = (result) => {
    const updatedQaProcessInputs = result.map((item) => {
      if (item.bomRequired === "NO") {
        return { ...item, bom: "disabled" };
      } else {
        return item;
      }
    });
    let newQaprocessInput = [];
    newQaprocessInput.push(...updatedQaProcessInputs);
    console.log(newQaprocessInput);
    setQaProcessInput(newQaprocessInput);
  };

  const createQaProcess = async () => {
    let processLevelarr = [];
    let processRemarkarr = [];
    let lotSizearr = [];
    let process = [];
    let subject = [];
    let bomrequired = [];
    let processLoc = [];
    let passLoc = [];
    let FailLoc = [];
    let sku = [];
    //extracting data from inputs to send
    qaProcessInputs.map((item) => processLevelarr.push(item.processLevel));
    qaProcessInputs.map((item) => processRemarkarr.push(item.processRemark));
    qaProcessInputs.map((item) => lotSizearr.push(item.lot_size));
    qaProcessInputs.map((item) => process.push(item.process));
    qaProcessInputs.map((item) => subject.push(item.bom));
    qaProcessInputs.map((item) => bomrequired.push(item.bomRequired));
    qaProcessInputs.map((item) => processLoc.push(item.ProcessLocation));
    qaProcessInputs.map((item) => passLoc.push(item.passLocation));
    qaProcessInputs.map((item) => FailLoc.push(item.failLocation));
    qaProcessInputs.map((item) => sku.push(item.sku));
    //adding arrays in Payload
    qaProcessData.processLevel = processLevelarr;
    qaProcessData.lot_size = lotSizearr;
    qaProcessData.processRemark = processRemarkarr;
    qaProcessData.bomRequired = bomrequired;
    qaProcessData.fail_loc = FailLoc;
    qaProcessData.pass_loc = passLoc;
    qaProcessData.processLoc = processLoc;
    qaProcessData.subject = subject;
    qaProcessData.process = process;
    qaProcessData.sfg_sku = sku;
    console.log(qaProcessData);
    const response = await imsAxios.post(
      "/qaProcessmaster/createQAProcess",
      qaProcessData
    );
    if (response.data.status === "success") {
      toast.success(response.data.message.msg);
      setQaProcessInput([
        {
          id: v4(),
          bomRequired: "",
          bom: "",
          process: "",
          processLevel: "",
          sku: "",
          ProcessLocation: "",
          passLocation: "",
          failLocation: "",
          lot_size: "",
          processRemark: "",
        },
      ]);
      qaProcessData.sku = "";
    } else if (response.status === 403) {
      toast.error(response.data?.message?.msg);
    } else {
      setQaProcessInput([
        {
          id: v4(),
          bomRequired: "",
          bom: "",
          process: "",
          processLevel: "",
          ProcessLocation: "",
          passLocation: "",
          failLocation: "",
          sku: "",
          lot_size: "",
          processRemark: "",
        },
      ]);
      qaProcessData.sku = "";
      toast.error("");
    }
  };
  // const fetchingSkuProcess = async() => {
  //      const {data} = await imsAxios.post('/qaProcessmaster/fetchQAProcess',{'sku': qaProcessData.sku});
  //      setQaProcessInput([
  //       {
  //         id: v4(),
  //         bomRequired: "",
  //         bom: "",
  //         process: "",
  //         processLevel: "",
  //         ProcessLocation: "",
  //         passLocation: "",
  //         failLocation: "",
  //         lot_size:'',
  //         processRemark:''
  //       },
  //     ])
  //      if (data.status === 'success') {
  //       // setButtonView(false);
  //       const newRows = data.data.map((item) => ({
  //         id: item.qa_process_key,
  //         bomRequired: item.bom_required,
  //         bom: item.subject_name,
  //         process: item.process_name,
  //         processLevel: item.qa_process_level,
  //         ProcessLocation: item.process_loc_name,
  //         passLocation: item.process_pass_loc_name,
  //         failLocation: item.process_fail_loc_name,
  //         lot_size: item.lot_size,
  //         processRemark: item.qa_process_remark,
  //       }));
  //       // const prevInputs = qaProcessInputs
  //       const inputdata = () => [...newRows]
  //       const result = inputdata();
  //       setQaProcessInput(result);
  //       console.log()
  //       handleyesno(result);
  //       bom()
  //       processList();
  //       locationList();

  //     }else if (data.status === 'error' ){
  //           //  setButtonView(true)
  //            setQaProcessInput([
  //             {
  //               id: v4(),
  //               bomRequired: "",
  //               bom: "",
  //               process: "",
  //               processLevel: "",
  //               ProcessLocation: "",
  //               passLocation: "",
  //               failLocation: "",
  //               lot_size:'',
  //               processRemark:''
  //             },
  //           ])
  //      }
  // }

  // const updateProcessMap = async() => {
  //   let processkey = []
  //   let processLevelarr = []
  //   let processRemarkarr = []
  //   let lotSizearr = []
  //   let process = []
  //   let subject = []
  //   let bomrequired = []
  //   let processLoc = []
  //   let passLoc = []
  //   let FailLoc = []
  //   //extracting data from inputs to send
  //   qaProcessInputs.map((item)=> processLevelarr.push(item.processLevel))
  //   qaProcessInputs.map((item)=> processRemarkarr.push(item.processRemark))
  //   qaProcessInputs.map((item)=> lotSizearr.push(item.lot_size))
  //   qaProcessInputs.map((item)=> process.push(item.process))
  //   qaProcessInputs.map((item)=> subject.push(item.bom))
  //   qaProcessInputs.map((item)=> bomrequired.push(item.bomRequired))
  //   qaProcessInputs.map((item)=> processLoc.push(item.ProcessLocation))
  //   qaProcessInputs.map((item)=> passLoc.push(item.passLocation))
  //   qaProcessInputs.map((item)=> FailLoc.push(item.failLocation))
  //   qaProcessInputs.map((item)=> processkey.push(item.id))
  //   //adding arrays in Payload
  //   qaProcessData.qa_process_key = processkey
  //   qaProcessData.processLevel = processLevelarr;
  //   qaProcessData.lot_size= lotSizearr;
  //   qaProcessData.processRemark= processRemarkarr;
  //   qaProcessData.bomRequired= bomrequired;
  //   qaProcessData.fail_loc= FailLoc;
  //   qaProcessData.pass_loc= passLoc;
  //   qaProcessData.processLoc= processLoc;
  //   qaProcessData.subject= subject ;
  //   qaProcessData.process= process;

  //   const response = await imsAxios.post('/qaProcessmaster/updateMappedQAProcess',qaProcessData);
  //   if(response.data.status === 'success'){
  //     toast.success(response.data.message.msg)
  //     setQaProcessInput([
  //       {
  //         id: v4(),
  //         bomRequired: "",
  //         bom: "",
  //         process: "",
  //         processLevel: "",
  //         ProcessLocation: "",
  //         passLocation: "",
  //         failLocation: "",
  //         lot_size:'',
  //         processRemark:''
  //       },
  //     ])
  //     qaProcessData.sku = ""
  //   }else {
  //     toast.error('')
  //   }

  // }

  const filterskuoptions = (value, skuoptions) => {
    qaProcessData.sku = value;
    bom(value);
    //  fetchingSkuProcess()
    setformfield(true);
  };

  const qaProcessDataHandler = (field, e, value, rowIndex, selectedValue) => {
    const updatedQaProcessInputs = qaProcessInputs.map((input) => {
      if (input.id === value) {
        if (field === "bomRequired") {
          getskulist();
          // Handle "BOM Required" change here
          const updatedInput = {
            ...input,
            bomRequired: e,
            bom: e === "NO" ? "disabled" : "", // Update 'bom' based on 'e' value
          };
          bom();
          getskulist();
          return updatedInput;
        } else if (
          field === "bom" ||
          field === "process" ||
          field === "failLocation" ||
          field === "passLocation" ||
          field === "subject" ||
          field === "ProcessLocation" ||
          field === "sku"
        ) {
          // Handle other field changes here
          return { ...input, [field]: e };
        }
      }
      return input;
    });
    setQaProcessInput(updatedQaProcessInputs);
  };

  const qaInputHandler = (name, id, value) => {
    if (name == "processLevel") {
      setQaProcessInput((componentkey) =>
        componentkey.map((h) => {
          if (h.id == id) {
            {
              return { ...h, processLevel: value };
            }
          } else {
            return h;
          }
        })
      );
    } else if (name == "lot_size") {
      setQaProcessInput((componentkey) =>
        componentkey.map((h) => {
          if (h.id == id) {
            {
              return { ...h, lot_size: value };
            }
          } else {
            return h;
          }
        })
      );
    } else if (name == "processRemark") {
      setQaProcessInput((componentkey) =>
        componentkey.map((h) => {
          if (h.id == id) {
            {
              return { ...h, processRemark: value };
            }
          } else {
            return h;
          }
        })
      );
    }
    setQaProcessInput((componentkey) => {
      if (componentkey.id == id) {
        return {
          ...componentkey,
          [name]: value,
        };
      } else {
        return componentkey;
      }
    });
  };

  const addQaProcessInput = () => {
    setQaProcessInput((qaProcessInputs) => [
      ...qaProcessInputs,
      {
        id: v4(),
        bomRequired: "",
        bom: "",
        process: "",
        processLevel: "",
        ProcessLocation: "",
        passLocation: "",
        failLocation: "",
        processRemark: "",
        lot_size: "",
      },
    ]);
  };
  const removeQaProcessInput = (id) => {
    setQaProcessInput((qaProcessInputs) => {
      return qaProcessInputs.filter((row) => row.id != id);
    });
  };

  const columns = [
    {
      renderHeader: () => (
        <CommonIcons action="addRow" onClick={addQaProcessInput} />
      ),
      width: 20,
      field: "add",

      // width: "5
      sortable: false,

      renderCell: ({ row }) =>
        qaProcessInputs.indexOf(row) >= 1 && (
          <CommonIcons
            action="removeRow"
            onClick={() => removeQaProcessInput(row?.id)}
          />
        ),
      // sortable: false,
    },

    {
      headerName: "Bomrequired",
      field: "bomRequired",
      sortable: false,
      width: 120,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          value={row.bomRequired}
          optionsState={bomRequiredOptions}
          onChange={(e, selectedValue) =>
            qaProcessDataHandler("bomRequired", e, row.id, selectedValue)
          }
          placeholder="Select BOM Requirement"
        />
      ),
    },
    {
      headerName: "BOM",
      field: "bom",
      width: 180,
      sortable: false,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          loadOptions={bom}
          value={row.bom}
          optionsState={bomoptions}
          placeholder="Select Bom"
          onChange={(e, selectedValue) =>
            qaProcessDataHandler("bom", e, row.id, selectedValue)
          }
          disabled={row.bom === "disabled"} // Check the BOM field status for this row
        />
      ),
    },
    {
      headerName: "SKU",
      field: "sku",
      sortable: false,
      width: 120,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          value={row.sku}
          loadOptions={getskulist}
          optionsState={skuList}
          onChange={(e, selectedValue) =>
            qaProcessDataHandler("sku", e, row.id, selectedValue)
          }
          placeholder="Select SKU"
        />
      ),
    },
    {
      headerName: "Process",
      field: "process",
      width: 200,
      sortable: false,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          loadOptions={processList}
          optionsState={processListOptions}
          value={row.process}
          placeholder="Select Process"
          onChange={(e, selectedValue) =>
            qaProcessDataHandler("process", e, row.id, selectedValue)
          }
        />
      ),
    },
    {
      headerName: "Process Level",
      field: "processLevel",
      width: 125,
      sortable: false,
      renderCell: ({ row }) => (
        <Input
          placeholder="Enter Process Level"
          value={row.processLevel}
          onChange={(e) =>
            qaInputHandler("processLevel", row.id, e.target.value)
          }
        />
      ),
    },
    {
      headerName: "Process Location",
      field: "processLocation",
      width: 130,
      sortable: false,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          loadOptions={locationList}
          optionsState={locationlist}
          value={row.ProcessLocation}
          placeholder="Select Location"
          onChange={(e, selectedValue) =>
            qaProcessDataHandler("ProcessLocation", e, row.id, selectedValue)
          }
        />
      ),
    },
    {
      headerName: "Pass Location",
      field: "passLocation",
      width: 130,
      sortable: false,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          loadOptions={locationList}
          optionsState={locationlist}
          value={row.passLocation}
          placeholder="Select pass Location"
          onChange={(e, selectedValue) =>
            qaProcessDataHandler("passLocation", e, row.id, selectedValue)
          }
        />
      ),
    },
    {
      headerName: "Fail Location",
      field: "failLocation",
      width: 130,
      sortable: false,
      renderCell: ({ row }) => (
        <MyAsyncSelect
          loadOptions={locationList}
          optionsState={locationlist}
          value={row.failLocation}
          placeholder="Select fail Location"
          onChange={(e, selectedValue) =>
            qaProcessDataHandler("failLocation", e, row.id, selectedValue)
          }
        />
      ),
    },
    {
      headerName: "Process Remark",
      field: "processRemark",
      width: 130,
      sortable: false,
      renderCell: ({ row }) => (
        <Input
          placeholder="Enter Process Remark"
          value={row.processRemark}
          onChange={(e) =>
            qaInputHandler("processRemark", row.id, e.target.value)
          }
        />
      ),
    },
    {
      headerName: "Lot Size",
      field: "lot_size",
      width: 120,
      sortable: false,
      renderCell: ({ row }) => (
        <Input
          placeholder="Enter Lot Size"
          value={row.lot_size}
          onChange={(e) => qaInputHandler("lot_size", row.id, e.target.value)}
        />
      ),
    },
  ];

  return (
    <div style={{ height: "90%", width: "100%" }}>
      <Row
        gutter={15}
        style={{ padding: "0px 10px", height: "100%", width: "100%" }}
      >
        <Col span={4}>
          <Card
            style={{
              height: "100%",
              maxHeight: "10rem",
              overflowY: "scroll",
              width: "100%",
            }}
          >
            <Form
              style={{ width: "100%", height: "100%" }}
              size="small"
              layout="vertical"
            >
              <Row>
                <Col span={24}>
                  <Form.Item label="SKU Number">
                    <MyAsyncSelect
                      loadOptions={(e) => sku(e)}
                      optionsState={skuoptions}
                      value={qaProcessData.sku}
                      onChange={(e) => filterskuoptions(e)}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col
          style={{
            opacity: formfield ? 1 : 0.5,
            pointerEvents: formfield ? "all" : "none",
            height: "100%",
            width: "100%",
          }}
          span={20}
        >
          <MyDataTable
            columns={columns}
            data={qaProcessInputs}
            hideHeaderMenu
          />
        </Col>
      </Row>
      <NavFooter
        resetFunction={() => {
          setQaProcessInput([
            {
              id: v4(),
              bomRequired: "",
              bom: "",
              process: "",
              sku: "",
              processLevel: "",
              ProcessLocation: "",
              passLocation: "",
              failLocation: "",
            },
          ]);
        }}
        // loading={submitLoading}
        submitFunction={createQaProcess}
        nextLabel={"Create Process Map"}
      />
    </div>
  );
};

export default QaProcessMap;
