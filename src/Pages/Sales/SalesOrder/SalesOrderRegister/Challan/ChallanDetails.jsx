import React, { useEffect, useState } from "react";
import {
  Drawer,
  Row,
  Col,
  Flex,
  Typography,
  Card,
  Button,
  Form,
  Modal,
  Divider,
} from "antd";
import MyDataTable from "../../../../gstreco/myDataTable";
import ToolTipEllipses from "../../../../../Components/ToolTipEllipses";
import useApi from "../../../../../hooks/useApi.ts";
import { getChallanDetails } from "../../../../../api/sales/salesOrder";
import ClientInfo from "../CreateShipment/ClientInfo";
import Loading from "../../../../../Components/Loading";
import MyAsyncSelect from "../../../../../Components/MyAsyncSelect.jsx";
import { getCourierOptions } from "../../../../../api/finance/clients.js";
import { convertSelectOptions } from "../../../../../utils/general.ts";
import { imsAxios } from "../../../../../axiosInterceptor.tsx";
import { toast } from "react-toastify";

const ChallanDetails = ({ open, hide }) => {
  const [rows, setRows] = useState([]);
  const [totalValues, setTotalValues] = useState([]);
  const [details, setDetails] = useState({});
  const [createAllocation, setCreateAllocation] = useState(false);
  const [ModalForm] = Form.useForm();

  const [asyncOptions, setAsyncOptions] = useState([]);
  const { executeFun, loading } = useApi();
  const allocatingChallan = async (row) => {
    // console.log("row", row);
    const values = await ModalForm.validateFields();
    // console.log("values", values);
    const response = await imsAxios.post(
      "/so_challan_shipment/allocateCourier",
      {
        invoice_no: open,
        courier_name: values.courier,
      }
    );
    if (response.success) {
      setCreateAllocation(false);
      toast.success(response.message);
      reset();
    } else {
      // setCreateAllocation(false);
      toast.error(response.message);
    }
  };
  const reset = () => {
    ModalForm.resetFields();
    filterForm.resetFields();
    setCreateAllocation(false);
  };
  const handleFetchChallanDetails = async (challanId) => {
    const response = await executeFun(
      () => getChallanDetails(challanId),
      "fetch"
    );

    setRows(response.data.components);
    // console.log("response.data.components", response.data.components);
    setDetails(response.data.details);
  };

  //
  const clientDetails = {
    address: details?.clientAddress,
    client: details?.client,
  };

  const billingDetails = {
    address: details?.billingAddress,
  };
  const shippingDetails = {
    address: details?.shippingAddress,
  };
  const handleCourierOptions = async (search) => {
    const response = await executeFun(
      () => getCourierOptions(search),
      "select"
    );
    let arr;
    if (response.success == true) {
      // console.log("response.data", response.data);
      // let arr = response.data.map((r) => {
      //   return { id: r.value, text: r.text };
      // });
      arr = convertSelectOptions(response.data, "text", "value");
      // console.log("arr---", arr);
    }
    setAsyncOptions(arr);
  };
  useEffect(() => {
    if (open) {
      handleFetchChallanDetails(open);
    }
  }, [open]);
  useEffect(() => {
    if (!createAllocation) {
      ModalForm.resetFields();
    }
  }, [createAllocation]);
  useEffect(() => {
    let obj = [
      {
        label: "Sub-Total value before Taxes",
        sign: "",
        values: rows?.map((row) => Number(row.inrValue)),
      },
      {
        label: "CGST",
        sign: "+",
        values: rows?.map((row) => Number(row.cgst)),
      },
      {
        label: "SGST",
        sign: "+",
        values: rows?.map((row) => Number(row.sgst)),
      },
      {
        label: "IGST",
        sign: "+",
        values: rows?.map((row) => Number(row.igst)),
      },
      {
        label: "Sub-Total values after Taxes",
        sign: "",
        values: rows?.map(
          (row) =>
            Number(row.inrValue) +
            Number(row.sgst) +
            Number(row.cgst) +
            Number(row.igst)
        ),
      },
    ];
    setTotalValues(obj);
  }, [rows]);
  return (
    <Drawer
      title={`Challan Details : ${open ?? ""}`}
      open={open}
      onClose={hide}
      width="90%"
    >
      <Row style={{ height: "100%" }} gutter={6}>
        <Col span={6}>
          <Flex vertical={true} gap={6}>
            {loading("fetch") && <Loading />}
            <ClientInfo details={clientDetails} />
            <Info details={billingDetails} title="Billing Info" />
            <Info details={shippingDetails} title="Shipping Info" />
            {/* tax detail card */}
            <Col span={24} style={{ height: "50%" }}>
              <Card
                style={{ height: "100%" }}
                // bodyStyle={{ height: "90%" }}
                title="Tax Detail"
              >
                <Row gutter={[0, 4]}>
                  {totalValues?.map((row) => (
                    <Col span={24} key={row.label}>
                      <Row>
                        <Col
                          span={18}
                          style={{
                            fontSize: "0.8rem",
                            fontWeight:
                              totalValues?.indexOf(row) ==
                                totalValues.length - 1 && 600,
                          }}
                        >
                          {row.label}
                        </Col>
                        <Col span={6} className="right">
                          {row.sign.toString() == "" ? (
                            ""
                          ) : (
                            <span
                              style={{
                                fontSize: "0.7rem",
                                fontWeight:
                                  totalValues?.indexOf(row) ==
                                    totalValues.length - 1 && 600,
                              }}
                            >
                              ({row.sign.toString()}){" "}
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: "0.8rem",
                              fontWeight:
                                totalValues?.indexOf(row) ==
                                  totalValues.length - 1 && 600,
                            }}
                          >
                            {Number(
                              row.values?.reduce((partialSum, a) => {
                                return partialSum + Number(a);
                              }, 0)
                            ).toFixed(2)}
                          </span>
                        </Col>
                      </Row>
                    </Col>
                  ))}
                </Row>
              </Card>
            </Col>
          </Flex>
        </Col>
        <Col span={18} tyle={{ height: "90%", overflowY: "scroll" }}>
          <Col span={24}>
            <Row justify="end" style={{ marginBottom: "4px" }} gutter={[6, 6]}>
              <Button
                onClick={() => {
                  setCreateAllocation(true);
                }}
              >
                Allocate
              </Button>
              <Button style={{ marginLeft: "8px" }}>
                <a
                  href="https://dev.mscorpres.net/files/so_invoice.pdf"
                  // target="_blank"
                >
                  Generate E-Invoice
                </a>
              </Button>
            </Row>
          </Col>
          <MyDataTable
            loading={loading("fetch")}
            columns={columns}
            data={rows}
          />
        </Col>
      </Row>
      {createAllocation && (
        <Modal
          open={createAllocation}
          onOk={() => allocatingChallan(createAllocation)}
          onCancel={() => setCreateAllocation(false)}
          title="Allocate this Challan"
        >
          <Form form={ModalForm} layout="vertical">
            <Divider />
            <Form.Item
              name="courier"
              label="Select Courier"
              rules={[
                {
                  required: true,
                  message: "This field is required",
                },
              ]}
            >
              <MyAsyncSelect
                optionsState={asyncOptions}
                loadOptions={handleCourierOptions}
                onBlur={() => setAsyncOptions([])}
                selectLoading={loading("select")}
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </Drawer>
  );
};

export default ChallanDetails;

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "SO Id",
    field: "orderId",
    width: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.orderId} copy={true} />,
  },
  {
    headerName: "Shipment Id",
    field: "shipmentId",
    width: 150,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.shipmentId} copy={true} />
    ),
  },
  {
    headerName: "Part Code",
    field: "partCode",
    width: 120,
    renderCell: ({ row }) => (
      <ToolTipEllipses text={row.partCode} copy={true} />
    ),
  },
  {
    headerName: "Component",
    field: "component",
    minWidth: 200,
    flex: 2,
    renderCell: ({ row }) => <ToolTipEllipses text={row.component} />,
  },
  {
    headerName: "Qty",
    width: 120,
    field: "qty",
  },
  {
    headerName: "Rate",
    width: 120,
    field: "rate",
  },
];

const Info = ({ details, title }) => {
  return (
    <Card size="small" title={title}>
      <Col span={24}>
        <Row>
          <Col span={24}>
            <Typography.Text strong>Address</Typography.Text>
          </Col>
          <Col span={24}>
            <Typography.Text>{details.address}</Typography.Text>
          </Col>
        </Row>
      </Col>
    </Card>
  );
};
