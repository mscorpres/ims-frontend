import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Card, Col, Form, InputNumber, Row, Space } from "antd";
import { imsAxios } from "../../axiosInterceptor";
import MyButton from "../../Components/MyButton";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MyDataTable from "../../Components/MyDataTable";
import { getProductsOptions } from "../../api/general";
import { v4 } from "uuid";

const AddSKUOpeningRate = () => {
  const [form] = Form.useForm();
  const [submitLoading, setSubmitLoading] = useState(false);
  const [productOptions, setProductOptions] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const getProductOptions = async (search) => {
    setProductLoading(true);
    const response = await getProductsOptions(search);
    setProductLoading(false);
    if (response.success && response.data) {
      setProductOptions(response.data);
    } else {
      setProductOptions([]);
    }
  };

  const fetchSKUOpeningRates = async () => {
    setTableLoading(true);
    try {
      const response = await imsAxios.get("/backend/fetch-skuOpening-rate");
      setTableLoading(false);
      if (response?.success && response?.data) {
        let arr = response.data.map((row, index) => ({
          ...row,
          id: row.product_key || v4(),
          serialNo: index + 1,
          closing_qty: parseFloat(row.closing_qty) || 0,
          average_rate: parseFloat(row.average_rate) || 0,
          total_value: parseFloat(row.total_value) || 0,
        }));
        setTableData(arr);
      } else {
        setTableData([]);
      }
    } catch (error) {
      setTableLoading(false);
      console.error("Error fetching SKU opening rates:", error);
      setTableData([]);
    }
  };

  const handleSubmit = async (values) => {
    if (!values.product) {
      toast.error("Please select a product");
      return;
    }
    if (!values.closing_qty && !values.average_rate && !values.total_value) {
      toast.error("Please fill at least one rate field");
      return;
    }

    setSubmitLoading(true);
    try {
      const response = await imsAxios.post("/backend/add-skuOpening-detail", {
        product: values.product,
        closing_qty: values.closing_qty || 0,
        average_rate: values.average_rate || 0,
        total_value: values.total_value || 0,
      });
      setSubmitLoading(false);
      if (response?.success) {
        toast.success("SKU Opening Rate added successfully");
        form.resetFields();
        setProductOptions([]);
        fetchSKUOpeningRates(); // Refresh table after successful submission
      } else {
        toast.error(response?.message || "Failed to add SKU Opening Rate");
      }
    } catch (error) {
      setSubmitLoading(false);
      toast.error(error?.response?.data?.message || "An error occurred");
    }
  };

  const handleReset = () => {
    form.resetFields();
    setProductOptions([]);
  };

  useEffect(() => {
    fetchSKUOpeningRates();
  }, []);

  const columns = [
    { field: "serialNo", headerName: "Serial No", width: 100 },
    { field: "productName", headerName: "Product Name", flex: 1 },
    { field: "product_key", headerName: "Product Key", width: 180 },
     { field: "p_sku", headerName: "SKU", width: 180 },
    
    {
      field: "closing_qty",
      headerName: "Closing Qty",
      width: 130,
      type: "number",
    },
    {
      field: "average_rate",
      headerName: "Average Rate",
      width: 130,
      type: "number",
    },
    {
      field: "total_value",
      headerName: "Total Value",
      width: 150,
      type: "number",
    },
      { field: "date", headerName: "Date", width: 180 },
  ];

  return (
    <div style={{ height: "100%" }}>
      <Row gutter={8} style={{ padding: "0 10px", height: "100%" }}>
        <Col span={8}>
          <Card title="Add SKU Opening Rate" size="small">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              <Form.Item
                label="Product"
                name="product"
                rules={[
                  { required: true, message: "Please select a product" },
                ]}
              >
                <MyAsyncSelect
                  placeholder="Search and select product..."
                  loadOptions={getProductOptions}
                  optionsState={productOptions}
                  onBlur={() => setProductOptions([])}
                  selectLoading={productLoading}
                />
              </Form.Item>

              <Form.Item
                label="Closing Qty"
                name="closing_qty"
                rules={[
                  {
                    type: "number",
                    min: 0,
                    message: "Closing qty must be a positive number",
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter closing qty"
                  style={{ width: "100%" }}
                    min={0}
                    step={1}
                />
              </Form.Item>

              <Form.Item
                label="Weighted Average Rate"
                name="average_rate"
                rules={[
                  {
                    type: "number",
                    min: 0,
                    message: "Weighted Average Rate must be a positive number",
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter weighted average rate"
                  style={{ width: "100%" }}
                  min={0}
                />
              </Form.Item>

              <Form.Item
                label="Total Value"
                name="total_value"
                rules={[
                  {
                    type: "number",
                    min: 0,
                    message: "Total value must be a positive number",
                  },
                ]}
              >
                <InputNumber
                  placeholder="Enter total value"
                  style={{ width: "100%" }}
                  min={0}
                  step={0.01}
                  precision={2}
                />
              </Form.Item>

              <Row justify="end">
                <Col>
                  <Space>
                    <MyButton onClick={handleReset} variant="reset">
                      Reset
                    </MyButton>
                    <MyButton
                      loading={submitLoading}
                      type="primary"
                      htmlType="submit"
                      variant="add"
                    >
                      Submit
                    </MyButton>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col style={{ height: "85%" }} span={16}>
          <MyDataTable
            loading={tableLoading}
            data={tableData}
            columns={columns}
          />
        </Col>
      </Row>
    </div>
  );
};

export default AddSKUOpeningRate;
