import { imsAxios } from "@/axiosInterceptor";
import React, { useEffect, useState } from "react";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import MySelect from "@/Components/MySelect";
import { Card, Col, Form, Input, Row, Space, Upload } from "antd";
import MyDataTable from "@/Components/MyDataTable";
import MyAsyncSelect from "@/Components/MyAsyncSelect";
import NavFooter from "@/Components/NavFooter";
import { CommonIcons } from "@/Components/TableActions.jsx/TableActions";

import useApi from "@/hooks/useApi.ts";
import { getProductsOptions } from "@/api/general.ts";

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
  const [loading1, setLoading1] = useState(false);

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

    setskuoptions(data);
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
    skuarr = data?.data?.map((d) => {
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
  const locationList = async (search) => {
    const { data } = await imsAxios.post("/backend/fetchLocation", {
      searchTerm: search,
    });
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
    let qa_process_key = [];
    //extracting data from inputs to send
    qaProcessInputs.map((item) => processLevelarr.push(item.processLevel));
    qaProcessInputs.map((item) => processRemarkarr.push(item.processRemark));
    qaProcessInputs.map((item) => lotSizearr.push(item.lot_size));
    qaProcessInputs.map((item) =>
      process.push(item.process?.value ?? item.process)
    );
    qaProcessInputs.map((item) => subject.push(item.bom?.value ?? item.bom));
    qaProcessInputs.map((item) =>
      bomrequired.push(item.bomRequired?.value ?? item.bomRequired)
    );
    qaProcessInputs.map((item) =>
      processLoc.push(item.ProcessLocation?.value ?? item.ProcessLocation)
    );
    qaProcessInputs.map((item) =>
      passLoc.push(item.passLocation?.value ?? item.passLocation)
    );
    qaProcessInputs.map((item) =>
      FailLoc.push(item.failLocation?.value ?? item.failLocation)
    );
    qaProcessInputs.map((item) =>
      qa_process_key.push(item.qa_process_key ?? null)
    );
    qaProcessInputs.map((item) => sku.push(item.sku?.value ?? item.sku));
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
    qaProcessData.qa_process_key = qa_process_key;
    console.log(qaProcessData);
    setLoading1("submit");
    const response = await imsAxios.post(
      "/qaProcessmaster/updateMappedQAProcess",
      qaProcessData
    );
    setLoading1(false);
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

      setQaProcessData({ sku: "" });
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

  const handleFetchPreviousEntries = async () => {
    setLoading1("prev");
    const response = await imsAxios.post("/qaProcessmaster/fetchQAProcess", {
      sku: qaProcessData.sku,
    });
    console.log("process response", response);
    setLoading1(false);
    let arr = [];
    if (response?.success) {
      arr = response.data.map((row, index) => ({
        id: index + 1,
        qa_process_key: row.qa_process_key,
        bomRequired: { text: row.bomrequired, value: row.bomrequired },
        bom: {
          text: row.bom.name,
          value: row.bom.id,
        },
        sku: {
          text: qaProcessData.sku,
          value: qaProcessData.sku,
        },
        process: {
          text: row.process.name,
          value: row.process.key,
        },
        processLevel: row.qa_process_level,
        ProcessLocation: {
          text: row.process_loc.name,
          value: row.process_loc.key,
        },
        passLocation: {
          text: row.pass_loc.name,
          value: row.pass_loc.key,
        },
        failLocation: {
          text: row.fail_loc.name,
          value: row.fail_loc.key,
        },
        lot_size: row.qa_lot_size,
        processRemark: row.qa_process_remark,
      }));
      setQaProcessInput(arr);
      return {
        success: true,
        data: arr,
      };
    }
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
        <MySelect
          value={row.bomRequired}
          labelInValue={true}
          options={bomRequiredOptions}
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
        <MySelect
          loadOptions={bom}
          value={row.bom}
          labelInValue={true}
          options={bomoptions}
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
        <MySelect
          value={row.sku}
          loadOptions={getskulist}
          options={skuList}
          labelInValue={true}
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
          labelInValue={true}
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
          labelInValue={true}
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
          labelInValue={true}
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
          labelInValue={true}
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

  useEffect(() => {
    if (qaProcessData.sku) {
      handleFetchPreviousEntries(qaProcessData.sku);
    }
  }, [qaProcessData.sku]);

  return (
    <div style={{ height: "90%", width: "100%" }}>
      <Row
        gutter={6}
        style={{ padding: "0px 10px", height: "100%", width: "100%" }}
      >
        <Col span={4}>
          <Card size="small">
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
            loading={loading1 === "prev"}
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
        loading={loading1 === "submit"}
        disabled={qaProcessInputs?.length === 0}
        nextLabel={"Create Process Map"}
      />
    </div>
  );
};

export default QaProcessMap;
