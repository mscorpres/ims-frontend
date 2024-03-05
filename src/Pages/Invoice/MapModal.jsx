import { Button, Drawer, Form, Row } from "antd";
import React, { useEffect, useState } from "react";
import { imsAxios } from "../../axiosInterceptor";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { toast } from "react-toastify";

const MapModal = ({ open, close }) => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const getGSTGlGroups = async () => {
    try {
      setLoading(true);
      const { data } = await imsAxios.get(
        `/tally/invoice/fetchInvGroup?type=GST`
      );
      const arr = data.map((row) => ({ label: row.text, value: row.value }));
      form.setFieldValue("gstGls", arr);
    } catch (error) {
      form.setFieldValue("gstGls", []);
      console.log("error while fetching gst gl", error);
    } finally {
      setLoading(false);
    }
  };
  const getInvoiceGroup = async () => {
    try {
      setLoading("fetching");
      const { data } = await imsAxios.get(
        `tally/invoice/fetchInvGroup?type=INV01`
      );
      const arr = data.map((row) => ({ label: row.text, value: row.value }));
      form.setFieldValue("invoiceGls", arr);
    } catch (error) {
      form.setFieldValue("invoiceGls", []);
    } finally {
      setLoading([]);
    }
  };
  const getSubGroup = async (search) => {
    try {
      setLoading("select");
      const response = await imsAxios.post("/tally/getSubgroup", {
        search: search,
      });
      const { data } = response;
      if (data) {
        const arr = data.data.map((row) => ({
          text: row.label,
          value: row.id,
        }));

        setAsyncOptions(arr);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const submitHandler = async (type) => {
    try {
      let url = "/tally/invoice/updateInvGroup";
      let values;

      if (type === "INV01") {
        setLoading("submitting1");
        values = form.getFieldValue("invoiceGls");
      } else if (type === "GST") {
        setLoading("submitting2");
        values = form.getFieldValue("gstGls");
      }
      console.log(values);
      // values = values.map((row) => row.value);
      // console.log(values);

      const response = await imsAxios.put(url, {
        name: type,
        group: values,
      });
      toast.success(response.data);
    } catch (error) {
      console.log("error in updating groups", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGSTGlGroups();
    getInvoiceGroup();
  }, []);

  return (
    <Drawer
      width={450}
      title="Map Invoice"
      placement="right"
      onClose={close}
      open={open}
    >
      <Form form={form} layout="vertical">
        <Form.Item name="invoiceGls" label="Gl Options">
          <MyAsyncSelect
            mode="multiple"
            loadOptions={getSubGroup}
            selectLoading={loading === "select"}
            onBlur={() => setAsyncOptions([])}
            optionsState={asyncOptions}
          />
        </Form.Item>
        <Row justify="end">
          <Button
            loading={loading === "submitting1"}
            type="primary"
            onClick={() => submitHandler("INV01")}
          >
            Submit
          </Button>
        </Row>
        <Form.Item name="gstGls" label="GST Gl Options">
          <MyAsyncSelect
            mode="multiple"
            loadOptions={getSubGroup}
            selectLoading={loading === "select"}
            onBlur={() => setAsyncOptions([])}
            optionsState={asyncOptions}
          />
        </Form.Item>
        <Row justify="end">
          <Button
            loading={loading === "submitting2"}
            type="primary"
            onClick={() => submitHandler("GST")}
          >
            Submit
          </Button>
        </Row>
      </Form>
    </Drawer>
  );
};

export default MapModal;
