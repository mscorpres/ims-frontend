import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Space,
  Typography,
  Modal,
  Card,
  Radio,
  Divider,
} from "antd";
import React, { useEffect, useState } from "react";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import ClientDetailsCard from "./ClientDetailsCard";
import BillingDetailsCard from "./BillingDetailsCard";
import DispatchAddress from "./DispatchDetailsCard";
import { imsAxios } from "../../../../axiosInterceptor";
import NavFooter from "../../../../Components/NavFooter";
import { toast } from "react-toastify";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import Loading from "../../../../Components/Loading";
import FormTable2 from "../../../../Components/FormTable2";
import { v4 } from "uuid";
import MySelect from "../../../../Components/MySelect";
import TextArea from "antd/es/input/TextArea";
import { postUpdatedWo } from "../api";
import SingleDatePicker from "../../../../Components/SingleDatePicker";
import MyDataTable from "../../../../Components/MyDataTable";
import FormTable from "../../../../Components/FormTable";
import { CommonIcons } from "../../../../Components/TableActions.jsx/TableActions";
const CreateChallanModal = ({
  show,
  close,
  data,
  editShipment,
  rtnchallan,
  setRtnChallan,
  // challanForm,
  //testing
}) => {
  const [challanForm] = Form.useForm();
  const [locationlist, setlocationlist] = useState([]);
  const [updatechallan, setupdatechallan] = useState("");
  const [test, settest] = useState("");
  const [challantitle, setchallantitle] = useState(false);
  const [billid, setBillId] = useState("");
  const [dispatchid, setDispatchId] = useState("");
  const [addid, setaddid] = useState(false);
  const [daddid, setdaddid] = useState(false);
  const [addOptions, setaddoptions] = useState([]);
  const [challanId, setChallanId] = useState("");
  const [challanData, setChallanData] = useState([]);
  const [rows, setRows] = useState([]);
  const [minRows, setMinRows] = useState([]);
  const [newminRows, setnewMinRows] = useState([]);
  const [gstType, setgstType] = useState([]);
  const components = Form.useWatch("components", challanForm);
  const componentsMIN = Form.useWatch("componentsMIN", challanForm);
  const [loading, setLoading] = useState("fetch");
  const [productid, setproductid] = useState("fetch");
  const [branchid, setBranchId] = useState("");
  const [modal2Open, setModal2Open] = useState(false);
  const [minqty, setMinQty] = useState("");
  const [componentList, setComponentList] = useState([]);
  const [totalsum, setTotalSum] = useState("");
  const [dataProductdetails, setDataProductdetails] = useState({
    text: "",
    value: "",
  });

  let sumOfMinAvailableQty;

  const [asyncOptions, setAsyncOptions] = useState([]);
  const [transaction, setTransactions] = useState("");
  ////uplaod
  var bid;
  var did;
  const [uplaodType, setUploadType] = useState("table");
  const [stage, setStage] = useState("preview");

  const [productSelected, setProductSelected] = useState(false);
  const [previewData, setpreviewData] = useState([]);
  // const [form] = Form.useForm();
  const files = Form.useWatch("files", challanForm);
  // console.log("data here of deatils data", editShipment);
  useEffect(() => {
    if (files) {
      setStage("preview");
    }
  }, [files]);
  let previewDataColms = [
    {
      headerName: "#",
      width: 30,
      field: "id",
    },
    {
      field: "CHALLAN_NO",
      headerName: "Challan No.",
      flex: 1,
    },
    {
      field: "DATE",
      headerName: "Date",
      flex: 1,
    },

    {
      field: "PRODUCT",
      headerName: "Product",
      flex: 1,
    },
    {
      field: "QTY",
      headerName: "Qty",
      flex: 1,
    },
    {
      field: "RATE",
      headerName: "Rate",
      flex: 1,
    },
    {
      field: "VALUE",
      headerName: "Value",
      flex: 1,
    },
    {
      field: "SHIP_DOC_NO",
      headerName: "Ship Doc no.",
      flex: 1,
    },
    {
      field: "EWAY_NO",
      headerName: "Eway No.",
      flex: 1,
    },

    {
      field: "VEHICLE_NO",
      headerName: "Vehicle no.",
      flex: 1,
    },
    {
      field: "OTHER_REF",
      headerName: "Other Ref",
      flex: 1,
    },
  ];
  const previewuploaData = async () => {
    const values = await challanForm.validateFields();
    let finalObj = {};
    let formData = new FormData();
    formData.append("file", values.files[0].originFileObj);
    let url = "";
    setLoading(true);
    // console.log("values", values);
    // if (uplaodType === "file") {
    //   if (stage === "preview") {
    const res = await imsAxios.post(
      "/wo_challan/previewExcelShipmentData",
      formData
    );
    const { data } = res;
    if (data.code === 200) {
      let arr = data.data.map((r, index) => {
        return {
          id: index + 1,
          ...r,
        };
      });
      setpreviewData(arr);
      setLoading(false);
    }

    setLoading(false);
  };

  const getLocationList = async (search) => {
    const response = await imsAxios.post("backend/fetchLocation", {
      searchTerm: search,
    });
    const { data } = response;
    let arr = data.map((row) => ({
      text: row.text,
      value: row.id,
    }));
    setlocationlist(arr);
  };
  const showSubmitConfirmationModal = (f) => {
    // submit confirm modal
    Modal.confirm({
      title: "Do you Want to Create this Shipment?",
      icon: <ExclamationCircleOutlined />,

      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await createDeliveryChallan();
      },
    });
  };
  const showReturnSubmitConfirmationModal = (f) => {
    // submit confirm modal
    Modal.confirm({
      title: "Do you Want to Create this Return Challan?",
      icon: <ExclamationCircleOutlined />,

      okText: "Yes",
      cancelText: "No",
      onOk: async () => {
        await createRMChallan();
      },
    });
  };

  const getchallandata = async (challanType, challanno) => {
    try {
      setLoading("fetch");
      setChallanId(challanno);
      if (challanType === "Create shipment") {
        const response = await imsAxios.post(
          "/wo_challan/editWorkorderDeliveryChallan",
          {
            challan_no: challanno,
          }
        );
        const { data } = response;
        setChallanData(data);
        challanForm.setFieldValue("clientname", data.header.clientcode.label);
        challanForm.setFieldValue("vn", data.header.vehicle);
        challanForm.setFieldValue("or", data.header.other_ref);
        challanForm.setFieldValue("pd", data.header.duration_process);
        challanForm.setFieldValue("nature", data.header.nature_process);
        challanForm.setFieldValue("components", [
          {
            productname: data.material.product_name,
            qty: data.material.received_qty,
            hsn: data.material.hsn_code,
            rate: data.material.product_rate,
            description: data.material.remarks,
          },
        ]);
      } else {
        const response = await imsAxios.post(
          "/wo_challan/editWorkorderChallan",
          {
            challan_no: challanno,
          }
        );
        const { data } = response;
        setChallanData(data);
        challanForm.setFieldValue("clientname", data.header.clientcode.label);
        challanForm.setFieldValue("vn", data.header.vehicle);
        challanForm.setFieldValue("or", data.header.other_ref);
        challanForm.setFieldValue("pd", data.header.duration_process);
        challanForm.setFieldValue("nature", data.header.nature_process);
        const arr = data.material.map((row, index) => ({
          id: index + 1,
          componentKey: row.component_key,
          component: row.component_name,
          partCode: row.part_no,
          hsn: row.hsn_code,
          rate: row.part_rate,
          qty: row.received_qty,
          // qty: row.pending_qty,
        }));
        const fields = challanForm.getFieldsValue();
        fields.components = arr;
        challanForm.setFieldsValue(fields);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };
  // const showSubmitConfirmationModal = (f, remove) => {
  //   // submit confirm modal
  //   Modal.confirm({
  //     title: "Do you Want to Create the challan?",
  //     icon: <ExclamationCircleOutlined />,
  //     content: "Please check the details before sumitting",
  //     okText: "Yes",
  //     cancelText: "No",
  //     onOk: () => {
  //       remove(f.name);
  //     },
  //   });
  // };

  const updateDeliveryChallan = async () => {
    // console.log(data.productId);
    try {
      const values = await challanForm.validateFields();
      // console.log("values--------", values);
      // return;
      var bid;
      var did;
      {
        addid ? (bid = values.billingid) : (bid = billid);
      }
      {
        daddid ? (did = values.shippingid) : (did = dispatchid);
      }
      const cddata = {
        transaction_id: challanId,
        header: {
          billingid: bid,
          billingaddress: values.billingaddress,
          dispatchid: did,
          dispatchaddress: values.shippingaddress,
          dispatchfrompincode: "--",
          dispatchfromgst: "--",
          vehicle: values.vn,
          clientbranch: branchid,
          clientaddress: values.address,
          duration: values.pd,
          nature: values.nature,
          other_ref: values.or,
        },
        material: {
          product: data.dataProductdetails.value,
          qty: values.components[0].qty,
          rate: values.components[0].rate,
          picklocation: values.components[0].pickuplocation,
          hsncode: values.components[0].hsn,
          remark: values.components[0].description,
          // challan_remark: values.components[0].description,
        },
      };
      setLoading("fetch");
      const response = await imsAxios.post(
        "/wo_challan/updateWO_DeliveryChallan",
        cddata
      );
      if (response.data.code === 200) {
        toast.success(response.data.message);
        challanForm.resetFields();
        close();
        setLoading(false);
      } else {
        toast.error(response.data.message.msg);
        setLoading(false);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateRmChallan = async () => {
    try {
      const values = await challanForm.validateFields();
      var bid;
      var did;
      {
        addid ? (bid = values.billingid) : (bid = billid);
      }
      {
        addid ? (did = values.shippingid) : (did = dispatchid);
      }
      let component = [];
      let qty = [];
      let rate = [];
      let pickup = [];
      let hsn = [];
      let remark = [];
      values.components.map((item) => component.push(item.componentKey));
      values.components.map((item) => qty.push(item.qty));
      values.components.map((item) => rate.push(item.rate));
      values.components.map((item) => pickup.push(item.pickuplocation));
      values.components.map((item) => hsn.push(item.hsn));
      values.components.map((item) => remark.push(item.description));
      const cddata = {
        transaction_id: challanId,
        header: {
          billingid: bid,
          billingaddress: values.billingaddress,
          dispatchid: did,
          dispatchaddress: values.shippingaddress,
          dispatchfrompincode: "--",
          dispatchfromgst: "--",
          vehicle: values.vn,
          clientbranch: branchid,
          clientaddress: values.address,
          duration: values.pd,
          nature: values.nature,
          other_ref: values.or,
        },
        material: {
          component: component,
          qty: qty,
          rate: rate,
          picklocation: pickup,
          hsncode: hsn,
          remark: remark,
        },
      };
      setLoading("fetch");
      const response = await imsAxios.post(
        "wo_challan/updateWO_ReturnChallan",
        cddata
      );
      if (response.data.code === 200) {
        toast.success(response.data.message);
        challanForm.resetFields();
        setLoading(false);
        close();
      } else {
        toast.error(response.data.message.msg);
        setLoading(false);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };
  const getEditShipmentData = async (h) => {
    // console.log("response getEditShipmentData ->", h);
    const response = await imsAxios.post("/wo_challan/editWorkorderShipment", {
      shipment_no: h.shipmentId,
    });
    // console.log("response ->", response);
    const { data } = response;
    // let arr = data.data;
    if (data.code == 200) {
      let arrHead = data.header;
      // let arrHead = data.header.map((row) => ({
      //   clientbranch: row.client_branch,
      //   // nature:
      // }));
      // challanForm.setFieldValue("components", arrHead);
      // challanForm.setFieldValue("nature", arrHead.eway_nor);
      // console.log("h.dispatch_info.value", arrHead);
      // challanForm.setFieldValue("clientbranch", arrHead.client_branch);
      challanForm.setFieldValue("clientbranch", arrHead.billing_info.label);
      challanForm.setFieldValue("nature", arrHead.eway_no);
      challanForm.setFieldValue("pd", arrHead.ship_doc_no);
      challanForm.setFieldValue("vn", arrHead.vehicle);
      challanForm.setFieldValue("or", arrHead.other_ref);
      // challanForm.setFieldValue("address", arrHead.clientcode.label);
      challanForm.setFieldValue("billingid", arrHead.billing_info.value);
      challanForm.setFieldValue("billingaddress", arrHead.billing_address);
      challanForm.setFieldValue("dispatchid", arrHead.dispatch_info.value);
      // challanForm.setFieldValue("shipment_id", arrHead.shipmentId);
      // challanForm.setFieldValue("dispatchid", h.dispatchId);
      challanForm.setFieldValue("shippingaddress", arrHead.dispatch_address);
      let arrMat = data.material;
      // console.log("data is here", data);
      // let newcomp = {
      //   productname: arrMat.product_name,
      //   partCode: arrMat.product_sku,
      //   qty: arrMat.received_qty,
      //   rate: arrMat.product_rate,
      //   hsn: arrMat.hsn_code,
      //   productdescription: arrMat.sku_desc,
      // };
      // console.log("arrMat", newcomp);

      // challanForm.setFieldValue("components", [obj]);
      challanForm.setFieldValue("components", [
        {
          productname: data.material.product_name,
          productKey: data.material.product_key,
          qty: data.material.received_qty,
          hsncode: data.material.hsn_code,
          rate: data.material.product_rate,
          productdescription: data.material.sku_desc,
          // description: data.material.remarks,
          woId: h.woTransaction_Id,
          shipment_id: arrHead.shipment_id,
          clientbranchid: arrHead.billing_info.value,
          challan_remark: arrHead.challan_remark,
        },
      ]);

      challanForm.setFieldValue("address", arrHead.clientaddress.label);
      let news = challanForm.getFieldsValue("components");
      // console.log("news", news);
    }
  };
  const closeDrawer = () => {
    challanForm.resetFields();
    close();
  };
  useEffect(() => {
    if (rows.length > 0) {
      if (!rtnchallan) {
        console.log("rows", rows);
        sumOfMinAvailableQty = 0;
        let getRowsQty = rows.filter((b) => b.out_qty > 0);
        console.log("getRowsQty", getRowsQty);
        for (const item of getRowsQty) {
          sumOfMinAvailableQty += parseInt(item.out_qty);
        }

        console.log("Sum of min_available_qty:", sumOfMinAvailableQty);
        setMinQty(sumOfMinAvailableQty);
        let a = challanForm.getFieldValue("components");
        a[0].qty = sumOfMinAvailableQty;

        challanForm.setFieldValue("components", a);
      } else {
        setLoading("fetch");
        let totalMinAvailableQty = 0;
        let qtyelement;
        let getRowsQty = rows.filter((b) => b.out_qty > 0);
        for (const item of getRowsQty) {
          qtyelement = componentList.find(
            ({ partCode }) => partCode === item.part_code
          );
        }
        let samePartCodeArr = [];
        samePartCodeArr = getRowsQty.filter(
          (r) => r.part_code === qtyelement.partCode
        );
        samePartCodeArr.map((s) => {
          totalMinAvailableQty += parseInt(s.out_qty);
        });
        challanForm.setFieldValue(
          ["components", qtyelement.id - 1, "qty"],
          totalMinAvailableQty
        );
        setLoading(false);
      }
    }
  }, [rows]);

  useEffect(() => {
    // console.log("dataaaaaaaaa", data);
    // console.log("edit shipmetn)-> ", editShipment);
    // console.log("edit show)-> ", show);
    setDataProductdetails({ text: data.product, value: data.productId });
    setTransactions(data.transactionId);
    if (editShipment == "Shipment" && data) {
      getEditShipmentData(data);
    }
    getLocationList();
    if (data.hasOwnProperty("challanId")) {
      getchallandata(data.challantype, data.challanId);
      setchallantitle(true);
      settest(data.challantype);
      setupdatechallan(data.challantype);
    }
    if (show.label === "Return Challan") {
      settest(show.label);
      setupdatechallan(show.label);
      getbomcomponents(data.productId, data.transactionId);
      // console.log("here in return challan", data);
      setRtnChallan(true);
      getMinDetails(data);
    } else if (show.label === "Create shipment") {
      settest(show.label);
      setupdatechallan(show.label);
      const obj = {
        index: 1,
        productname: data.product,
        hsncode: data.hsn,
        partCode: "row.c_part_no",
        id: v4(),
      };
      setRows(obj);
      challanForm.setFieldValue("components", [obj]);
      getMinDetails(data);
    }
    if (data != "") {
      getClientdetails(
        data.clientCode,
        data.clientaddress,
        data.clientAddressId,
        data.billaddress,
        data.shipaddress,
        data.challanId
      );
      // (code, caddress,caid badd, sadd, cid
    }
    // console.log("datain useeffect", data);
  }, [show]);

  useEffect(() => {
    setModal2Open(true);
  }, []);

  const getMinDetails = async (d) => {
    const response = await imsAxios.post("/createwo/fetch_wo_mins", {
      wo_id: d.transactionId,
    });
    // console.log("response mindetails", response);
    const { data } = response;
    let arr = data?.data?.map((r) => {
      return {
        min_date: r.min_date,
        min_id: r.min_id,
        min_eway_bill: r.min_eway_bill,
        min_available_qty: r.min_available_qty,
        min_rate: r.min_rate,
        component_name: r.component_name,
        part_code: r.part_code,
        component_key: r.component_key,
        id: v4(),
      };
    });
    setMinRows(arr);
    // challanForm.setFieldValue("componentsMIN", arr);
  };
  // useEffect(() => {
  //   console.log("set", callInphandler);
  //   if (updatedQty) {
  //     console.log("here in qty ");
  //     inputHandler();
  //   }
  // }, [updatedQty]);

  const inputHandler = (name, value, id) => {
    // console.log("this is the chalan form values", minRows);
    let arr = minRows;

    if (name === "out_qty") {
      // const abovArr = challanForm.getFieldValue("components");
      // const found = arr.find((row) => row.id === id);
      // let updateId;
      // const samePartCodeArr = arr.filter(
      //   (row) => row.part_code === found.part_code
      // );
      // console.log("same part code", samePartCodeArr);
      // // let totalMinAvailableQty = samePartCodeArr.reduce(
      // //   (total, component) => total + +Number(component.out_qty),
      // //   0
      // // );
      // if (samePartCodeArr.length > 1) {
      //   setUpdatedQty(true);
      //   setCallInpHandler(true);
      // }
      // let totalMinAvailableQty = 0;
      // for (const item of samePartCodeArr) {
      //   if (item.out_qty) {
      //     totalMinAvailableQty += parseInt(item.out_qty);
      //   }
      // }
      // // value = totalMinAvailableQty;
      // console.log("totalMinAvailableQty", totalMinAvailableQty);
      // setTotalSum(totalMinAvailableQty);
      // if (found) {
      //   abovArr.map((row) => {
      //     if (row.partCode === found.part_code) {
      //       updateId = row.id;
      //     }
      //   });
      //   console.log("Update id", value);
      //   challanForm.setFieldValue(
      //     ["components", updateId - 1, "qty"],
      //     totalMinAvailableQty
      //   );
      //   setUpdatedQty(false);
      //   // console.log("updated arr ", arr1);
      // }
    }
    arr = arr.map((row) => {
      let obj = row;
      if (row.id === id) {
        obj = {
          ...obj,
          [name]: value,
        };
        return obj;
      } else {
        return obj;
      }
    });
    console.log("arr->", arr);
    setRows(arr);
    setMinRows(arr);
  };
  const getbomcomponents = async (sku, woid) => {
    try {
      setLoading("fetch");
      const response = await imsAxios.post(
        "/createwo/fetchComponentListforWO",
        {
          skucode: sku,
          wo_transaction: woid,
        }
      );
      const { data } = response;
      const arr = data.data.map((row, index) => ({
        id: index + 1,
        componentKey: row.component_key,
        component: row.component_name,
        partCode: row.part_code,
        hsn: row.component_hsn,
        qty: "",
      }));
      const fields = challanForm.getFieldsValue();
      fields.components = arr;
      setComponentList(arr);
      challanForm.setFieldsValue(fields);
      setLoading(false);
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };
  const removeRow = (id) => {
    setMinRows(minRows.filter((row) => row.id !== id)); // remove the row
  };
  const getComponentDetails = async (inputValue) => {
    setLoading("fetch");
    const response = await imsAxios.post("/createwo/fetchProductData", {
      product_key: inputValue,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        // console.log("data in data fetch product", dataProductdetails);
        // fetchbomlist(data.data.product_sku);
        // setUom(data.data?.unit);
        // challanForm.setFieldValue("qty", data.data?.description);
        // challanForm.setFieldValue("rate", data.data?.rate);
        // challanForm.setFieldValue("hsncode", data.data?.hsn);
        // challanForm.setFieldValue("gstRate", data.data?.gstrate);
        let obj = {
          hsncode: data.data?.hsn,
          // rate: data.data?.rate,
          // gstRate: data.data?.gstRate,
          secondary_product: data.data?.product_name,
          secondary_productId: inputValue,
          productname: dataProductdetails.text,
          qty: minqty,
        };
        // console.log("obj ->", obj);
        // challanForm.setFieldsValue()
        challanForm.setFieldValue("components", [obj]);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      toast.error("Some error occured wile getting component details");
    }
  };

  const getClientdetails = async (code, caddress, caid, badd, sadd, cid) => {
    // console.log(cid, caddress);

    try {
      setLoading("fetch");
      const response = await imsAxios.post("/backend/fetchClientDetail", {
        code: code,
      });
      const { data } = response;
      // console.log("data------", caddress);
      if (cid === undefined) {
        // console.log("coming here", cid);
        // data.branchList.map((item) => {
        //   if (item.address === caddress) {
        //     challanForm.setFieldValue("clientbranch", item.text);
        //     setBranchId(item.id);
        //   }
        // });
        data.branchList.map((row) => {
          if (row.address === badd) {
            // console.log("coming here", badd, row);
            challanForm.setFieldValue("billingid", row.id);
            challanForm.setFieldValue("billingaddress", badd);
            // challanForm.setFieldValue("dispatchfrompincode", data.pincode);
            setBillId(row.id);
          } else if (row.address === sadd) {
            // console.log("coming here dispatch", sadd, row);
            challanForm.setFieldValue("dispatchid", row.text);
            challanForm.setFieldValue("shippingaddress", sadd);
            challanForm.setFieldValue("dispatchfromgst", row.gst);
            challanForm.setFieldValue("dispatchfrompincode", row.pincode);
            setDispatchId(row.id);
          }
        });
        challanForm.setFieldValue("clientname", data.client.name);
        challanForm.setFieldValue("address", caddress);
        data.branchList.map((item) => {
          if (item.id === caid) {
            challanForm.setFieldValue("clientbranch", item.text);
            setBranchId(item.id);
          }
        });
      } else {
        // data.branchList.map((item) => {
        //   if (item.address === caddress) {
        //     challanForm.setFieldValue("clientbranch", item.text);
        //     setBranchId(item.id);
        //   }
        // });
        data.branchList.map((item) => {
          if (item.id === caid) {
            challanForm.setFieldValue("clientbranch", item.text);
            setBranchId(item.id);
            // console.log("item.text", item.text);
          }
        });
        data.branchList.map((row) => {
          if (row.address === badd) {
            challanForm.setFieldValue("billingid", row.text);
            challanForm.setFieldValue("billingaddress", badd);
            setBillId(row.id);
          } else if (row.address === sadd) {
            challanForm.setFieldValue("dispatchid", row.text);
            challanForm.setFieldValue("shippingaddress", sadd);
            challanForm.setFieldValue("dispatchfromgst", row.gst);
            challanForm.setFieldValue("dispatchfrompincode", row.pincode);
            setDispatchId(row.id);
          }
        });
        challanForm.setFieldValue("clientname", data.client.name);
        challanForm.setFieldValue("address", caddress);
      }
      if (data.code === 200) {
        const arr = data.branchList.map((row) => ({
          text: row.text,
          value: row.id,
          address: row.address,
          gst: row.gst,
          pincode: row.pincode,
        }));
        setaddoptions(arr);
      }
      // toast.success(data.message)
      toast.error(data.message?.msg);
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };
  const updateWoShipment = async (newpayload) => {
    // return;
    const arr = await postUpdatedWo(newpayload);
    close();
  };
  const createchallanThroughtExcel = async () => {
    let a = challanForm.getFieldsValue();
    let bbidforexcel = a.billingid;
    const values = await challanForm.validateFields();
    {
      addid ? (bid = values.billingid) : (bid = billid);
    }
    {
      addid ? (did = values.dispatchid) : (did = dispatchid);
    }
    let formData = new FormData();
    formData.append("file", values.files[0].originFileObj);
    formData.append("billingaddrid", bbidforexcel);
    formData.append("dispatchaddrid", values.dispatchid);
    formData.append("transaction_id", transaction);

    // let finalObj = {};
    // let formDatas = new FormData();
    // formDatas.append("file", values.files[0].originFileObj);
    // return;
    let res = await imsAxios.post(
      "/wo_challan/saveShipmentthroughExcel",
      formData
    );
    const { data } = res;
    if (data.code === 200) {
      toast.success(data.message);
      challanForm.resetFields();
      setRows([]);
      close();
    } else {
      toast.error(data.message.msg);
    }
  };
  const createDeliveryChallan = async () => {
    // console.log("here in create delivery challan");
    if (uplaodType === "file") {
      createchallanThroughtExcel();
    } else {
      if (editShipment === "Shipment") {
        const values = await challanForm.validateFields();
        const newpayload = {
          shipment_id: values.components[0].shipment_id,
          wo_id: values.components[0].woId,
          header: {
            billingid: values.billingid,
            billingaddress: values.billingaddress,
            // transaction_id: data.transactionId,
            dispatchid: values.dispatchid,
            dispatchaddress: values.shippingaddress,
            dispatchfrompincode: "--",
            dispatchfromgst: "--",
            vehicle: values.vn,
            clientbranch: values.components[0].clientbranchid,
            clientaddress: values.address,
            eway: values.nature,
            ship_doc: values.pd,
            other_ref: values.or,
            challan_remark: values.components[0].challan_remark,
          },
          material: {
            product: values.components[0].productKey,
            qty: values.components[0].qty,
            rate: values.components[0].rate,
            picklocation: values.components[0].pickuplocation,
            hsncode: values.components[0].hsncode,

            gst_rate: values.components[0].gstRate,
            wo_sku_desc: values.components[0].productdescription,
            // remark: values.components[0].description,
          },
        };
        updateWoShipment(newpayload);
      } else {
        try {
          const values = await challanForm.validateFields();
          let a = rows.filter((b) => b.out_qty > 0);
          // console.log("values", values);
          // console.log("add----------", addOptions);
          // setRows(a);
          console.log(billid);
          // return;
          // return;
          console.log(addid);
          {
            addid ? (bid = values.billingid) : (bid = billid);
          }
          {
            addid ? (did = values.dispatchid) : (did = dispatchid);
          }
          setLoading("fetch");
          const cddata = {
            header: {
              billingaddrid: bid,
              billingaddr: values.billingaddress,
              transaction_id: data.transactionId,
              dispatchfromaddrid: values.dispatchid,
              dispatchfromaddr: values.shippingaddress,
              dispatchfrompincode: values.dispatchfrompincode,
              dispatchfromgst: values.dispatchfromgst,
              vehicle: values.vn,
              clientbranch: values.clientbranch,
              clientaddress: values.address,
              eway_no: values.nature,
              ship_doc_no: values.pd,
              other_ref: values.or,
            },

            material: {
              product: dataProductdetails.value,
              secondary_product: values.components[0].secondary_productId,
              qty: values.components[0].qty,
              rate: values.components[0].rate,
              picklocation: values.components[0].pickuplocation,
              hsncode: values.components[0].hsncode,

              gst_rate: values.components[0].gstRate,
              sku_desc: values.components[0].productdescription,
              remark: values.components[0].description,
              insert_dt: values.insertDate,
              // insert_dt
            },
            // component: ["1670578341262"],
            component: a.map((r) => r.component_key),
            doc_id: a.map((r) => r.min_id),
            doc_date: a.map((r) => r.min_date),
            out_qty: a.map((r) => r.out_qty),
            out_rate: a.map((r) => r.min_rate),
            // doc_id: ["1234"],
            // doc_date: ["12-09-2023"],
            // out_qty: ["100"],
            // out_rate: ["120"],
          };
          // console.log("cddata", cddata);
          // return;
          const response = await imsAxios.post(
            "/wo_challan/saveCreateShipment",
            cddata
          );
          // console.log("response", response);
          if (response.data.status === "success") {
            toast.success(response.data.message);
            challanForm.resetFields();
            close();
            setLoading(false);
          } else {
            toast.error(response.data.message.msg);
            setLoading(false);
          }
        } catch (error) {
          toast.error(error);
        } finally {
          setLoading(false);
        }
      }
    }
  };
  const getComponentOptions = async (inputValue) => {
    setLoading("select");
    const response = await imsAxios.post("/backend/getProductByNameAndNo", {
      search: inputValue,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      let arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setAsyncOptions(arr);
    } else {
      toast.error("Some error occured wile getting components");
    }
  };
  const createRMChallan = async () => {
    try {
      const values = await challanForm.validateFields();
      var bid;
      var did;
      {
        addid ? (bid = values.billingid) : (bid = billid);
      }
      {
        addid ? (did = values.dispatchid) : (did = dispatchid);
      }
      let a = rows.filter((b) => b.out_qty > 0);

      const cddata = {
        product_id: data.productId,
        header: {
          billingaddrid: values.billingid,
          billingaddr: values.billingaddress,
          transaction_id: data.transactionId,
          dispatchfromaddrid: values.dispatchid,
          dispatchfromaddr: values.shippingaddress,
          dispatchfrompincode: values.dispatchfrompincode,
          dispatchfromgst: values.dispatchfromgst,
          vehicle: values.vn,
          clientbranch: values.clientbranch,
          clientaddress: values.address,
          other_ref: values.or,
          ship_doc: values.pd,
          eway_no: values.nature,
          insert_dt: values.insertDate,
        },
        material: {
          component: values.components.map((r) => r.componentKey),
          // secondary_product: values.components[0].secondary_productId,
          qty: values.components.map((r) => r.qty),
          rate: values.components.map((r) => r.rate),
          picklocation: values.components.map((r) => r.pickuplocation),
          hsncode: values.components.map((r) => r.hsn),
          remark: values.components.map((r) => r.description),
        },
        component: a.map((r) => r.component_key),
        doc_id: a.map((r) => r.min_id),
        doc_date: a.map((r) => r.min_date),
        out_qty: a.map((r) => r.out_qty),
        out_rate: a.map((r) => r.min_rate),
      };
      setLoading("fetch");
      console.log("cddata", cddata);
      console.log("values", values);
      // return;
      const response = await imsAxios.post(
        "wo_challan/saveCreateReturnChallan",
        cddata
      );
      if (response.data.code === 200) {
        toast.success(response.data.message);
        challanForm.resetFields();
        setLoading(false);
        setRtnChallan(false);
        close();
      } else {
        toast.error(response.data.message.msg);
        setLoading(false);
      }
    } catch (error) {
      toast.error(error);
    } finally {
      setLoading(false);
    }
    setRtnChallan(false);
  };
  const calculation = (fieldName, watchValues) => {
    const { qty, rate, gstRate } = watchValues;
    const value = +Number(qty ?? 0) * +Number(rate ?? 0).toFixed(3);
    const gstAmount = (+Number(value).toFixed(3) * +Number(gstRate)) / 100;
    let cgst = 0,
      igst = 0,
      sgst = 0;

    if (gstType === "L" && gstRate) {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
      igst = undefined;
    } else if (gstType === "I" && gstRate) {
      igst = gstAmount;
      cgst = undefined;
      sgst = undefined;
    }
    challanForm.setFieldValue(
      ["components", fieldName, "value"],
      +Number(value).toFixed(3)
    );
    challanForm.setFieldValue(
      ["components", fieldName, "cgst"],
      +Number(cgst).toFixed(3)
    );
    challanForm.setFieldValue(
      ["components", fieldName, "sgst"],
      +Number(sgst).toFixed(3)
    );
    challanForm.setFieldValue(
      ["components", fieldName, "igst"],
      +Number(igst).toFixed(3)
    );
  };
  const gstTypeOptions = [
    {
      text: "Local",
      value: "L",
    },
    {
      text: "Interstate",
      value: "I",
    },
  ];
  const toggleInputType = (e) => {
    setUploadType(e.target.value);
    // challanForm.resetFields();
  };
  const uploadTypeOptions = [
    {
      label: "File",
      value: "file",
    },
    {
      label: "Manual",
      value: "table",
    },
  ];
  return (
    <>
      <Drawer
        title={`${challantitle ? "Editing" : ""} ${test}`}
        placement="right"
        onClose={closeDrawer}
        bodyStyle={{
          padding: 5,
        }}
        open={show}
        width="100%"
      >
        {loading === "fetch" && <Loading />}
        <Form
          style={{ height: "100%" }}
          layout="vertical"
          form={challanForm}
          initialValues={defaultValues}
        >
          <Row gutter={8} style={{ height: "95%", overflow: "hidden" }}>
            <Col span={6} style={{ height: "100%", overflow: "hidden" }}>
              <Row gutter={[0, 6]} style={{ overflow: "auto", height: "100%" }}>
                <ClientDetailsCard
                  form={challanForm}
                  uploadTypeOptions={uploadTypeOptions}
                  toggleInputType={toggleInputType}
                  uplaodType={uplaodType}
                  setUploadType={setUploadType}
                  stage={stage}
                  rtnchallan={rtnchallan}
                  // submitHandler={submitHandler}
                  // validateHandler={validateHandler}
                  previewuploaData={previewuploaData}
                />
                {uplaodType === "table" && (
                  <Col span={24}>
                    <Card size="small">
                      <Form.Item name="gstType" label="GST Type">
                        <MySelect
                          options={gstTypeOptions}
                          onChange={(e) => {
                            setgstType(e);
                          }}
                        />

                        {/* ?/? */}
                      </Form.Item>
                      {editShipment !== "Shipment" && (
                        <Form.Item
                          label="Insert Date"
                          name="insertDate"
                          rules={[
                            {
                              required: true,
                              message: "Please Enter Insert Date",
                            },
                          ]}
                        >
                          <SingleDatePicker
                            setDate={(value) =>
                              challanForm.setFieldValue("insertDate", value)
                            }
                          />
                          {/* <InputMask
                      // name="due_date[]"
                      // value={vendorData?.invoice_date}
                      // onChange={(e) =>
                      //   vendorInputHandler("invoice_date", e.target.value)
                      // }
                      className="input-date"
                      mask="99-99-9999"
                      placeholder="__-__-____"
                    /> */}
                        </Form.Item>
                      )}
                    </Card>
                  </Col>
                )}

                <BillingDetailsCard
                  form={challanForm}
                  code={data.clientCode}
                  setaddid={setaddid}
                  addoptions={addOptions}
                />
                <DispatchAddress
                  form={challanForm}
                  code={data.clientCode}
                  setaddid={setdaddid}
                  addoptions={addOptions}
                  rtnchallan={rtnchallan}
                />
              </Row>
            </Col>
            {uplaodType === "table" && (
              <>
                <Col span={18} style={{ height: "90%", overflow: "auto" }}>
                  {challantitle ? (
                    test === "Create shipment" ||
                    editShipment === "Shipment" ? (
                      <Product
                        form={challanForm}
                        location={locationlist}
                        calculation={calculation}
                        gsttype={gstType}
                        setlocationlist={setlocationlist}
                        locationlist={locationlist}
                        getLocationList={getLocationList}
                        getComponentOptions={getComponentOptions}
                        asyncOptions={asyncOptions}
                        setAsyncOptions={setAsyncOptions}
                        inputHandler={inputHandler}
                        minRows={minRows}
                        removeRow={removeRow}
                        CommonIcons={CommonIcons}
                        rows={rows}
                      />
                    ) : (
                      <Component
                        form={challanForm}
                        location={locationlist}
                        calculation={calculation}
                        gsttype={gstType}
                        setlocationlist={setlocationlist}
                        inputHandler={inputHandler}
                        minRows={minRows}
                        removeRow={removeRow}
                      />
                    )
                  ) : show.label === "Create shipment" ||
                    editShipment === "Shipment" ? (
                    <Product
                      calculation={calculation}
                      form={challanForm}
                      location={locationlist}
                      gsttype={gstType}
                      setlocationlist={setlocationlist}
                      getLocationList={getLocationList}
                      locationlist={locationlist}
                      getComponentOptions={getComponentOptions}
                      asyncOptions={asyncOptions}
                      setAsyncOptions={setAsyncOptions}
                      getComponentDetails={getComponentDetails}
                      editShipment={editShipment}
                      inputHandler={inputHandler}
                      minRows={minRows}
                      removeRow={removeRow}
                      CommonIcons={CommonIcons}
                      rows={rows}
                    />
                  ) : (
                    <Component
                      form={challanForm}
                      location={locationlist}
                      calculation={calculation}
                      gsttype={gstType}
                      setlocationlist={setlocationlist}
                      inputHandler={inputHandler}
                      minRows={minRows}
                      removeRow={removeRow}
                    />
                  )}
                </Col>
              </>
            )}
            {uplaodType === "file" && (
              <MyDataTable
                columns={previewDataColms}
                data={previewData}
                loading={loading}
              />
            )}
          </Row>
        </Form>

        {challantitle ? (
          <NavFooter
            submitFunction={
              test === "Create shipment" || editShipment === "Shipment"
                ? updateDeliveryChallan
                : updateRmChallan
            }
            nextLabel={
              test === "Create shipment" || editShipment === "Shipment"
                ? "Update Delivery Challan"
                : "Update RM Challan"
            }
          />
        ) : (
          <NavFooter
            submitFunction={
              test === "Create shipment" || editShipment === "Shipment"
                ? showSubmitConfirmationModal
                : showReturnSubmitConfirmationModal
            }
            nextLabel={
              test === "Create shipment" || editShipment === "Shipment"
                ? "Create shipment"
                : "Create RM Challan"
            }
          />
        )}
      </Drawer>
      {/* <Modal
        title="Vertically centered modal dialog"
        centered
        open={modal2Open}
        onOk={() => uploadMethod()}
        onCancel={() => setModal2Open(false)}
      >
        <Col span={24}>
          <Radio.Group
            onChange={toggleInputType}
            // value={uploadType}
            options={uploadTypeOptions}
          />
        </Col>
      </Modal>{" "} */}
    </>
  );
};
const defaultValues = {
  components: [
    {
      component: {
        label: "Sample Component",
        value: "Sample Value",
      },
      partCode: "p2044",
      availabelQty: 100,
      requiredQty: 100,
      pendingQty: 100,
      inwardQty: "",
    },
  ],
};

export default CreateChallanModal;
//for return challan
const Component = ({
  fields,
  field,
  index,
  add,
  form,
  calculation,
  gsttype,
  remove,
  location,
  locationfunction,
  showSubmitConfirmationModal,
  setlocationlist,
  getLocationList,
  locationlist,
  minRows,
  removeRow,
  inputHandler,
  rows,
}) => {
  return (
    <>
      <Col span={29} style={{ height: "100%", overflow: "hidden" }}>
        <Card
          style={{
            height: "35%",
            overflowY: "scroll",
            overflowX: "scroll",
            maxHeight: "35%",
            marginTop: "20px",
          }}
        >
          <FormTable2
            removableRows={true}
            nonRemovableColumns={1}
            columns={[
              ...componentsItems(
                location,
                gsttype,
                setlocationlist,
                getLocationList,
                locationlist
              ),
            ]}
            listName="components"
            watchKeys={["rate", "qty", "gstRate"]}
            nonListWatchKeys={["gstType"]}
            componentRequiredRef={["rate", "qty"]}
            form={form}
            calculation={calculation}
            rules={listRules}
          />
        </Card>
        {/* </Card> */}
        <Card
          style={{
            height: "63%",
            overflowY: "scroll",
            maxHeight: "63%",
            marginTop: "30px",
          }}
        >
          <FormTable
            columns={[
              ...compMinItems(
                inputHandler,
                removeRow,
                CommonIcons,
                rows,
                minRows
              ),
            ]}
            data={minRows}
            inputHandle={inputHandler}
          />
        </Card>
      </Col>
    </>
  );
};

const Product = ({
  fields,
  field,
  index,
  add,
  form,
  remove,
  calculation,
  location,
  gsttype,
  locationfunction,
  setlocationlist,
  getLocationList,
  locationlist,
  getComponentOptions,
  asyncOptions,
  setAsyncOptions,
  getComponentDetails,
  editShipment,
  inputHandler,
  rows,
  minRows,
  removeRow,
  CommonIcons,
}) => {
  return (
    <>
      <Col span={29} style={{ height: "100%", overflow: "hidden" }}>
        {editShipment ? (
          <>
            {" "}
            <FormTable2
              nonRemovableColumns={1}
              columns={[
                ...productItemsEdit(
                  location,
                  gsttype,
                  setlocationlist,
                  getLocationList,
                  locationlist,
                  getComponentOptions,
                  asyncOptions,
                  setAsyncOptions,
                  getComponentDetails
                ),
              ]}
              listName="components"
              watchKeys={["rate", "qty", "gstRate"]}
              nonListWatchKeys={["gstType"]}
              componentRequiredRef={["rate", "qty"]}
              form={form}
              calculation={calculation}
              rules={listRules}
            />
          </>
        ) : (
          <>
            <Card>
              <FormTable2
                nonRemovableColumns={1}
                columns={[
                  ...productItems(
                    location,
                    gsttype,
                    setlocationlist,
                    getLocationList,
                    locationlist,
                    getComponentOptions,
                    asyncOptions,
                    setAsyncOptions,
                    getComponentDetails
                  ),
                ]}
                listName="components"
                watchKeys={["rate", "qty", "gstRate"]}
                nonListWatchKeys={["gstType"]}
                componentRequiredRef={["rate", "qty"]}
                form={form}
                calculation={calculation}
                // rules={listRules}
              />
            </Card>
            <Card
              style={{
                height: "80%",
                overflowY: "scroll",
                maxHeight: "73%",
                marginTop: "20px",
              }}
            >
              <FormTable
                columns={[
                  ...productMinItems(
                    inputHandler,
                    removeRow,
                    CommonIcons,
                    rows,
                    minRows
                  ),
                ]}
                data={minRows}
                inputHandle={inputHandler}
              />
            </Card>
          </>
        )}
      </Col>
    </>
  );
};

const productItems = (
  location,
  gstType,
  getLocationList,
  setlocationlist,
  locationlist,
  getComponentOptions,
  asyncOptions,
  setAsyncOptions,
  getComponentDetails
) => [
  {
    headerName: "#",
    name: "",
    width: 30,
    field: (_, index) => (
      <Typography.Text type="secondary">{index + 1}.</Typography.Text>
    ),
  },
  {
    headerName: "Products",
    name: "productname",
    width: 250,
    flex: true,
    field: () => <Input disabled />,
  },
  {
    headerName: "Secondary Products",
    name: "secondary_product",
    width: 250,
    flex: true,
    field: () => (
      <MyAsyncSelect
        // labelInValue
        // selectLoading={loading === "select"}
        loadOptions={getComponentOptions}
        optionsState={asyncOptions}
        onChange={getComponentDetails}
      />
    ),
  },
  {
    headerName: "HSN Code",
    name: "hsncode",
    width: 150,
    field: () => <Input />,
  },
  {
    headerName: "Qty",
    name: "qty",
    width: 100,
    field: () => <Input />,
  },
  {
    headerName: "Rate",
    name: "rate",
    width: 100,
    field: () => <Input />,
  },
  {
    headerName: "Value",
    name: "value",
    width: 150,
    field: () => <Input disabled />,
  },
  {
    headerName: "GST %",
    name: "gstRate",
    width: 100,
    field: () => <MySelect options={gstRateOptions} />,
  },
  {
    headerName: "CGST",
    name: "cgst",
    width: 100,
    conditional: true,
    condition: (row) => gstType === "L",
    field: ({ row }) => <Input disabled />,
  },
  {
    headerName: "SGST",
    name: "sgst",
    width: 100,
    conditional: true,
    condition: (row) => gstType === "L",
    field: ({ row }) => <Input disabled />,
  },
  {
    headerName: "IGST",
    name: "igst",
    width: 100,
    conditional: true,
    condition: (row) => gstType === "I",
    field: (row) => <Input disabled />,
  },

  {
    headerName: "Pick up location",
    name: "pickuplocation",
    width: 150,
    field: (row) => (
      <MySelect
        // onBlur={() => setlocationlist([])}
        options={locationlist}
        // optionsState={locationlist}
        // selectLoading={loading === "select"}
      />
    ),
    // <MySelect options={location} />,
  },
  // {
  //   headerName: "Remark",
  //   name: "description",
  //   width: 150,
  //   field: (row) => <Input />,
  // },
  {
    headerName: "Product Description",
    name: "productdescription",
    width: 150,
    field: (row) => <TextArea row={3} />,
  },
];
const productMinItems = (
  inputHandler,
  removeRow,
  CommonIcons,
  rows,
  minRows
) => [
  // {
  //   headerName: <CommonIcons action="addRow" onClick={addRows} />,
  //   width: 40,
  //   type: "actions",
  //   field: "add",
  //   sortable: false,
  //   renderCell: ({ row }) =>
  //     rows.length > 1 &&
  //     !row?.total && (
  //       <CommonIcons
  //         action="removeRow"
  //         onClick={() => {
  //           removeRow(row.id);
  //         }}
  //       />
  //     ),
  // },
  {
    // headerName: <CommonIcons action="addRow" onClick={addRows} />,
    field: "actions",
    width: 40,
    renderCell: ({ row }) => (
      // row.type === "new" && (
      <CommonIcons action="removeRow" onClick={() => removeRow(row.id)} />
    ),
    // ),
  },
  {
    headerName: "Component Name",
    field: "component_name",
    width: 300,
    sortable: false,
    // width: "10vw",
    renderCell: ({ row }) => (
      <Input
        // size="small"
        //   value={row.total ? paymentTotal?.toFixed(2) : row.payment}
        value={row.component_name}
        onChange={(e) => inputHandler("component_name", e.target.value, row.ID)}
        disabled={row.component_name}
      />
    ),
  },
  {
    headerName: "Part Code",
    // width: "20.5vw",
    field: "part_code",
    flex: 1,
    sortable: false,
    renderCell: ({ row }) =>
      !row.total && (
        <Input
          disabled
          onChange={(e) => {
            inputHandler("part_code", e.target.value, row.id);
          }}
          value={row?.part_code}
          name="part_code"
          id={row.ID}
        />
      ),
  },
  {
    headerName: "MIN Date",
    // width: "20.5vw",
    field: "min_date",
    flex: 1,
    sortable: false,
    renderCell: ({ row }) =>
      !row.total && (
        <Input
          disabled
          onChange={(e) => {
            inputHandler("min_date", e.target.value, row.id);
          }}
          value={row?.min_date}
          name="min_date"
          id={row.ID}
        />
      ),
  },
  {
    headerName: "MIN Id",
    // width: "20.5vw",
    field: "min_id",
    flex: 1,
    sortable: false,
    renderCell: ({ row }) =>
      !row.total && (
        <Input
          disabled
          onChange={(e) => {
            inputHandler("min_id", e.target.value, row.id);
          }}
          value={row?.min_id}
          name="min_id"
          id={row.ID}
        />
      ),
  },
  {
    headerName: "MIN Rate",
    // width: "20.5vw",
    field: "min_rate",
    flex: 1,
    sortable: false,
    renderCell: ({ row }) =>
      !row.total && (
        <Input
          disabled
          onChange={(e) => {
            inputHandler("min_rate", e.target.value, row.id);
          }}
          value={row?.min_rate}
          name="min_rate"
          id={row.ID}
        />
      ),
  },
  {
    headerName: "MIN Available Qty",
    // width: "20.5vw",
    field: "min_available_qty",
    flex: 1,
    sortable: false,
    renderCell: ({ row }) =>
      !row.total && (
        <Input
          disabled
          onChange={(e) => {
            inputHandler("min_available_qty", e.target.value, row.id);
          }}
          value={row?.min_available_qty}
          name="min_available_qty"
          id={row.ID}
        />
      ),
  },
  {
    headerName: "Out Qty",
    // width: "20.5vw",
    field: "out_qty",
    flex: 1,
    sortable: false,
    renderCell: ({ row }) =>
      !row.total && (
        <Input
          onChange={(e) => {
            inputHandler("out_qty", e.target.value, row.id);
          }}
          value={row?.out_qty}
          name="out_qty"
          id={row.ID}
        />
      ),
  },
];
const compMinItems = (inputHandler, removeRow, CommonIcons, rows, minRows) => [
  // {
  //   headerName: <CommonIcons action="addRow" onClick={addRows} />,
  //   width: 40,
  //   type: "actions",
  //   field: "add",
  //   sortable: false,
  //   renderCell: ({ row }) =>
  //     rows.length > 1 &&
  //     !row?.total && (
  //       <CommonIcons
  //         action="removeRow"
  //         onClick={() => {
  //           removeRow(row.id);
  //         }}
  //       />
  //     ),
  // },
  {
    // headerName: <CommonIcons action="addRow" onClick={addRows} />,
    field: "actions",
    width: 40,
    renderCell: ({ row }) => (
      // row.type === "new" && (
      <CommonIcons action="removeRow" onClick={() => removeRow(row.id)} />
    ),
    // ),
  },
  {
    headerName: "Component Name",
    field: "component_name",
    width: 300,
    sortable: false,
    // width: "10vw",
    renderCell: ({ row }) => (
      <Input
        // size="small"
        //   value={row.total ? paymentTotal?.toFixed(2) : row.payment}
        value={row.component_name}
        onChange={(e) => inputHandler("component_name", e.target.value, row.ID)}
        disabled={row.component_name}
      />
    ),
  },
  {
    headerName: "Part Code",
    field: "part_code",
    width: 80,
    sortable: false,
    // width: "10vw",
    renderCell: ({ row }) => (
      <Input
        // size="small"
        //   value={row.total ? paymentTotal?.toFixed(2) : row.payment}
        value={row.part_code}
        onChange={(e) => inputHandler("part_code", e.target.value, row.ID)}
        disabled={row.part_code}
      />
    ),
  },
  {
    headerName: "MIN Date",
    // width: "20.5vw",
    field: "min_date",
    flex: 1,
    sortable: false,
    renderCell: ({ row }) =>
      !row.total && (
        <Input
          disabled
          onChange={(e) => {
            inputHandler("min_date", e.target.value, row.id);
          }}
          value={row?.min_date}
          name="min_date"
          id={row.ID}
        />
      ),
  },
  {
    headerName: "MIN Id",
    // width: "20.5vw",
    field: "min_id",
    flex: 1,
    sortable: false,
    renderCell: ({ row }) =>
      !row.total && (
        <Input
          disabled
          onChange={(e) => {
            inputHandler("min_id", e.target.value, row.id);
          }}
          value={row?.min_id}
          name="min_id"
          id={row.ID}
        />
      ),
  },
  {
    headerName: "MIN Rate",
    // width: "20.5vw",
    field: "min_rate",
    flex: 1,
    sortable: false,
    renderCell: ({ row }) =>
      !row.total && (
        <Input
          disabled
          onChange={(e) => {
            inputHandler("min_rate", e.target.value, row.id);
          }}
          value={row?.min_rate}
          name="min_rate"
          id={row.ID}
        />
      ),
  },
  {
    headerName: "MIN Available Qty",
    // width: "20.5vw",
    field: "min_available_qty",
    flex: 1,
    sortable: false,
    renderCell: ({ row }) =>
      !row.total && (
        <Input
          disabled
          onChange={(e) => {
            inputHandler("min_available_qty", e.target.value, row.id);
          }}
          value={row?.min_available_qty}
          name="min_available_qty"
          id={row.ID}
        />
      ),
  },
  {
    headerName: "Out Qty",
    // width: "20.5vw",
    field: "out_qty",
    flex: 1,
    sortable: false,
    renderCell: ({ row }) =>
      !row.total && (
        <Input
          onChange={(e) => {
            inputHandler("out_qty", e.target.value, row.id);
          }}
          value={row?.out_qty}
          name="out_qty"
          id={row.ID}
        />
      ),
  },
];
// const productMinItems = () => [
//   {
//     headerName: "#",
//     name: "",
//     width: 30,
//     field: (_, index) => (
//       <Typography.Text type="secondary">{index + 1}.</Typography.Text>
//     ),
//   },
//   {
//     headerName: "min ID",
//     name: "min_id",
//     width: 150,
//     // flex: true,
//     field: () => <Input disabled />,
//   },
//   {
//     headerName: "min date",
//     name: "min_date",
//     width: 150,
//     // flex: true,
//     field: () => <Input disabled />,
//   },
//   {
//     headerName: "Component Name",
//     name: "component_name",
//     width: 250,
//     field: () => <Input disabled />,
//   },
//   {
//     headerName: "min Rate",
//     name: "min_rate",
//     width: 100,
//     field: () => <Input />,
//   },
//   {
//     headerName: "min Available Qty",
//     name: "min_available_qty",
//     width: 150,
//     field: () => <Input disabled />,
//   },
//   {
//     headerName: "Out Qty",
//     name: "out_qty",
//     width: 150,
//     field: () => <Input />,
//   },
// ];
const productItemsEdit = (
  location,
  gstType,
  getLocationList,
  setlocationlist,
  locationlist,
  getComponentOptions,
  asyncOptions,
  setAsyncOptions,
  getComponentDetails
) => [
  {
    headerName: "#",
    name: "",
    width: 30,
    field: (_, index) => (
      <Typography.Text type="secondary">{index + 1}.</Typography.Text>
    ),
  },
  {
    headerName: "Products",
    name: "productname",
    width: 250,
    flex: true,
    field: () => <Input disabled />,
  },
  {
    headerName: "HSN Code",
    name: "hsncode",
    width: 150,
    field: () => <Input />,
  },
  {
    headerName: "Qty",
    name: "qty",
    width: 100,
    field: () => <Input />,
  },
  {
    headerName: "Rate",
    name: "rate",
    width: 100,
    field: () => <Input />,
  },
  {
    headerName: "Value",
    name: "value",
    width: 150,
    field: () => <Input disabled />,
  },
  {
    headerName: "GST %",
    name: "gstRate",
    width: 100,
    field: () => <MySelect options={gstRateOptions} />,
  },
  {
    headerName: "CGST",
    name: "cgst",
    width: 100,
    conditional: true,
    condition: (row) => gstType === "L",
    field: ({ row }) => <Input disabled />,
  },
  {
    headerName: "SGST",
    name: "sgst",
    width: 100,
    conditional: true,
    condition: (row) => gstType === "L",
    field: ({ row }) => <Input disabled />,
  },
  {
    headerName: "IGST",
    name: "igst",
    width: 100,
    conditional: true,
    condition: (row) => gstType === "I",
    field: (row) => <Input disabled />,
  },

  {
    headerName: "Pick up location",
    name: "pickuplocation",
    width: 150,
    field: (row) => (
      <MySelect
        // onBlur={() => setlocationlist([])}
        options={locationlist}
        // optionsState={locationlist}
        // selectLoading={loading === "select"}
      />
    ),
    // <MySelect options={location} />,
  },

  {
    headerName: "Product Description",
    name: "productdescription",
    width: 150,
    field: (row) => <TextArea row={3} />,
  },
  {
    headerName: "Remark",
    name: "challan_remark",
    width: 150,
    field: (row) => <Input />,
  },
];

const componentsItems = (location, gstType) => [
  {
    headerName: "#",
    name: "",
    width: 30,
    field: (_, index) => (
      <Typography.Text type="secondary">{index + 1}.</Typography.Text>
    ),
  },
  {
    headerName: "Components",
    name: "component",
    width: 250,
    flex: true,
    field: () => <Input disabled />,
  },
  {
    headerName: "Part Code",
    name: "partCode",
    width: 150,
    field: () => <Input disabled />,
  },
  {
    headerName: "Qty",
    name: "qty",
    width: 100,
    field: () => <Input />,
  },
  {
    headerName: "Rate",
    name: "rate",
    width: 100,
    field: () => <Input />,
  },
  {
    headerName: "Value",
    name: "value",
    width: 150,
    field: () => <Input disabled />,
  },
  {
    headerName: "GST %",
    name: "gstRate",
    width: 100,
    field: () => <MySelect options={gstRateOptions} />,
  },
  {
    headerName: "CGST",
    name: "cgst",
    width: 100,
    conditional: true,
    condition: (row) => gstType === "L",
    field: ({ row }) => <Input disabled />,
  },
  {
    headerName: "SGST",
    name: "sgst",
    width: 100,
    conditional: true,
    condition: (row) => gstType === "L",
    field: ({ row }) => <Input disabled />,
  },
  {
    headerName: "IGST",
    name: "igst",
    width: 100,
    conditional: true,
    condition: (row) => gstType === "I",
    field: (row) => <Input disabled />,
  },
  {
    headerName: "HSN Code",
    name: "hsn",
    width: 150,
    field: (row) => <Input />,
  },
  {
    headerName: "Pick Up Location",
    name: "pickuplocation",
    width: 150,
    field: (row) => <MySelect options={location} />,
  },
  {
    headerName: "Remark",
    name: "description",
    width: 150,
    field: (row) => <Input />,
  },
];
const gstTypeOptions = [
  {
    text: "Local",
    value: "L",
  },
  {
    text: "Interstate",
    value: "I",
  },
];

const gstRateOptions = [
  {
    text: "5%",
    value: 5,
  },
  {
    text: "12%",
    value: 12,
  },
  {
    text: "18%",
    value: 18,
  },
  {
    text: "28%",
    value: 28,
  },
];
const listRules = {
  hsn: [
    {
      required: true,
      message: "Please enter a hsn code!",
    },
  ],
  location: [
    {
      required: true,
      message: "Please select a Location!",
    },
  ],
  qty: [
    {
      required: true,
      message: "Please enter MIN Qty!",
    },
  ],
  rate: [
    {
      required: true,
      message: "Please component rate!",
    },
  ],

  hsncode: [
    {
      required: true,
      message: "Please select hsncode!",
    },
  ],
  secondary_product: [
    {
      required: true,
      message: "Please select secondary_product!",
    },
  ],
};
