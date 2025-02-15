import React, { useEffect, useState } from "react";
import { ModalType, SelectOptionType } from "@/types/general";
import { ProductType } from "@/types/r&d";
import { Drawer, Upload } from "antd";
import { Col, Flex, Form, Input, Row } from "antd";
import MyButton from "@/Components/MyButton";
import MyAsyncSelect from "@/Components/MyAsyncSelect.jsx";
import useApi from "@/hooks/useApi";
import { getCostCentresOptions, getProjectOptions } from "@/api/general";
import { convertSelectOptions } from "@/utils/general";
import { getProductdata, updateProduct } from "@/api/r&d/products";
import Loading from "../../../Components/Loading";
import { imsAxios } from "../../../axiosInterceptor";
import { toast } from "react-toastify";
import useLoading from "../../../hooks/useLoading";



interface DrawerProps extends ModalType {
  product: ProductType|null;
  id: string|undefined;
  handleFetchProductList: () => void;
}
const ProductDocuments = (props: DrawerProps) => {
  const [form] = Form.useForm();
  const [asyncOptions, setAsyncOptions] = useState<SelectOptionType[]>([]);
  const { executeFun, loading } = useApi();
  const [loader, setLoader] = useLoading();

  const handleCostCenterOptions = async (search: string) => {
    const response = await executeFun(
      () => getCostCentresOptions(search),
      "select"
    );
    let arr: SelectOptionType[] = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }
    setAsyncOptions(arr);
  };

  const handleProjectOptions = async (search: string) => {
    const response = await executeFun(
      () => getProjectOptions(search),
      "select"
    );

    setAsyncOptions(response.data ?? []);
  };

  const fetchProductData = async () => {
    const response = await executeFun(() => getProductdata(props?.id), "fetch");
    if(response.success){
      const data = response.data.data[0];
      form.setFieldsValue({
        name: data.productname,
        costCenter: { value: data.costcenter.value, label: data.costcenter.text },
        project: { value: data.project.value, label: data.project.text },
        description: data.productdesc,
        unit: data.unit,
        sku: data.productsku,
      })
    }
  };

  const validateHandler = async () => {
    setLoader("submit", true);
    const values = await form.validateFields();
    console.log(values)
    const payload = {
      name: values.name,
      costCenter: values.costCenter?.value?values.costCenter?.value:values.costCenter,
      projectCode: values.project?.value?values.project?.value:values.project,
      description: values.description,
      unit: values.unit,
      isActive: true,
    };

    const data  = await imsAxios.put(`/products/update/temp/${props?.id}`, {
      ...payload,
    });
    if(data.success){
      toast.success(data?.message||"Product Updated Successfully");
      props.hide();
      form.resetFields();
      props.handleFetchProductList();
    }
    else{
      toast.error(data?.message);
    }
    // form.resetFields();
    setLoader("submit", false);
  }

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  
  useEffect(() => {
    props?.id && fetchProductData();
  }, [props?.id]);

  return (
    <Drawer
      width={650}
      open={props.show}
      onClose={() =>{props.hide(); form.setFieldValue("documents",[]); form.setFieldValue("images",[]);}}
      title={`Update ${props.product?.name}`}
    >
      <Col span={20} style={{ height: "100%", overflow: "auto" }}>
      {loading("fetch") &&<Loading/>}
        {/* <Card size="small" title={"Add New Product"}> */}
          <Form initialValues={initialValues} form={form} layout="vertical" onFinish={validateHandler}>
            <Row gutter={[0, 6]}>
              <Col span={24}>
                <Form.Item
                  name="name"
                  label="Product Name"
                  rules={rules.product}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item label="Product SKU" name="sku">
                  <Input disabled />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  style={{ flex: 1, minWidth: 100 }}
                  name="costCenter"
                  label="Cost Center"
                >
                  <MyAsyncSelect
                    optionsState={asyncOptions}
                    loadOptions={handleCostCenterOptions}
                    selectLoading={loading("select")}
                    onBlur={() => setAsyncOptions([])}
                    fetchDefault={true}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  style={{ flex: 1, minWidth: 100 }}
                  name="project"
                  label="Project"
                >
                  <MyAsyncSelect
                    optionsState={asyncOptions}
                    loadOptions={handleProjectOptions}
                    selectLoading={loading("select")}
                    onBlur={() => setAsyncOptions([])}
                    fetchDefault={true}
                  />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="description" label="Remarks">
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
      
              
              <Col span={24}>
                <Form.Item
                  name="images"
                  label="Images"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  extra="Max 4 Images"
                >
                  <Upload
                    name="image"
                    beforeUpload={() => false}
                    style={{ marginBottom: 10 }}
                    maxCount={4}
                  >
                    <MyButton
                      variant="upload"
                      text="Select"
                      style={{ width: "100%", marginBottom: 5 }}
                    />
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="documents"
                  label="Documents"
                  valuePropName="fileList"
                  getValueFromEvent={normFile}
                  extra="Max 4 Documents"
                >
                  <Upload
                    name="document"
                    beforeUpload={() => false}
                    style={{ marginBottom: 10 }}
                    maxCount={4}
                  >
                    <MyButton
                      variant="upload"
                      text="Select"
                      style={{ width: "100%", marginBottom: 5 }}
                    />
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Flex justify="center" gap={5}>
                  <Form.Item>
                    <MyButton onClick={()=>form.resetFields()} variant="reset">
                      Reset
                    </MyButton>
                  </Form.Item>
                  <Form.Item>
                    <MyButton
                      loading={loader("submit")|| loading("fetch")}
                      type="primary"
                      variant="submit"
                        onClick={validateHandler}
                    />
                  </Form.Item>
                </Flex>
              </Col>
            </Row>
          </Form>
        {/* </Card> */}
      </Col>
    </Drawer>
  );
};

export default ProductDocuments;

const initialValues = {
  product: undefined,
  sku: undefined,
  uom: undefined,
};

const rules = {
  sku: [
    {
      required: true,
      message: "SKU is required",
    },
  ],
  uom: [
    {
      required: true,
      message: "UOM is required",
    },
  ],
  product: [
    {
      required: true,
      message: "Product name is required",
    },
  ],
};
