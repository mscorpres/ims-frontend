import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Tabs,
  Typography,
  Upload,
} from "antd";
import MyButton from "@/Components/MyButton";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import MySelect from "@/Components/MySelect.jsx";
import { UploadOutlined } from "@ant-design/icons";
import { SelectOptionType } from "@/types/general";
import useApi from "@/hooks/useApi";
import { getVendorOptions } from "@/api/general";
import { convertSelectOptions } from "@/utils/general";

const typeOptions: SelectOptionType[] = [
  {
    text: "Main",
    value: "main",
  },
  {
    text: "Alternate",
    value: "substitute",
  },
];

interface ComponentType {
  component: {
    label: string;
    value: string;
  };
  text: string;
  value: string;
  qty: string;
  remarks: string;
  type: "main" | "substitute";
  substituteOf: {
    label: string;
    value: string;
  };
}

interface Props {
  handleDownloadComponentSampleFile: () => void;
  selectedFile: File | null | undefined;
  handleFetchComponentsFromFile: () => void;
  setSelectedFile: React.Dispatch<
    React.SetStateAction<File | null | undefined>
  >;
  loading: (name: string) => void;
  handleFetchComponentOptions: (search: string) => Promise<void>;
  asyncOptions: SelectOptionType[];
  setAsyncOptions: React.Dispatch<React.SetStateAction<SelectOptionType[]>>;
  rules: any;
  form: any;
  mainComponents: ComponentType[];
  subComponents: ComponentType[];
  isEditing: string | number | boolean;
  handleCancelEditing: () => void;
  handleAddComponents: () => Promise<void>;
  handleUpdateCompnent: () => Promise<void>;
  isBomUpdating: boolean;
  validateHandler: () => Promise<void>;
  submitHandler: (action: "final" | "draft") => Promise<void>;
}

const AddComponent = ({
  handleDownloadComponentSampleFile,
  selectedFile,
  handleFetchComponentsFromFile,
  setSelectedFile,
  loading,
  handleFetchComponentOptions,
  asyncOptions,
  setAsyncOptions,
  rules,
  form,
  mainComponents,
  subComponents,
  isEditing,
  handleCancelEditing,
  handleAddComponents,
  handleUpdateCompnent,
  isBomUpdating,
  validateHandler,
  submitHandler,
}: Props) => {
  const { executeFun, loading: loading1 } = useApi();
  const type = Form.useWatch("type", form);

  const handleFetchVendorOptions = async (search: string) => {
    const response = await executeFun(() => getVendorOptions(search), "select");

    let arr: SelectOptionType[] = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }

    setAsyncOptions(arr);
  };

  const props = {
    maxCount: 1,
    fileList: selectedFile ? [selectedFile] : [],
    beforeUpload: () => false,
    onChange: (info) =>
      info.file ? setSelectedFile(info.file) : setSelectedFile(null),
  };
  // useEffect(() => {
  //   if (!showUpdateTypeModal && !isBomUpdating) {
  //     resetHandler();
  // }dateTypeModal && !isBomUpdating) {
  //     resetHandler();
  //
  // }, [mainComponents, subComponents]);
  return (
    <Card size="small" title="Add Components">
      <Flex vertical align="center" gap={10}>
        <MyButton
          loading={loading("sample")}
          variant="downloadSample"
          onClick={handleDownloadComponentSampleFile}
        />
        <Upload {...props}>
          <Button block icon={<UploadOutlined />}>
            Select File
          </Button>
        </Upload>
        {selectedFile && (
          <MyButton
            onClick={handleFetchComponentsFromFile}
            loading={loading("upload")}
            block
            variant="upload"
          />
        )}
      </Flex>
      <Divider>OR</Divider>
      <Form.Item name="component" label="Component" rules={rules.component}>
        <MyAsyncSelect
          loadOptions={handleFetchComponentOptions}
          optionsState={asyncOptions}
          onBlur={() => setAsyncOptions([])}
          labelInValue={true}
          selectLoading={loading("select")}
        />
      </Form.Item>
      <Flex wrap="wrap" gap={5}>
        <Form.Item
          style={{ flex: 1, minWidth: 100 }}
          name="qty"
          label="Qty"
          rules={rules.qty}
        >
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          style={{ flex: 1, minWidth: 100 }}
          name="type"
          label="Type"
          rules={rules.type}
        >
          <MySelect options={typeOptions} />
        </Form.Item>
      </Flex>
      {type === "substitute" && (
        <Form.Item name="substituteOf" label="Alternate Of">
          <MySelect options={mainComponents} labelInValue={true} />
        </Form.Item>
      )}
      <Form.Item
        style={{ flex: 1, minWidth: 100 }}
        name="vendor"
        label={
          <Flex align="center" style={{ width: 500 }} justify="space-between">
            <p>Vendor</p>
            {/* <Button onClick={toggleVendorType} size="small" type="link">
            {!vendorType ? "Type" : "Select"} Vendor
          </Button> */}
          </Flex>
        }
      >
        <MyAsyncSelect
          labelInValue={true}
          optionsState={asyncOptions}
          loadOptions={handleFetchVendorOptions}
          selectLoading={loading1("select")}
          onBlur={() => setAsyncOptions([])}
        />
      </Form.Item>
      <Form.Item
        style={{ flex: 1, minWidth: 100 }}
        name="locations"
        label="PCB Locations"
        rules={rules.locations}
      >
        <Input />
      </Form.Item>

      <Form.Item name="remarks" label="Remarks">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Flex justify="center" gap={5}>
        {isEditing !== false ? (
          <MyButton
            onClick={handleCancelEditing}
            variant="clear"
            type="default"
            text="Cancel"
          />
        ) : (
          <MyButton variant="reset" />
        )}

        <MyButton
          variant="add"
          // disabled={form.getFieldValue("version")?.length > 0 ? false : true}
          text={isEditing !== false ? "Update" : "Add"}
          onClick={ 
            isEditing !== false ? handleUpdateCompnent : handleAddComponents
          }
        />
      </Flex>
      <Divider />
      <Flex align="center" vertical gap={10}>
        <Typography.Text
          strong
          type="secondary"
          style={{ textAlign: "center", fontSize: 13 }}
        >
          After adding the components and header details, click on Create BOM
        </Typography.Text>
        <MyButton
          variant="submit"
          text={isBomUpdating ? "Update BOM" : "Create BOM"}
          loading={loading("final")}
          onClick={() => validateHandler("final")}
          disabled={mainComponents.length === 0}
        />
        {/* <MyButton
          variant="save"
          loading={loading("draft")}
          onClick={() => validateHandler("draft")} BOM Release Refrence No.(RRN)
          disabled={mainComponents.length === 0}
        /> */}
      </Flex>
    </Card>
  );
};

export default AddComponent;
