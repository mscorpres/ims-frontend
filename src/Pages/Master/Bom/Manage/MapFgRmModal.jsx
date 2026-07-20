import { Modal, Row, Typography } from "antd";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { imsAxios } from "../../../../axiosInterceptor";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";

const MapFgRmModal = ({ show, close, refresh }) => {
  const [componentsList, setComponentsList] = useState([]);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [mappedComponent, setMappedComponent] = useState("");
  const [mappedComponentId, setMappedComponentId] = useState("");
  const [component, setComponent] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingList, setFetchingList] = useState(false);

  const getMappedComponent = async () => {
    const response = await imsAxios.get("/bom/fetch_sfgInward_rm", {
      params: { subject_id: show.id, sku: show.sku },
    });
    const { data } = response;
    if (
      data &&
      data.code === 200 &&
      data.data?.rm_name?.text &&
      data.data.rm_name.text !== "--"
    ) {
      setMappedComponent(data.data.rm_name.text);
      setMappedComponentId(data.data.rm_name.id);
    } else {
      setMappedComponent("");
      setMappedComponentId("");
    }
  };

  const getBomComponents = async () => {
    setFetchingList(true);
    const response = await imsAxios.post(
      "/bom/fetchComponentsInBomForUpdate",
      { subject_id: show.id }
    );
    setFetchingList(false);
    const { data } = response;
    if (data && data.code === 200 && data.data) {
      const arr = data.data.map((row) => ({
        text: `${row.component} (${row.partcode})`,
        value: row.compKey,
      }));
      setComponentsList(arr);
      setAsyncOptions(arr);
    } else {
      setComponentsList([]);
      setAsyncOptions([]);
    }
  };

  const getComponentsOption = async (searchTerm) => {
    const arr = componentsList.filter((row) =>
      row.text?.toLowerCase().includes((searchTerm || "").toLowerCase())
    );
    setAsyncOptions(arr);
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
    setComponentsList([]);
    setMappedComponent("");
    setMappedComponentId("");
    setError(false);
    close();
  };

  useEffect(() => {
    if (show) {
      getMappedComponent();
      getBomComponents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    if (
      mappedComponentId &&
      componentsList.some((row) => row.value === mappedComponentId)
    ) {
      setComponent(mappedComponentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappedComponentId, componentsList]);

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
          selectLoading={fetchingList}
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
