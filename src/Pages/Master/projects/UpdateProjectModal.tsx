import { useState, useEffect } from "react";
import { Modal, Input, Button, Form, message } from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import {
  getCostCentresOptions,
  getBomOptions,
} from "../../../api/general.ts";
import { convertSelectOptions } from "@/utils/general";
import useApi from "@/hooks/useApi";

const UpdateProjectModal = ({ 
  data, 
  setIsModalVisible, 
  isModalVisible, 
  onUpdate 
}) => {
  const [form] = Form.useForm();

  const [fgBomOptions, setFgBomOptions] = useState([]);
  const [sfgBomOptions, setSfgBomOptions] = useState([]);
  const [costCenterOptions, setCostCenterOptions] = useState([]); 


  const { executeFun } = useApi();
  const getRecipeType = (row: any) => {
    const label = String(row?.bom_type_label ?? "")
      .trim()
      .toLowerCase();
    if (label === "sfg") return "semi";
    if (label === "fg") return "default";
    return String(
      row?.bom_recipe_type ??
        row?.recipe_type ??
        row?.type ??
        row?.bom_recipe ??
        ""
    )
      .trim()
      .toLowerCase();
  };
  const isFgType = (type: string) => ["default", "fg", "finished"].includes(type);
  const isSfgType = (type: string) => ["semi", "sfg", "semi-fg", "semifg"].includes(type);
  const toSelectOptions = (rows: any[]) =>
    (rows ?? []).map((row: any) => ({
      text: row?.text ?? row?.subject_name ?? row?.name ?? "",
      value: row?.id ?? row?.subject_id ?? row?.value,
    }));

  const loadFgBomOptions = async (search: any) => {
    const response = await executeFun(() => getBomOptions(search, "default"), "select");
    if (response.success) {
      const options = toSelectOptions(response.data ?? []);
      setFgBomOptions(options);
    } else {
      setFgBomOptions([]);
    }
  };

  const loadSfgBomOptions = async (search: any) => {
    const response = await executeFun(() => getBomOptions(search, "semi"), "select");
    if (response.success) {
      const options = toSelectOptions(response.data ?? []);
      setSfgBomOptions(options);
    } else {
      setSfgBomOptions([]);
    }
  };

  // Load Cost Center options
  const loadCostCenterOptions = async (search) => {
    const response = await executeFun(() => getCostCentresOptions(search), "select");
    if (response.success) {
        const options = convertSelectOptions(response.data);
      setCostCenterOptions(options);
    } else {
      setCostCenterOptions([]);
    }
  };

  const normalizeBomsForPrefill = (projectData: any) => {
    const raw = projectData?.bomSubject ?? projectData?.bom ?? null;
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];

    const parsed = list.map((item: any) => {
      const recipeType = getRecipeType(item);
      return {
        type: recipeType,
        value: item?.subject_id ?? item?.id ?? item?.value ?? null,
        label:
          item?.display_text ??
          item?.subject_name ??
          item?.name ??
          item?.label ??
          item?.text ??
          "",
      };
    }).filter((row: any) => row.value !== null && row.value !== undefined);

    let fg = parsed.find((row: any) => isFgType(row.type));
    let sfg = parsed.find((row: any) => isSfgType(row.type));

    if (!fg && !sfg && parsed.length >= 2) {
      fg = parsed[1];
      sfg = parsed[0];
    } else if (!fg && !sfg && parsed.length === 1) {
      fg = parsed[0];
    } else {
      if (!fg && sfg && parsed.length > 1) {
        fg = parsed.find(
          (row: any) => String(row.value) !== String(sfg.value)
        );
      }
      if (!sfg && fg && parsed.length > 1) {
        sfg = parsed.find(
          (row: any) => String(row.value) !== String(fg.value)
        );
      }
    }

    return { fg, sfg };
  };

  // Populate form when modal opens with selected project data
  useEffect(() => {
    if (data && isModalVisible) {
      const { fg, sfg } = normalizeBomsForPrefill(data);
      form.setFieldsValue({
        project: data.project,
        description: data.description || "",
        qty: data.qty || 1,
        fgBom: fg ? { value: fg.value, label: fg.label } : null,
        sfgBom: sfg ? { value: sfg.value, label: sfg.label } : null,
        costcenter: data.costcenter
          ? {
              value: data.costcenter?.cost_center_key,
              label: data.costcenter?.cost_center_name,
            }
          : null,
      });

    
      if (fg) setFgBomOptions([{ value: fg.value, text: fg.label }]);
      if (sfg) setSfgBomOptions([{ value: sfg.value, text: sfg.label }]);
      if (data.costcenter) {
        setCostCenterOptions([{ value: data.costcenter?.cost_center_key, text: data.costcenter?.cost_center_name }]);
      }
    }
  }, [data, isModalVisible, form]);

  const handleCancel = () => {
    form.resetFields();
    setFgBomOptions([]);
    setSfgBomOptions([]);
    setCostCenterOptions([]);
    setIsModalVisible(false);
  };

  const handleSubmit = () => {
    form
      .validateFields()
      .then((values) => {
        const fgBomId = values?.fgBom?.value ?? values?.fgBom ?? null;
        const sfgBomId = values?.sfgBom?.value ?? values?.sfgBom ?? null;

        if (
          fgBomId &&
          sfgBomId &&
          String(fgBomId) === String(sfgBomId)
        ) {
          message.error("FG and SFG BOM must be different");
          return;
        }

        const updatedData = {
          project: values.project,
          description: values.description?.trim(),
          qty: values.qty ? Number(values.qty) : 0,
          bomSubject: [fgBomId ?? null, sfgBomId ?? null],
          costcenter: values.costcenter?.value ?? null, 
        };

        onUpdate(updatedData); // Send to parent
      })
      .catch((info) => {
        message.error("Please fill in all required fields.");
      });
  };

  return (
    <Modal
      title="Update Project"
      open={isModalVisible}           
      onCancel={handleCancel}
      width={600}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Update Project
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item 
          name="project" 
          label="Project ID" 
          rules={[{ required: true }]}
        >
          <Input disabled />
        </Form.Item>

        <Form.Item
          name="description"
          label="Project Description"
          rules={[{ required: true, message: "Please enter project description" }]}
        >
          <Input.TextArea rows={3} placeholder="Enter project name/description" />
        </Form.Item>

        <Form.Item name="qty" label="Quantity" rules={[{ required: true }]}>
          <Input type="number" min={1} />
        </Form.Item>

        <Form.Item name="fgBom" label="FG BOM">
          <MyAsyncSelect
            placeholder="Search and select FG BOM..."
            loadOptions={loadFgBomOptions}
            optionsState={fgBomOptions}
            onBlur={() => setFgBomOptions([])}
            labelInValue={true}
          />
        </Form.Item>

        <Form.Item name="sfgBom" label="SFG BOM">
          <MyAsyncSelect
            placeholder="Search and select SFG BOM..."
            loadOptions={loadSfgBomOptions}
            optionsState={sfgBomOptions}
            onBlur={() => setSfgBomOptions([])}
            labelInValue={true}
          />
        </Form.Item>

        {/* Cost Center Field - Uses its own options */}
        <Form.Item name="costcenter" label="Cost Center">
          <MyAsyncSelect
            placeholder="Search and select Cost Center..."
            loadOptions={loadCostCenterOptions}
            optionsState={costCenterOptions}       
            onBlur={() => setCostCenterOptions([])}
            labelInValue={true}
     
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateProjectModal;