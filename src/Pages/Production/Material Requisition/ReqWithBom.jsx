import { useEffect, useState } from "react";
import ReqWithBomModal from "./Modal/ReqWithBomModal";
import { toast } from "react-toastify";
import { Form, Input, Typography } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import MySelect from "../../../Components/MySelect";
import NavFooter from "../../../Components/NavFooter";
import { imsAxios } from "../../../axiosInterceptor";
import Loading from "../../../Components/Loading";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox";

const ReqWithBom = () => {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState(true);
  const [location, setLocation] = useState([]);
  const [location1, setLocation1] = useState([]);
  const [selectLoading, setSelectLoading] = useState(null);
  const [detailLocation, setDetailLocation] = useState("");
  const [detailLocation1, setDetailLocation1] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const [detailProductName, setDetailProductName] = useState("");
  const [detailBom, setDetailBom] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [allBom, setAllBom] = useState({
    locValue: "",
    proSku: "",
    proBom: "",
    qty: "",
    remark: "",
    locSecond: "",
  });

  const getLocationValueFetch = async () => {
    setSelectLoading(true);
    const { data } = await imsAxios.post(
      "/production/fetchLocationForWitoutBom"
    );
    setSelectLoading(false);
    const locArr = [];
    data.data.map((obj) => locArr.push({ text: obj.text, value: obj.id }));
    setLocation(locArr);
  };
  const getLocation = async () => {
    setSelectLoading(true);
    const { data } = await imsAxios.post(
      "/transaction/getMaterialRequestPickLocation"
    );
    setSelectLoading(false);
    const locArr1 = [];
    data.data.data.map((obj) =>
      locArr1.push({ text: obj.text, value: obj.id })
    );
    setLocation1(locArr1);
  };

  const locationDetail = async (locValue, setFun) => {
    setPageLoading(true);
    const { data } = await imsAxios.post("/production/fetchLocationDetail", {
      location_key: locValue,
    });
    setPageLoading(false);
    setFun(data.data);
  };

  const getProductSkuFetch = async (e) => {
    if (e?.length > 2) {
      setSelectLoading(true);
      const { data } = await imsAxios.post("/backend/getProductByNameAndNo", {
        search: e,
      });
      setSelectLoading(false);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const getProductName = async () => {
    setPageLoading(true);
    const { data } = await imsAxios.post("/production/getProductDetail", {
      p_key: allBom.proSku.value,
    });
    setDetailProductName(data.data);
    setPageLoading(false);
    const sto = [];
    data.boms.map((ob) => sto.push({ text: ob.text, value: ob.id }));
    setDetailBom(sto);
  };

  const nextPage = () => {
    if (!allBom.locValue) {
      toast.error("Please Select Shifting Location first");
    } else if (!allBom.proSku) {
      toast.error("Please Select Product SKU first");
    } else if (!allBom.proBom) {
      toast.error("Please Select Product BOM first");
    } else if (!allBom.qty) {
      toast.error("Please Enter Quantity first");
    } else {
      setTab(!true);
    }
  };

  const back = () => {
    setTab(!false);
  };

  const reset = () => {
    setAllBom({
      locValue: "",
      proSku: "",
      proBom: "",
      qty: "",
      remark: "",
    });
    setDetailLocation("");
    setDetailProductName("");
  };

  useEffect(() => {
    getLocationValueFetch();
    getLocation();
    if (allBom.locValue) {
      locationDetail(allBom.locValue, setDetailLocation);
    }
  }, [allBom.locValue]);
  useEffect(() => {
    getLocationValueFetch();
    getLocation();
    if (allBom.locSecond) {
      locationDetail(allBom.locSecond, setDetailLocation1);
    }
  }, [allBom.locSecond]);

  useEffect(() => {
    if (allBom.proSku) {
      getProductName();
    }
  }, [allBom.proSku]);
  const { Title, Text } = Typography;
  return (
    <>
      {/* {pageLoading && <Loading />} */}
      {tab ? (
        <div
          style={{
            overflowY: "auto",
            overflowX: "hidden",
            maxHeight: "90%",
            padding: 20,
          }}
        >
          {pageLoading && <Loading />}
          <div className="grid grid-cols-2" style={{ gap: 12 }}>
            <CustomFieldBox
              title={"Location"}
              subtitle={"Provide Product shifting request location"}
            >
              <div className="grid grid-cols-2" style={{ gap: 12 }}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Shifting Location
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please Select a Shifting Location!",
                      },
                    ]}
                  >
                    <MySelect
                      size="default"
                      placeholder="Select a shifting Location"
                      value={allBom.locValue}
                      selectLoading={selectLoading}
                      options={location}
                      onChange={(e) =>
                        setAllBom((allBom) => {
                          return { ...allBom, locValue: e };
                        })
                      }
                    />
                  </Form.Item>
                </Form>{" "}
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Location Details
                      </span>
                    }
                  >
                    <Text>{detailLocation ? detailLocation : "--"} </Text>
                  </Form.Item>
                </Form>{" "}
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Pick Location
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Pick Location",
                      },
                    ]}
                  >
                    <MySelect
                      size="default"
                      placeholder="Pick Location"
                      value={allBom.locSecond}
                      selectLoading={selectLoading}
                      options={location1}
                      onChange={(e) =>
                        setAllBom((allBom) => {
                          return { ...allBom, locSecond: e };
                        })
                      }
                    />
                  </Form.Item>
                </Form>{" "}
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Pick Location Details
                      </span>
                    }
                  >
                    <Text>{detailLocation1 ? detailLocation1 : "--"} </Text>
                  </Form.Item>
                </Form>
              </div>
            </CustomFieldBox>
            <CustomFieldBox
              title={"Product"}
              subtitle={"Product Provide Product SKU or its BOM type"}
            >
              <div className="grid grid-cols-2" style={{ gap: 12 }}>
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Product SKU
                      </span>
                    }
                  >
                    <MyAsyncSelect
                      selectLoading={selectLoading}
                      onBlur={() => setAsyncOptions([])}
                      value={allBom.proSku}
                      onChange={(e) =>
                        setAllBom((allBom) => {
                          return { ...allBom, proSku: e };
                        })
                      }
                      loadOptions={getProductSkuFetch}
                      labelInValue
                      optionsState={asyncOptions}
                    />
                  </Form.Item>
                </Form>{" "}
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Product Name
                      </span>
                    }
                  >
                    <Text>
                      {" "}
                      {detailProductName.productname
                        ? detailProductName.productname
                        : "--"}{" "}
                    </Text>
                  </Form.Item>
                </Form>{" "}
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Product BOM
                      </span>
                    }
                  >
                    <MySelect
                      options={detailBom}
                      value={allBom.proBom}
                      onChange={(e) =>
                        setAllBom((allBom) => {
                          return { ...allBom, proBom: e };
                        })
                      }
                      placeholder="Select product BOM"
                    />
                  </Form.Item>
                </Form>{" "}
                <Form size="small" layout="vertical">
                  <Form.Item
                    label={
                      <span
                        style={{
                          fontSize: window.innerWidth < 1600 && "0.7rem",
                        }}
                      >
                        Product Qty
                      </span>
                    }
                  >
                    <Input
                      size="default"
                      value={allBom.qty}
                      onChange={(e) =>
                        setAllBom((allBom) => {
                          return { ...allBom, qty: e.target.value };
                        })
                      }
                      placeholder="Select product Quantity"
                    />
                  </Form.Item>
                </Form>
              </div>
            </CustomFieldBox>
            <CustomFieldBox title={"Remark"} subtitle={"Remark (if any)"}>
              <Form size="small" layout="vertical">
                <Form.Item
                  label={
                    <span
                      style={{
                        fontSize: window.innerWidth < 1600 && "0.7rem",
                      }}
                    >
                      Remarks
                    </span>
                  }
                  rules={[
                    {
                      required: true,
                      message: "Please Enter bill from address!",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={4}
                    value={allBom.remark}
                    onChange={(e) =>
                      setAllBom((allBom) => {
                        return { ...allBom, remark: e.target.value };
                      })
                    }
                    placeholder="Enter Remarks"
                    style={{ resize: "none" }}
                  />
                </Form.Item>
              </Form>
            </CustomFieldBox>
          </div>

          <NavFooter resetFunction={reset} submitFunction={nextPage} />
        </div>
      ) : (
        <>
          <ReqWithBomModal
            allBom={allBom}
            back={back}
            loading={loading}
            setLoading={setLoading}
            setTab={setTab}
            reset={reset}
          />
        </>
      )}
    </>
  );
};

export default ReqWithBom;
