import { Modal, Row, Typography } from "antd";
import React, { useState } from "react";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { getComponentOptions } from "../../../api/general.ts";

import useApi from "../../../hooks/useApi.ts";
export default function AddEmergingComponent({
  addingEmergingPart,
  setAddingEmergingPart,
  next,
}) {
  const [loading, setLoading] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [emergingPart, setEmergingPart] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState(false);
  const { executeFun, loading: loading1 } = useApi();

  const getComponentsOption = async (searchTerm) => {
    // setLoading("select");
    // const response = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search: searchTerm,
    // });
    // setLoading(false);
    const response = await executeFun(
      () => getComponentOptions(searchTerm),
      "select"
    );
    const { data } = response;
    if (data) {
      if (data[0]) {
        let arr = data.map((row) => ({
          text: row.text,
          value: row.id,
        }));
        setAsyncOptions(arr);
      } else {
        setAsyncOptions([]);
      }
    }
  };
  const handleSubmitConfirm = async () => {
    if (!emergingPart || emergingPart === "") {
      setError(true);
      return;
    }
    let obj = {
      ...addingEmergingPart,
      emergingPart,
    };
    setConfirm(obj);
  };
  const submitEmerginPart = async () => {
    console.log(confirm);
    setLoading("submit");
    const response = await imsAxios.post("bom/saveEmergingPart", {
      emerging_part: confirm.emergingPart,
      parent_part: confirm.parent_part,
      subject: confirm.subject,
    });
    setLoading(false);
    const { data } = response;
    if (data.code === 200) {
      toast.success(data.message);
      setConfirm(false);
      setAddingEmergingPart(false);
      setEmergingPart("");
      next();
    } else {
      toast.error(data.message.msg);
    }
  };
  const handleCancel = () => {
    if (!confirm) {
      setAddingEmergingPart(false);
    }
    setConfirm(false);
    setEmergingPart("");
  };
  useEffect(() => {
    setEmergingPart("");
  }, [setEmergingPart]);
  return (
    <Modal
      title="Adding a merging part "
      open={addingEmergingPart}
      onOk={confirm ? submitEmerginPart : handleSubmitConfirm}
      confirmLoading={loading === "submit"}
      onCancel={handleCancel}
      okText={confirm ? "Yes" : "Save"}
      cancelText={confirm ? "No" : "Back"}
    >
      <Row>
        <Typography.Title level={5}>
          Parent BOM: {addingEmergingPart.bom}
        </Typography.Title>
      </Row>
      <Row style={{ marginBottom: 20 }}>
        <Typography.Title level={5}>
          Parent Component: {addingEmergingPart.componentName}
        </Typography.Title>
      </Row>
      <div style={{ marginTop: 30 }}>
        <p>Select emerging component</p>
        <MyAsyncSelect
          loadOptions={getComponentsOption}
          optionsState={asyncOptions}
          onBlur={() => setAsyncOptions([])}
          selectLoading={loading1("select")}
          onChange={(value) => {
            setError(false);
            setEmergingPart(value);
          }}
          value={emergingPart}
        />
      </div>
      {confirm && (
        <Typography.Text style={{ color: "#1890FF" }}>
          Are you sure you want to add the following part as an emerging
          component?
        </Typography.Text>
      )}
      {error && (
        <Typography.Text style={{ color: "red" }}>
          Please select a component!!
        </Typography.Text>
      )}
    </Modal>
  );
}
