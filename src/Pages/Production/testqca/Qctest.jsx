import { Col, Form, Row, Space, Modal, Button, Card, Flex } from "antd";
import Input from "antd/es/input/Input";
import React, { useState, useEffect, useRef } from "react";
import MySelect from "../../../Components/MySelect";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import { imsAxios } from "../../../axiosInterceptor";
import printFunction from "../../../Components/printFunction";

const Qctest = () => {
  //COMPONENET FUNCTIONS AND STATES
  const passbutton = useRef();
  const [modaltype, setModalType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lotStatus, setLotStatus] = useState(true);
  const [inputQrNumber, setInputQrNumber] = useState("");
  const [hidefail, sethidefail] = useState({ display: "none" });
  const [buttonloading, setbuttonloading] = useState("");
  const [buttonstyle, setbuttonstyle] = useState("pointer");
  const [closetype, setclosetype] = useState(true);

  const showModal = (e) => {
    e === "AUTO" ? setModalType(e) : setModalType(e.target.id);
    setIsModalOpen(true);
  };

  const qrInput = async (e) => {
    e.key === "Enter" ? showModal(e) : console.log();
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    passbutton.current.style.display = "";
    sethidefail({ display: "none" });
  };

  const rules = {
    pprno: [
      {
        required: true,
        message: "Please Select a PPR Number!",
      },
    ],
  };
  const formatDateTime = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const sec = String(now.getSeconds()).padStart(2, "0");
    const formattedDate = `${day}-${month}-${year}`;
    const formattedTime = ` ${hours}:${minutes}:${sec}`;
    return { formattedDate: formattedDate, formattedTime: formattedTime };
  };

  const [ScanData, setScanData] = useState([]);

  const Column = [
    {
      field: "date",
      headerName: "Date",
      width: 250,
    },
    {
      field: "time",
      headerName: "Time",
      width: 250,
    },
    {
      field: "QRNumber",
      headerName: "QRNumber",
      width: 250,
    },
    {
      field: "Status",
      headerName: "Status",
      width: 250,
    },
  ];
  // Data States FOR INPUT AND OUTPUT
  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    productName: "",
  });
  const [locationDetails, setLocationDetails] = useState({
    testingLocation: "",
    passedLocation: "",
    failedLocation: "",
  });
  const [productDetails, setProductDetails] = useState({
    scannedQuantity: "",
    passedQuantity: "",
    failedQuantity: "",
    remainingQuantity: "",
    totalQuantity: "",
  });

  const [processLevel, setProcessLevel] = useState("Process Level");
  const [skuNumber, setSkuNumber] = useState("SKU Code");
  const [pprNo, setPprNo] = useState("");
  const [pproptions, setPproptions] = useState("");
  const [processOptions, setProcessOptions] = useState("");
  const [processData, setProcessData] = useState("");
  const [currentscan, setCurrentScan] = useState(0);
  const [passedscan, setPassedScan] = useState(0);
  const [failedscan, setFailedScan] = useState(0);
  const [totallotscan, setTotalLotScan] = useState(0);
  const [failbuttonfun, SetFailButtonFun] = useState(true);
  const [failreason, SetFailReason] = useState("");
  const [processid, setProcessId] = useState("");
  const [accesstoken, setAccesstoken] = useState("");
  const [faillist, setfaillist] = useState("");
  const [defaultLotsize, setdefaultlotsize] = useState(0);
  console.log("set process data", processData);
  //API FUNCTIONS
  //1) PPR SEARCH API
  const getAllPPR = async (e) => {
    const response = await imsAxios.post("/createqca/getPprNo", {
      searchTerm: e,
    });
    const data = response.data;
    let arr = [];
    arr = data.map((d) => {
      return { text: d.text, value: d.id };
    });
    setPproptions(arr);
  };
  const fetchSinglePPR = async (e) => {
    setProcessOptions("");
    const { data } = await imsAxios.post("createqca/fetchPprDetails", {
      ppr_no: e,
    });
    setPprNo(e);
    setCustomerDetails({
      customerName: data.data[0].customer_name,
      productName: data.data[0].product_name,
    });
    setProductDetails({
      scannedQuantity: "",
      passedQuantity: "",
      failedQuantity: "",
      remainingQuantity: "",
      totalQuantity: data.data[0].total_qty,
    });
    setAccesstoken(data.data[0].access_token);
    setSkuNumber(data.data[0].product_sku);
    getProcessofSku(data.data[0].product_sku);
  };
  //2) PROCESS SEARCH API
  const getProcessofSku = async (skucode) => {
    const { data } = await imsAxios.post("qaProcessmaster/fetchQAProcess", {
      sku: skucode,
    });
    if (data.status === "error") {
      toast.error(data.message.msg);
      setProcessOptions([]);
      return;
    }
    setProcessData(data.data);
    let arr = [];
    arr = data.data.map((d) => {
      return { text: d.process.name, value: d.process.key };
    });
    setProcessOptions(arr);
  };
  const handleProcessSelect = (e) => {
    const item = processData.find((item) => item.process.key === e);
    if (item) {
      setLocationDetails({
        testingLocation: item.process_loc.name,
        passedLocation: item.pass_loc.name,
        failedLocation: item.fail_loc.name,
      });
      setProcessLevel(item.qa_process_level);
      setProcessId(item.process.key);
    }
    const lot = Number(item.qa_lot_size);
    setdefaultlotsize(lot);
    getscanneddata(e, lot);
  };
  //3)ADD SINGLE ENTRY FOR PASS AND FAIL

  const handlePass = async () => {
    setbuttonloading("diasbled");
    setbuttonstyle("not-allowed");
    const dateandtime = formatDateTime();
    const scaannn = {
      id: v4(),
      date: dateandtime.formattedDate,
      time: dateandtime.formattedTime,
      QRNumber: inputQrNumber,
      Status: "PASS",
    };
    const passSendData = {
      bar_code: inputQrNumber,
      qca_ppr: pprNo,
      qca_process: processid,
      qca_result: "PASS",
      failReason: "--",
      correction: "--",
    };
    const { data } = await imsAxios.post(
      "/createqca/insert_qca_process",
      passSendData
    );
    setbuttonloading("");
    setbuttonstyle("pointer");
    if (data.status === "success") {
      setScanData([...ScanData, scaannn]);
      toast.success(data.message.msg);
      setCurrentScan(currentscan + 1);
      setPassedScan(passedscan + 1);
      var x = passedscan + 1;
      setInputQrNumber("");
      setIsModalOpen(false);
      console.log(x);
    }
    setInputQrNumber("");
    setIsModalOpen(false);
    if (x === defaultLotsize) {
      console.log(x);
      setclosetype(false);
      showModal("AUTO");
    }
  };

  const handleFail = () => {
    passbutton.current.style.display = "none";
    sethidefail({ display: "", marginBottom: "10px", marginTop: "10px" });
    SetFailButtonFun(true);
  };

  const failsubmit = async () => {
    setbuttonloading("diasbled");
    setbuttonstyle("not-allowed");
    const dateandtime = formatDateTime();
    const scaannn = {
      id: v4(),
      date: dateandtime.formattedDate,
      time: dateandtime.formattedTime,
      QRNumber: inputQrNumber,
      Status: "FAIL",
    };

    const failSendData = {
      bar_code: inputQrNumber,
      qca_ppr: pprNo,
      qca_process: processid,
      qca_result: "FAIL",
      failReason: failreason,
      correction: "--",
    };

    const { data } = await imsAxios.post(
      "/createqca/insert_qca_process",
      failSendData
    );
    setbuttonloading("");
    setbuttonstyle("pointer");
    if (data.status === "success") {
      setScanData([...ScanData, scaannn]);
      toast.success(data.message.msg);
      setFailedScan(failedscan + 1);
      var x = failedscan + 1;
      setCurrentScan(currentscan + 1);
      SetFailReason("");
    }
    setInputQrNumber("");
    setIsModalOpen(false);
    SetFailButtonFun(true);
    SetFailReason("");
    passbutton.current.style.display = "";
    sethidefail({ display: "none" });
    if (x === defaultLotsize) {
      setLotStatus(false);
      setclosetype(false);
      showModal("AUTO");
    }
  };

  const handlefailinput = (e) => {
    SetFailReason(e);
    SetFailButtonFun(false);
  };

  const getfaillist = async () => {
    const { data } = await imsAxios.get("/createqca/getDefectNames");
    let arr = [];
    arr = data.map((item) => {
      return { text: item.defect_name, value: item.problem_key };
    });
    setfaillist(arr);
  };
  useEffect(() => {
    getfaillist();
  }, []);

  //4)generate QR AUTO AND MANUAL
  const lottransfer = async (e) => {
    setbuttonloading("diasbled");
    setbuttonstyle("not-allowed");

    const lotstatusid = e.target.id;
    let barcodearray = [];

    ScanData.map((item) => {
      if (item.Status === lotstatusid) {
        barcodearray.push(item.QRNumber);
      }
    });
    const lottransferdata = {
      skucode: skuNumber,
      ppr_transaction: pprNo,
      process: processid,
      qca_barcode: barcodearray,
      accesstoken: accesstoken,
      result: lotstatusid,
    };
    const response = await imsAxios.post(
      "/createqca/lot_transfer",
      lottransferdata
    );
    const { data } = response;
    setbuttonloading("");
    setbuttonstyle("pointer");
    if (response.status === 200) {
      const lotnumber = data.Lot_No;
      const lotqty = data.Lot_Qty;
      const processnameqr = data.Process;
      Generateqrforlot(lotnumber, lotqty, lotstatusid, processnameqr);
      setIsModalOpen(false);
      setclosetype(true);
      setLotStatus(true);
      toast.success(data.message.msg);
    } else if (response.status === 403) {
      toast.error(data.message.msg);
    }
  };

  const Generateqrforlot = async (n, q, l, p) => {
    const generateqrdata = {
      Lot_Number: n,
      Lot_qty: q,
      Lot_type: l,
      PPR_No: pprNo,
      Sku: skuNumber,
      Process: p,
    };
    const response = await imsAxios.post(
      "qcalable/generateQcaLableforlot",
      generateqrdata
    );
    printFunction(response.data.data.buffer.data);
    if (l === "PASS") {
      const updatedscanData = ScanData.filter((item) => item.Status === "FAIL");
      setScanData(updatedscanData);
      setCurrentScan(updatedscanData.length);
      setPassedScan(0);
    } else {
      const updatedscanData = ScanData.filter((item) => item.Status === "PASS");
      setScanData(updatedscanData);
      setCurrentScan(updatedscanData.length);
      setFailedScan(0);
    }
  };

  //5) get scan data list
  const getscanneddata = async (e, lot) => {
    setScanData([]);
    setFailedScan(0);
    setPassedScan(0);
    setCurrentScan(0);
    const { data } = await imsAxios.post("/createqca/fetch_testing_data", {
      qca_ppr: pprNo,
      qca_process: e,
    });
    setScanData([]);
    const totalcounter = data.data.length;
    let passarr = [];
    let failarr = [];
    const faillength = data.data.filter((item) => item.result === "FAIL");
    const passlength = data.data.filter((item) => item.result === "PASS");
    setFailedScan(faillength.length);
    setPassedScan(passlength.length);
    setCurrentScan(totalcounter);
    const updatesscandata = data.data.map((item) => {
      const result = splitDateAndTime(item.insertdt);
      return {
        id: v4(),
        date: result.date,
        time: result.time,
        QRNumber: item.barcode,
        Status: item.result,
      };
    });
    setScanData(updatesscandata);
    if (faillength.length === lot) {
      setLotStatus(false);
      setclosetype(false);
      showModal("AUTO");
    } else if (passlength.length === lot) {
      showModal("AUTO");
      setclosetype(false);
    }
  };

  function splitDateAndTime(inputString) {
    try {
      // Split the input string into date and time parts
      const [datePart, timePart] = inputString.split(" ");

      // Ensure that both date and time parts are present
      if (datePart && timePart) {
        return {
          date: datePart,
          time: timePart,
        };
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  }

  return (
    <>
      <div
        style={{
          height: "95%",

          padding: "10px",
        }}
      >
        <Row gutter={[10, 10]}>
          <Col span={4}>
            {/* <Row>
              <Space> */}
            <Card>
              {" "}
              <Col span={24}>
                <Form.Item name="PPRNO" label="PPR NO." rules={rules.pprno}>
                  <MyAsyncSelect
                    value={pprNo}
                    optionsState={pproptions}
                    loadOptions={(e) => getAllPPR(e)}
                    onChange={(e) => {
                      fetchSinglePPR(e);
                    }}
                    placeholder="Enter the PPR NO."
                  />
                </Form.Item>
              </Col>{" "}
              <Col span={24}>
                <Form.Item name="Skuno" label="SKU">
                  <Input
                    style={{ width: "100%" }}
                    type="text"
                    placeholder={skuNumber}
                    disabled
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="Process" label="Process" rules={rules.pprno}>
                  <MySelect
                    options={processOptions}
                    onChange={(e, selectedValue) => {
                      handleProcessSelect(e, selectedValue);
                    }}
                    placeholder="Select the process"
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="Processlevel" label="Process Level">
                  <Input
                    style={{ width: "100%" }}
                    type="text"
                    placeholder={processLevel}
                    disabled
                  />
                </Form.Item>
              </Col>
            </Card>

            {/* </Space>
            </Row> */}
          </Col>

          <Col span={16}>
            <Card
              style={{
                // padding: "10px",
                height: "100%",
                // padding: "40px",
              }}
              bodyStyle={{ height: "10%" }}
              title={"SCAN DETAILS"}
            >
              <div
                style={{
                  // padding: "10px",
                  height: "30rem",
                  // padding: "40px",
                }}
              >
                {/* <Row
                  style={{
                    backgroundColor: "#cccccc",
                    padding: "10px",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h1>PCB SCAN DETAILS</h1>
                </Row> */}
                <Row style={{ justifyContent: "space-around" }}>
                  <Col span={15} style={{ marginRight: "23%" }}>
                    <Form.Item
                      // name="QRNumber"
                      label={
                        <b>
                          <p>QR Number</p>
                        </b>
                      }
                    >
                      <Input
                        style={{ width: "20%" }}
                        value={inputQrNumber}
                        type="text"
                        id="PCBTEST"
                        placeholder="Scan QR Code"
                        onChange={(e) => setInputQrNumber(e.target.value)}
                        onKeyDownCapture={(e) => {
                          qrInput(e);
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col>
                    <button
                      id="GenerateQR"
                      onClick={(e) => {
                        showModal(e);
                      }}
                      style={{
                        outline: "none",
                        color: "#04B0A8",
                        border: "solid 1PX #04B0A8",
                        padding: "6px 12px 6px 12px",
                        background: "rgba(0,0,0,0)",
                        borderRadius: "8px",
                        width: "119px",
                      }}
                    >
                      Generate QR
                    </button>
                  </Col>
                </Row>
                <div style={{ height: "95%" }}>
                  <MyDataTable data={ScanData} columns={Column} />
                </div>

                {/* <MyDataTable data={ScanData} columns={Column} /> */}
              </div>
            </Card>
          </Col>
          <Col span={4} style={{ height: "100%", overflow: "hidden" }}>
            <Flex
              gap={5}
              vertical
              style={{ height: "100%", overflowY: "auto" }}
            >
              <Card size="small" title={"Customer Details"}>
                <h4>Customer Name</h4>
                <p>{customerDetails.customerName}</p>
                <h4>Product Name</h4>
                <p>{customerDetails.productName}</p>
              </Card>
              <Card size="small" title={"Location Details"}>
                <h4>Testing Location</h4>
                <p>{locationDetails.testingLocation}</p>
                <h4>Passed Location</h4>
                <p>{locationDetails.passedLocation}</p>
                <h4>Failed Location</h4>
                <p>{locationDetails.failedLocation}</p>
              </Card>
              <Card size="small" title={"Product Details"}>
                <p>Scanned Quantity</p>
                <p>Passed Quantity</p>
                <p>Failed Quantity</p>
                <p>Remaning Quantity</p>
                <p>
                  <b>Total Quantity : {productDetails.totalQuantity}</b>
                </p>
              </Card>
              <Card size="small" title={"Current Scan Details"}>
                <p>Current Scanned: {currentscan}</p>
                <p>Passed Quantity: {passedscan}</p>
                <p>Failed Quantity: {failedscan}</p>
                <p>
                  <b>Total Lot Scanned: {totallotscan}</b>
                </p>
              </Card>
            </Flex>
          </Col>
        </Row>
      </div>
      <Modal
        open={isModalOpen}
        onCancel={handleCancel}
        footer={null}
        style={{ textAlign: "center" }}
        centered
        closable={closetype}
        maskClosable={closetype}
      >
        {(() => {
          switch (modaltype) {
            case "GenerateQR":
              return (
                <>
                  <h2>Generate QR Code:</h2>
                  <button
                    id="PASS"
                    disabled={buttonloading}
                    onClick={(e) => {
                      lottransfer(e);
                    }}
                    style={{
                      cursor: buttonstyle,
                      outline: "none",
                      marginBottom: "20px",
                      marginTop: "20px",
                      color: "#fff",
                      border: "solid #04B0A8",
                      padding: "6px 12px 6px 12px",
                      background: "#04B0A8",
                      borderRadius: "8px",
                      width: "183px",
                    }}
                  >
                    Passed Lot
                  </button>
                  <br />
                  <button
                    id="FAIL"
                    disabled={buttonloading}
                    onClick={(e) => {
                      lottransfer(e);
                    }}
                    style={{
                      cursor: buttonstyle,
                      outline: "none",
                      color: "#fff",
                      border: "solid #FF4D4D",
                      padding: "6px 12px 6px 12px",
                      background: "#FF4D4D",
                      borderRadius: "10px",
                      width: "183px",
                    }}
                  >
                    Failed Lot
                  </button>
                </>
              );
            case "PCBTEST":
              return (
                <>
                  <h2>QR Number:</h2>
                  <button
                    onClick={handlePass}
                    disabled={buttonloading}
                    ref={passbutton}
                    style={{
                      cursor: buttonstyle,
                      outline: "none",
                      marginRight: "20px",
                      marginTop: "20px",
                      color: "#fff",
                      border: "solid #04B0A8",
                      padding: "6px 12px 6px 12px",
                      background: "#04B0A8",
                      borderRadius: "8px",
                      width: "81px",
                    }}
                  >
                    {" "}
                    {"\u2713"} Pass
                  </button>
                  <MyAsyncSelect
                    optionsState={faillist}
                    onChange={(e) => {
                      handlefailinput(e);
                    }}
                    value={failreason}
                    placeholder="select fail reason"
                    style={hidefail}
                  />

                  <button
                    disabled={buttonloading}
                    onClick={failbuttonfun ? handleFail : failsubmit}
                    style={{
                      cursor: buttonstyle,
                      outline: "none",
                      color: "#fff",
                      border: "solid #FF4D4D",
                      padding: "6px 12px 6px 12px",
                      background: "#FF4D4D",
                      borderRadius: "10px",
                      width: "81px",
                    }}
                  >
                    {" "}
                    {"\u2716"} Fail
                  </button>
                </>
              );
            case "AUTO":
              return (
                <>
                  <p>
                    Lot of {defaultLotsize} Units Has Been Done For <br />{" "}
                    <b>{lotStatus ? "Passed PCBs" : "Failed PCBs"}</b>
                  </p>
                  <button
                    disabled={buttonloading}
                    id={lotStatus ? "PASS" : "FAIL"}
                    onClick={(e) => {
                      lottransfer(e);
                    }}
                    style={{
                      cursor: "pointer",
                      outline: "none",
                      marginRight: "20px",
                      marginTop: "20px",
                      color: "#fff",
                      border: "solid #04B0A8",
                      padding: "6px 12px 6px 12px",
                      background: "#04B0A8",
                      borderRadius: "8px",
                      width: "289px",
                    }}
                  >
                    Generate QR
                  </button>
                </>
              );
          }
        })()}
      </Modal>
    </>
  );
};

export default Qctest;
