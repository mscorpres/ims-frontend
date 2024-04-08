import { useState } from "react";
import { Drawer, Row, Col, Form, Input, Card, Typography, Modal } from "antd";
import HeaderDetails from "./HeaderDetails";
import { imsAxios } from "../../../../axiosInterceptor";
import { useEffect } from "react";
import Components from "./Components";
import NavFooter from "../../../../Components/NavFooter";
import { toast } from "react-toastify";
import Loading from "../../../../Components/Loading";
import useLoading from "../../../../hooks/useLoading";
import { v4 } from "uuid";

const JwReturnModel = ({ show, close }) => {
  const [headerDetails, setHeaderDetails] = useState([]);
  const [loading, setLoading] = useLoading();
  const [totalValue, setTotalValue] = useState(0);
  const [rows, setRows] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [autoConsOptions, setAutoConsumptionOption] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const [form] = Form.useForm();

  const getLocationOptions = async () => {
    try {
      const { data } = await imsAxios.get("/jobwork/jw_rm_return_location");
      setLoading("fetch", true);
      if (data) {
        const arr = data.data.map((row) => ({
          text: row.text,
          value: row.id,
        }));

        setLocationOptions(arr);
      }
    } catch (error) {
      console.log("some error while fetching locations", error);
    } finally {
      setLoading("fetch", false);
    }
  };
  const getAutoComnsumptionOptions = async () => {
    // setPageLoading(true);
    let { data } = await imsAxios.get("/transaction/fetchAutoConsumpLocation");
    // setPageLoading(false);
    if (data.code == 200) {
      let arr = data.data.map((row) => {
        return {
          value: row.id,
          text: row.text,
        };
      });
      arr = [{ text: "NO", value: 0 }, ...arr];
      setAutoConsumptionOption(arr);
    }
  };
  const getData = async (sku, transaction) => {
    try {
      setLoading("fetch", true);
      const { data } = await imsAxios.post("/jobwork/getJwRmReturnData", {
        skucode: sku,
        transaction: transaction,
      });
      const headerValues = data.header;
      let headerArr = [];
      const headerObj = {
        "Created By": headerValues.created_by,
        "Jobwork Id": headerValues.jobwork_id,
        Status: headerValues.jw_status,
        "Ordered Qty": headerValues.ordered_qty,
        "Processed Qty": headerValues.proceed_qty,
        Product: headerValues.product_name,
        Sku: headerValues.sku_code,
        "Registered Date": headerValues.registered_date,
      };

      for (let key in headerObj) {
        if (headerObj.hasOwnProperty(key)) {
          headerArr.push({
            title: key,
            value: headerObj[key],
          });
        }
      }

      const componentArr = data.data.map((row) => ({
        id: v4(),
        component: row.component,
        componentKey: row.component_key,
        gst: row.gst_rate,
        hsn: row.hsncode,
        partCode: row.partcode,
        uom: row.unitsname,
      }));

      setRows(componentArr);
      setHeaderDetails(headerArr);
    } catch (error) {
      console.log("Error while fetching data", error);
    } finally {
      setLoading("fetch", false);
    }
  };
  const validateHandler = async () => {
    const values = await form.validateFields();
    console.log("selectedRows", selectedRows);
    const finalObj = {
      trans_id: show.transaction,
      component: selectedRows.map((row) => row.component.value),
      qty: selectedRows.map((row) => row.qty),
      in_location: selectedRows.map((row) => row.location?.value ?? "--"),
      out_location: selectedRows.map((row) => row.autoCons?.value ?? 0),
      rate: selectedRows.map((row) => row.rate),
      invoice: selectedRows.map((row) => row.invoiceId ?? ""),
      remark: selectedRows.map((row) => row.remark ?? "--"),
      hsncode: selectedRows.map((row) => row.hsn),
      ewaybill: values.ewayBill ?? "--",
    };
    // return;

    Modal.confirm({
      title: "Are you sure you want to submit?",
      content:
        "Please make sure that the values are correct, This process is irreversible",
      onOk() {
        submitHandler(finalObj);
      },
      onCancel() {},
    });
  };
  const submitHandler = async (values) => {
    try {
      setLoading("submit", true);
      const response = await imsAxios.post("/jobwork/saveJwRmReturn", values);
      console.log("response", response);
      let { data } = response;
      if (response.success) {
        // console.log("data.message", data.message.msg);
        toast.success(response.message.msg);
        close();
      }
    } catch (error) {
      console.log("some error while submitting the data", error);
    } finally {
      setLoading("submit", false);
    }
  };
  useEffect(() => {
    if (rows) {
      const values = selectedRows.map((row) => row.value ?? 0);
      const total = values.reduce((a, b) => a + +b, 0);
      setTotalValue(+Number(total).toFixed(3));
    }
  }, [selectedRows]);
  useEffect(() => {
    if (show) {
      getData(show.sku, show.transaction);
      getAutoComnsumptionOptions();
      getLocationOptions();
    }
  }, [show]);
  return (
    <Drawer
      width="100%"
      title="Vendor Name"
      placement="right"
      onClose={() => {
        close();
        setSelectedRows([]);
      }}
      destroyOnClose={true}
      open={show}
      bodyStyle={{
        padding: 5,
      }}
    >
      {loading("fetch") && <Loading />}
      <Form form={form} layout="vertical" style={{ height: "100%" }}>
        <Row style={{ height: "90%", overflow: "hidden" }} gutter={6}>
          <Col span={6}>
            <Row gutter={[0, 6]}>
              <Col span={24}>
                <HeaderDetails headerDetails={headerDetails} />
              </Col>

              <Col span={24}>
                <Card size="small" title="Header Details">
                  <Form.Item name="ewayBill" label="E-Way Bill No.">
                    <Input />
                  </Form.Item>
                </Card>
              </Col>

              <Col span={24}>
                <Card size="small">
                  <Row justify="space-between">
                    <Col>
                      <Typography.Text strong>Total Value</Typography.Text>
                    </Col>
                    <Col>
                      <Typography.Text>
                        {!totalValue || totalValue === NaN ? 0 : totalValue}
                      </Typography.Text>
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Col>
          <Col span={18} style={{ height: "100%", overflow: "auto" }}>
            <Components
              form={form}
              locationOptions={locationOptions}
              autoConsOptions={autoConsOptions}
              setAutoConsumptionOption={setAutoConsumptionOption}
              formRules={formRules}
              rows={rows}
              setRows={setRows}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
            />
          </Col>
        </Row>
      </Form>
      <NavFooter
        submitFunction={validateHandler}
        nextDisabled={selectedRows.length === 0}
        nextLabel="Submit"
        backLabel="Back"
        loading={loading("submit")}
        backFunction={close}
      />
    </Drawer>
  );
};

export default JwReturnModel;

const formRules = {
  ewaybill: [{ required: true, message: "Please enter e-way bill number" }],
  qty: [{ required: true, message: "Please enter e-way bill number" }],
  rate: [{ required: true, message: "Please enter e-way bill number" }],
  location: [{ required: true, message: "Please enter e-way bill number" }],
};
