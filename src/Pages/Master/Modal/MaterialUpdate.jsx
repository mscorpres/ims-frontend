import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Input,
  Row,
  Space,
  Upload,
  Select,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import MySelect from "../../../Components/MySelect";
import Loading from "../../../Components/Loading";
// import ImageAddModal from "./ImageAddModal";
const { TextArea } = Input;

export default function MaterialUpdate({
  materialModal,
  setMaterialModal,
  allComponent,
}) {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [imageModal, setImageModal] = useState(false);
  const [allUpdateData, setAllUpdataData] = useState([]);
  console.log(allUpdateData);
  const [allData, setAllData] = useState({
    partno: "",
    name: "",
    uom: {},
    category: {},
    mrp: "",
    groupOpt: {},
    enableValue: {},
    jobwork: "",
    status: {},
    description: "",

    local: "",
    gst: "",

    brand: "",
    ean: "",
    weight: "",
    volWeight: "",
    heigh: "",
    wid: "",

    minStock: "",
    maxStock: "",
    minOrder: "",
    defStockLocation: "",
    leadTime: "",
    enableAlerts: "",
    pucharseCost: "",
    otherCost: "",
  });
  const [group, setGroup] = useState([]);
  const [uom, setUom] = useState([]);
  const [selComponent, setComponent] = useState([]);
  const [loading, setLoading] = useState(false);

  const opt = [
    { label: "Cat 1", value: "P" },
    { label: "Cat 2", value: "PCK" },
    { label: "Cat 3", value: "O" },
  ];

  const getEnable = [
    { label: "Not Selected", value: "0" },
    { label: "Yes", value: "Y" },
    { label: "No", value: "N" },
  ];

  const getEnable1 = [
    { label: "Yes", value: "E" },
    { label: "No", value: "D" },
    { label: "Please Select Value", value: "0" },
  ];

  const getLocal = [
    { label: "Local", value: "L" },
    { label: "Inter State", value: "I" },
  ];

  const getGst = [
    { label: "05", value: "05" },
    { label: "12", value: "12" },
    { label: "18", value: "18" },
    { label: "28", value: "28" },
  ];
  const categoryOptions = [
    { text: "Assembly", value: "assembly" },
    { text: "Other", value: "other" },
    { text: "SMT", value: "smt" },
  ];
  const getGroup = async (e) => {
    if (e?.length > 2) {
      const { data } = await imsAxios.post("/groups/groupSelect2", {
        searchTerm: e,
      });
      let arr = [];
      arr = data.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
      // return arr;
    }
  };

  const getUOM = async (e) => {
    const { data } = await imsAxios.post("/uom/uomSelect2", {
      searchTerm: e,
    });
    let arr = [];
    arr = data.data.map((d) => {
      return { label: d.text, value: d.id };
    });
    // console.log(arr);
    setUom(arr);
  };

  const getFetchUpdate = async () => {
    // setAllData({
    //   partno: "",
    //   name: "",
    //   uom: {},
    //   category: {},
    //   mrp: "",
    //   groupOpt: {},
    //   enableValue: {},
    //   jobwork: "",
    //   status: {},
    //   description: "",
    // });
    setLoading("fetch");
    const { data } = await imsAxios.post("/component/fetchUpdateComponent", {
      componentKey: materialModal,
    });
    setLoading(false);

    // console.log(data);
    data.data.map((an) => setAllUpdataData(an));
  };

  // console.log(allUpdateData);
  // without row/
  const inputHandler = (name, value) => {
    console.log(name, value);
    setAllUpdataData((detail) => {
      return {
        ...detail,
        [name]: value,
      };
    });
  };

  const updateComponent = async () => {
    // console.log(allUpdateData?.uomname);
    // console.log(allUpdateData?.uomid);
    if (!allUpdateData.uomname) {
      toast.error("Please Select UoM");
    } else {
      setLoading("submit");

      const { data } = await imsAxios.post("/component/updateComponent", {
        componentKey: materialModal,
        componentname: allUpdateData?.name,
        uom: allUpdateData?.uomid,
        category: "--",
        mrn: allUpdateData?.mrp,
        group: allUpdateData?.groupid,
        enable_status: allUpdateData?.enable_status,
        jobwork_rate: allUpdateData?.jobwork_rate,
        qc_status: allUpdateData?.qc_status,
        description: allUpdateData?.description,
        taxtype: allUpdateData?.tax_type,
        taxrate: allUpdateData?.gst_rate,
        brand: allUpdateData?.brand,
        ean: allUpdateData?.ean,
        weightgms: allUpdateData?.weight,
        vweightgms: allUpdateData?.vweight,
        height: allUpdateData?.height,
        width: allUpdateData?.width,
        minqty: allUpdateData?.minqty,
        maxqty: allUpdateData?.maxqty,
        minorder: allUpdateData?.minorderqty,
        leadtime: allUpdateData?.leadtime,
        alert: allUpdateData?.alert_status,
        pocost: allUpdateData?.pocost,
        othercost: allUpdateData?.othercost,
        componentcategory: allUpdateData?.category,
      });
      setLoading(false);
      if (data.code == 200) {
        setMaterialModal(false);
        allComponent();
      } else if (data.code == 500) {
        toast.error(data.message.msg);
      }
    }
  };

  useEffect(() => {
    if (materialModal) {
      getFetchUpdate();
      getUOM();
      // getGroup();
      // console.log("first");
    }
  }, [materialModal]);

  useEffect(() => {
    if (materialModal) {
      // console.log(allUpdateData);
      console.log(materialModal);
      console.log(allUpdateData);
    }
    //   if (materialModal) {
    //     // console.log(allUpdateData.uomname);
    //     // console.log(allUpdateData.uomid);
    //   }
  }, [materialModal]);

  return (
    <Drawer
      width="100vw"
      title="Update Component"
      placement="right"
      closable={false}
      onClose={() => setMaterialModal(false)}
      open={materialModal}
      getContainer={false}
      style={{
        position: "absolute",
      }}
      extra={
        <Space>
          <Button
            loading={loading === "submit"}
            type="primary"
            onClick={updateComponent}
          >
            Update
          </Button>
          <Button
            style={{ background: "red", color: "white" }}
            onClick={() => setMaterialModal(false)}
          >
            Cancel
          </Button>
        </Space>
      }
    >
      {loading === "fetch" && <Loading />}
      <Row gutter={16}>
        <Col span={24}>
          <div>
            <span>Basic Details:</span>
          </div>
        </Col>

        <Col span={6}>
          <div>Component Code</div>
          <Input
            value={allUpdateData?.partcode}
            style={{ width: "100%" }}
            disabled
          />
        </Col>
        <Col span={6}>
          <div>Component Name</div>
          <Input
            value={allUpdateData?.name}
            style={{ width: "100%" }}
            onChange={(e) => inputHandler("name", e.target.value)}
          />
        </Col>
        <Col span={6}>
          {/* {console.log(allUpdateData)} */}
          <div>UoM</div>
          <Select
            options={uom}
            value={allUpdateData?.uomid}
            style={{ width: "100%" }}
            onChange={(e) => inputHandler("uomid", e)}
          />
        </Col>
        <Col span={6}>
          <div>Component Category</div>
          <MySelect
            value={allUpdateData?.category}
            onChange={(e) => inputHandler("category", e)}
            options={categoryOptions}
          />
        </Col>
        <Col span={6}>
          <div>MRP</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.mrp}
            onChange={(e) => inputHandler("mrp", e.target.value)}
          />
        </Col>
        <Col span={6}>
          <div>Component Group</div>
          <MyAsyncSelect
            style={{ width: "100%" }}
            onBlur={() => setAsyncOptions([])}
            loadOptions={getGroup}
            optionsState={asyncOptions}
            onChange={(e) => inputHandler("groupid", e)}
            value={allUpdateData?.groupid}
          />
        </Col>
        <Col span={6}>
          <div>Enabled</div>
          <Select
            value={allUpdateData?.enable_status}
            options={getEnable}
            style={{ width: "100%" }}
            onChange={(e) => inputHandler("enable_status", e)}
          />
        </Col>
        <Col span={6}>
          <div> Job Work</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.jobwork_rate}
            onChange={(e) => inputHandler("jobwork_rate", e.target.value)}
          />
        </Col>
        <Col span={6}>
          <div>QC Status</div>
          <Select
            value={allUpdateData?.qc_status}
            options={getEnable1}
            style={{ width: "100%" }}
            onChange={(e) => inputHandler("qc_status", e)}
          />
        </Col>
        <Col span={6}>
          <div>Component Description</div>
          <TextArea
            style={{ width: "100%" }}
            value={allUpdateData?.description}
            onChange={(e) => inputHandler("description", e.target.value)}
          />
        </Col>
        <Divider></Divider>

        {/* Tax Details */}
        <Col span={24}>
          <div>Tax Details :</div>
        </Col>
        <Col span={6}>
          <div>Tax Type</div>
          <Select
            style={{ width: "100%" }}
            value={allUpdateData.tax_type}
            options={getLocal}
            onChange={(e) => inputHandler("tax_type", e)}
          />
        </Col>
        <Col span={6}>
          <div>GST Tax Rate</div>
          <Select
            style={{ width: "100%" }}
            value={allUpdateData?.gst_rate}
            options={getGst}
            onChange={(e) => inputHandler("gst_rate", e)}
          />
        </Col>

        <Divider></Divider>

        {/* Advance Details :*/}
        <Col span={24}>
          <div>Advance Details :</div>
        </Col>
        <Col span={6}>
          <div>Brand</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.brand}
            onChange={(e) => inputHandler("brand", e.target.value)}
          />
        </Col>
        <Col span={6}>
          <div>EAN</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.ean}
            onChange={(e) => inputHandler("ean", e.target.value)}
          />
        </Col>
        <Col span={6}>
          <div>Weight (gms)</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.weight}
            onChange={(e) => inputHandler("weight", e.target.value)}
          />
        </Col>
        <Col span={6}>
          <div>Volumetric Weight (gms)</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.vweight}
            onChange={(e) => inputHandler("vweight", e.target.value)}
          />
        </Col>
        <Col span={6}>
          <div>Height (mm)</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.height}
            onChange={(e) => inputHandler("height", e.target.value)}
          />
        </Col>
        <Col span={6}>
          <div>Width (mm)</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.width}
            onChange={(e) => inputHandler("width", e.target.value)}
          />
        </Col>

        <Divider></Divider>
        <Col span={24}>
          <div>Production Plan :</div>
        </Col>
        <Col span={6}>
          <div>Min Stock</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.minqty}
            onChange={(e) => inputHandler("minqty", e.target.value)}
          />
        </Col>
        <Col span={6}>
          <div>Max Stock</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.maxqty}
            onChange={(e) => inputHandler("maxqty", e.target.value)}
          />
        </Col>
        <Col span={6}>
          <div>Min Order</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.minorderqty}
            onChange={(e) => inputHandler("minorderqty", e.target.value)}
          />
        </Col>
        {/* <Col span={6}>
              <div>Default Stock Location</div>
              <Input style={{ width: "100%" }} />
            </Col> */}
        <Col span={6}>
          <div>Lead Time ( in days)</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.leadtime}
            onChange={(e) => inputHandler("leadtime", e.target.value)}
          />
        </Col>
        <Col span={6}>
          <div>Enable Alert</div>
          <Select
            style={{ width: "100%" }}
            value={allUpdateData?.alert_status}
            options={getEnable}
            onChange={(e) => inputHandler("alert_status", e)}
          />
        </Col>
        <Col span={6}>
          <div>Purchase Cost</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.pocost}
            onChange={(e) => inputHandler("pocost", e.target.value)}
          />
        </Col>
        <Col span={6}>
          <div>Other Cost</div>
          <Input
            style={{ width: "100%" }}
            value={allUpdateData?.othercost}
            onChange={(e) => inputHandler("othercost", e.target.value)}
          />
        </Col>
        <Divider></Divider>
      </Row>
    </Drawer>
  );
}
