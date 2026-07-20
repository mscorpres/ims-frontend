import { Modal, Row, Typography } from "antd";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { imsAxios } from "../../../../axiosInterceptor";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { getComponentOptions } from "../../../../api/general.ts";
import useApi from "../../../../hooks/useApi.ts";

const MapFgRmModal = ({ show, close, refresh }) => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [mappedComponent, setMappedComponent] = useState("");
  const [component, setComponent] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { executeFun, loading } = useApi();

  const getMappedComponent = async () => {
    const response = await imsAxios.get("/bom/fetch_sfgInward_rm", {
      params: { subject_id: show.id, sku: show.sku },
    });
    const { data } = response;
    if (data && data.code === 200 && data.data?.rm_name) {
      setMappedComponent(data.data.rm_name);
    } else {
      setMappedComponent("");
    }
  };

  const getComponentsOption = async (searchTerm) => {
    const response = await executeFun(
      () => getComponentOptions(searchTerm),
      "select"
    );
    const { data } = response;
    if (data && data[0]) {
      const arr = data.map((row) => ({
        text: row.text,
        value: row.id,
      }));
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };

  const handleSubmit = async () => {
    if (!component) {
      setError(true);
      return;
    }
    setSubmitting(true);
    const response = await imsAxios.post("/bom/update_sfgInward_rm", {
      subject: show.id,
      sku: show.sku,
      sfgrm: component,
    });
    setSubmitting(false);
    const { data } = response;
    if (data && data.code === 200) {
      toast.success(data.message?.msg || "Component mapped successfully");
      handleCancel();
      refresh?.();
    } else {
      toast.error(data?.message?.msg || "Something went wrong");
    }
  };

  const handleCancel = () => {
    setComponent("");
    setAsyncOptions([]);
    setMappedComponent("");
    setError(false);
    close();
  };

  useEffect(() => {
    if (show) {
      getMappedComponent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  return (
    <Modal
      title="Map FG RM"
      open={!!show}
      onOk={handleSubmit}
      confirmLoading={submitting}
      onCancel={handleCancel}
      okText="Map"
    >
      <Row style={{ marginBottom: 20 }}>
        <Typography.Title level={5}>
          Product: {show?.name}
        </Typography.Title>
      </Row>
      <Row style={{ marginBottom: 20 }}>
        <Typography.Text>
          Currently mapped component: {mappedComponent || "None"}
        </Typography.Text>
      </Row>
      <div>
        <p>Select component to map</p>
        <MyAsyncSelect
          loadOptions={getComponentsOption}
          optionsState={asyncOptions}
          onBlur={() => setAsyncOptions([])}
          selectLoading={loading("select")}
          onChange={(value) => {
            setError(false);
            setComponent(value);
          }}
          value={component}
        />
      </div>
      {error && (
        <Typography.Text style={{ color: "red" }}>
          Please select a component!!
        </Typography.Text>
      )}
    </Modal>
  );
};

export default MapFgRmModal;
