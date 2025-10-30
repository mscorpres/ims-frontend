import { useEffect, useState } from "react";
import { Col, Form, Input, Row } from "antd";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import { getComponentOptions, getHsnOptions } from "@/api/general";
import useApi from "@/hooks/useApi";
import { convertSelectOptions } from "@/utils/general";
import FormTable2 from "@/Components/FormTable2.jsx";
import { getHsnList, mapHsn } from "@/api/master/component";
import CustomFieldBox from "../../../new/components/reuseable/CustomFieldBox.jsx";
import CustomButton from "../../../new/components/reuseable/CustomButton.jsx";
import { renderIcon } from "@/new/components/layout/Sidebar/iconMapper";

const HsnMap = () => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();

  const component = Form.useWatch("component", form);

  const getComponents = async (search: string) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );

    setAsyncOptions(convertSelectOptions(response.data ?? []));
  };

  const handleFetchHsnOptions = async (search: string) => {
    const response = await executeFun(() => getHsnOptions(search), "select");

    setAsyncOptions(response.data ?? []);
  };

  const submitHandler = async () => {
    const values = await form.validateFields();
    const response = await executeFun(
      () => mapHsn(values.component, values.rows),
      "submit"
    );

    if (response.success) {
      form.resetFields();
    }
  };

  const handleFetchComponentHsn = async (key: string) => {
    const response = await executeFun(() => getHsnList(key), "fetch");
    form.setFieldValue("rows", response.data ?? []);
  };

  useEffect(() => {
    if (component) {
      handleFetchComponentHsn(component);
    }
  }, [component]);
  return (
    <Form
      layout="vertical"
      initialValues={initialValues}
      form={form}
      style={{ height: "95%" }}
    >
      <Row justify="center" gutter={16} style={{ padding: 10, height: "100%" }}>
        <Col sm={8} xxl={4}>
          <CustomFieldBox title="Component">
            <Form.Item
              name="component"
              label="Component Name"
              rules={[{ required: true, message: "Component is required" }]}
            >
              <MyAsyncSelect
                onBlur={() => setAsyncOptions([])}
                loadOptions={getComponents}
                optionsState={asyncOptions}
                selectLoading={loading("select")}
              />
            </Form.Item>

            <Row justify="center">
              <CustomButton
                onclick={submitHandler}
                loading={loading("submit")}
                variant="submit"
                title="Save"
                endicon={renderIcon("CheckCircleIcon")}
              />
            </Row>
          </CustomFieldBox>
        </Col>
        <Col
          sm={12}
          xxl={8}
          className="remove-table-footer remove-cell-border"
          style={{ height: "92%" }}
        >
          <FormTable2
            form={form}
            listName="rows"
            columns={columns(
              setAsyncOptions,
              asyncOptions,
              handleFetchHsnOptions,
              loading
            )}
            addableRow={true}
            newRow={initialValues.rows[0]}
            removableRows={true}
            nonRemovableColumns={1}
          />
        </Col>
      </Row>
    </Form>
  );
};

export default HsnMap;

const initialValues = {
  component: undefined,
  rows: [{ code: undefined, tax: undefined }],
};

const columns = (
  setAsyncOptions,
  asyncOptions,
  handleFetchHsnOptions,
  loading
) => [
  {
    headerName: "HSN Code",
    flex: 1,
    name: "code",
    field: () => (
      <MyAsyncSelect
        onBlur={() => setAsyncOptions([])}
        loadOptions={handleFetchHsnOptions}
        optionsState={asyncOptions}
        selectLoading={loading("select")}
      />
    ),
    rules: [
      {
        required: true,
        message: `HSN Code is required.`,
      },
    ],
  },
  {
    headerName: "Tax Percentage",
    width: 100,
    name: "tax",
    rules: [
      {
        required: true,
        message: `Tax Rate is required.`,
      },
    ],
    field: () => <Input suffix="%" />,
  },
];
