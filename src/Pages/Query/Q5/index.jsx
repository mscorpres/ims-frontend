import { useState } from "react";
import { imsAxios } from "../../../axiosInterceptor";
import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Form,
  Row,
  Space,
  Typography,
} from "antd";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import Loading from "../../../Components/Loading";
import DownloadButton from "./DownloadButton";
import LocationCard from "./LocationCard";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { GridExpandMoreIcon } from "@mui/x-data-grid";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import NoData from "../../../NoData";
import useApi from "../../../hooks/useApi.ts";
import { getComponentOptions } from "../../../api/general.ts";
import { convertSelectOptions } from "../../../utils/general.ts";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { getQ5 } from "../../../api/reports/query";
import MyButton from "../../../Components/MyButton";

const initHeader = {
  uniqueId: "--",
  lastEntryBy: "--",
  lastEntryDate: "--",
  remark: "--",
};

const QueryQ5 = () => {
  const [stockDetails, setStockDetails] = useState({
    componentName: "",
    stock: [],
    total: 0,
    unit: "",
    partCode: "",
  });
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [headerData, setHeaderData] = useState(initHeader);
  const [rmData, setRmData] = useState([]);
  const [sfData, setSfData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [compCode, setCompCode] = useState("");
  const { executeFun, loading } = useApi();
  const [form] = Form.useForm();

  const handleFetchComponentOptions = async (search) => {
    const response = await executeFun(
      () => getComponentOptions(search),
      "select"
    );
    let arr = [];
    console.log("apu response in q5", response);
    if (response.success) {
      const { data } = response;
      arr = convertSelectOptions(data);
      setAsyncOptions(arr);
    }
  };

  const getStockDetails = async (element) => {
    try {
      setHeaderData(initHeader);
      const values = await form.validateFields();
      const payload = {
        component: values.component.value,
        for_location: element,
        date: values.date,
      };
      const { data, success } = await executeFun(() => getQ5(payload), "fetch");
      if (success && data) {
        setHeaderData({
          uniqueId: data.component.unique_id,
          lastEntryBy: data.last_audit_by,
          lastEntryDate: data.last_audit_date,
          remark: data.last_audit_remark,
          componentName: data.component.name,
          partCode: data.component.part_code,
          unit: data.component.unit,
          weightedPurchaseRate: data.weightedPurchaseRate,
        });
        const obj = {
          component: data.component.name,
          partCode: data.component.part_code,
          stock: data.stock.sort((a, b) =>
            a.loc_name.localeCompare(b.loc_name)
          ),
          unit: data.component.unit,
          openingTotal1: data.total_opening,
          openingTotal: data.total_closing,
        };
        switch (element) {
          case "Vendor":
            setVendorData(obj);
            break;

          case "SF":
            setSfData(obj);
            break;

          case "RM":
            setRmData(obj);
            break;
        }
      }
    } catch (error) {
      console.log("There was some error while fetching stock details", error);
    }
  };

  return (
    <Row gutter={6} style={{ padding: 10, height: "95%" }}>
      <Col
        span={4}
        style={{ overflowY: "auto", overflowX: "hidden", height: "100%" }}
      >
        <Flex gap={10} vertical style={{ height: "100%" }}>
          <div style={{ width: "100%" }}>
            <Card size="small">
              <Form layout="vertical" form={form}>
                <Form.Item
                  label="Compnent"
                  name="component"
                  rules={[
                    { required: true, message: "Please select a component" },
                  ]}
                >
                  <MyAsyncSelect
                    selectLoading={loading("select")}
                    labelInValue
                    optionsState={asyncOptions}
                    loadOptions={handleFetchComponentOptions}
                    onBlur={() => setAsyncOptions([])}
                  />
                </Form.Item>
                <Form.Item
                  label="Date"
                  name="date"
                  rules={[{ required: true, message: "Please select a Date" }]}
                >
                  <SingleDatePicker
                    setDate={(value) => form.setFieldValue("date", value)}
                  />
                </Form.Item>
                <Row justify="end">
                  <Space>
                    <DownloadButton
                      total={stockDetails?.total}
                      componentLabel={`${stockDetails.partCode} - ${stockDetails?.component}`}
                      rows={stockDetails?.stock}
                    />
                    <MyButton
                      variant="search"
                      onClick={async () => {
                        await getStockDetails("VENDOR");
                        await getStockDetails("RM");
                        getStockDetails("SF");
                      }}
                      type="primary"
                      loading={loading("fetch")}
                    >
                      Submit
                    </MyButton>
                  </Space>
                </Row>
              </Form>
            </Card>
          </div>
          <div style={{ flex: 1 }}>
            <Card size="small">
              <Row>
                <Col span={24}>
                  <Typography.Text strong type="secondary">
                    Component:
                  </Typography.Text>
                  <br />
                  <Typography.Text>{headerData?.component}</Typography.Text>
                </Col>
                <Divider />
                <Col span={24}>
                  <Typography.Text strong type="secondary">
                    Part Code
                  </Typography.Text>
                  <br />
                  <Typography.Text>{headerData?.partCode}</Typography.Text>
                </Col>
                <Divider />
                <Col span={24}>
                  <Typography.Text strong type="secondary">
                    Unit
                  </Typography.Text>
                  <br />
                  <Typography.Text>{headerData?.unit}</Typography.Text>
                </Col>
                <Divider />
                <Col span={24}>
                  <Typography.Text strong type="secondary">
                    Weighted Average Rate
                  </Typography.Text>
                  <br />
                  <Typography.Text>
                    {headerData?.weightedPurchaseRate}
                  </Typography.Text>
                </Col>
                <Divider />
                <Col span={24}>
                  <Typography.Text strong type="secondary">
                    Unique Id:
                  </Typography.Text>
                  <br />
                  <Typography.Text>{headerData?.uniqueId}</Typography.Text>
                </Col>
                <Divider />
                <Col span={24}>
                  <Typography.Text strong type="secondary">
                    Last Entry By:
                  </Typography.Text>
                  <br />
                  <Typography.Text>{headerData?.lastEntryBy}</Typography.Text>
                </Col>
                <Divider />
                <Col span={24}>
                  <Typography.Text strong type="secondary">
                    Physical on:
                  </Typography.Text>
                  <br />
                  <Typography.Text>{headerData?.lastEntryDate}</Typography.Text>
                </Col>
                <Divider />
                <Col span={24}>
                  <Typography.Text strong type="secondary">
                    Physical Note:
                  </Typography.Text>
                  <br />
                  <Typography.Text>{headerData?.remark}</Typography.Text>
                </Col>
              </Row>
            </Card>
          </div>
        </Flex>
      </Col>
      <Col
        span={20}
        style={{ overflowY: "auto", overflowX: "hidden", height: "100%" }}
      >
        <Row
          justify="center"
          style={{
            height: "100%",
            overflow: "hidden",
            paddingBottom: 10,
          }}
          gutter={6}
        >
          <Col span={24}>
            <Row justify="center">
              {stockDetails?.component && (
                <Typography.Title level={5}>
                  {stockDetails.partCode} -{stockDetails?.component} -
                  {stockDetails?.total} {stockDetails?.unit}
                </Typography.Title>
              )}
            </Row>
          </Col>
          <Col
            span={24}
            style={{
              height: "100%",
              overflowY: "auto",
              overflowX: "hidden",
              paddingBottom: 30,
            }}
          >
            {loading("fetch") && <Loading />}

            <Row gutter={[6, 6]}>
              <Col span={24}>
                <Card>
                  <Col span={24}>
                    <Accordion defaultExpanded>
                      <AccordionSummary
                        expandIcon={<GridExpandMoreIcon />}
                        aria-controls="panel2bh-content"
                        id="panel2bh-header"
                      >
                        <Row>
                          <Space>
                            <Typography sx={{ width: "33%", flexShrink: 0 }}>
                              RM Locations
                            </Typography>
                          </Space>
                        </Row>
                      </AccordionSummary>
                      <Row justify="end">
                        <Col span={24} style={{ paddingLeft: 15 }}>
                          <Row justify="space-between">
                            <Space>
                              {/* <Typography
                                sx={{
                                  width: "33%",
                                  flexShrink: 0,
                                  marginRight: "4px",
                                }}
                              >
                                Opening Total - {rmData.openingTotal}
                              </Typography> */}
                              <Typography
                                sx={{
                                  width: "33%",
                                  flexShrink: 0,
                                  marginRight: "4px",
                                }}
                              >
                                Total - {rmData.openingTotal} {headerData?.unit}
                              </Typography>
                            </Space>
                            <Button
                              style={{ marginRight: "1em" }}
                              onClick={() => getStockDetails("RM")}
                            >
                              <AutorenewIcon />
                            </Button>
                          </Row>
                        </Col>
                      </Row>
                      <AccordionDetails>
                        <Row gutter={[6, 6]}>
                          {rmData?.stock?.map((row) => (
                            <LocationCard
                              locationAddress={row.loc_address}
                              location={row.loc_name}
                              value={row.closing}
                              opening={row.opening}
                              unit={rmData?.unit}
                              owner={row.loc_owner}
                            />
                          ))}
                        </Row>
                      </AccordionDetails>
                    </Accordion>
                    <Accordion
                      defaultExpanded
                      // expanded={expanded === "panel2"}
                    >
                      <AccordionSummary
                        expandIcon={<GridExpandMoreIcon />}
                        aria-controls="panel2bh-content"
                        id="panel2bh-header"
                      >
                        <Row>
                          <Space>
                            <Typography sx={{ width: "33%", flexShrink: 0 }}>
                              Shop Floor
                            </Typography>
                          </Space>
                        </Row>
                      </AccordionSummary>
                      <Row justify="end">
                        <Col span={24} style={{ paddingLeft: 15 }}>
                          <Row justify="space-between">
                            <Space>
                              <Typography
                                sx={{
                                  width: "33%",
                                  flexShrink: 0,
                                  marginRight: "4px",
                                }}
                              >
                                Total - {sfData.openingTotal} {headerData?.unit}
                              </Typography>
                            </Space>
                            <Button
                              style={{ marginRight: "1em" }}
                              onClick={() => getStockDetails("SF")}
                            >
                              <AutorenewIcon />
                            </Button>
                          </Row>
                        </Col>
                      </Row>

                      {/* <Col span={24}> */}
                      <AccordionDetails style={{}}>
                        <Row gutter={[6, 6]}>
                          {sfData?.stock?.map((row) => (
                            // <Col span={4}>
                            <LocationCard
                              locationAddress={row.loc_address}
                              location={row.loc_name}
                              value={row.closing}
                              opening={row.opening}
                              unit={sfData?.unit}
                              owner={row.loc_owner}
                            />
                            // </Col>
                          ))}
                        </Row>
                      </AccordionDetails>
                      {/* </Col> */}
                    </Accordion>
                    <Accordion
                      defaultExpanded
                      // expanded={expanded === "panel2"}
                    >
                      <AccordionSummary
                        expandIcon={<GridExpandMoreIcon />}
                        aria-controls="panel2bh-content"
                        id="panel2bh-header"
                      >
                        <Row>
                          <Space>
                            <Typography sx={{ width: "33%", flexShrink: 0 }}>
                              Vendor Locations
                            </Typography>
                          </Space>
                        </Row>
                      </AccordionSummary>
                      <Row justify="end">
                        <Col span={24} style={{ paddingLeft: 15 }}>
                          <Row justify="space-between">
                            <Space>
                              {/* <Typography
                                sx={{
                                  width: "33%",
                                  flexShrink: 0,
                                  marginRight: "4px",
                                }}
                              >
                                Opening Total - {vendorData.openingTotal}
                              </Typography> */}
                              <Typography
                                sx={{
                                  width: "33%",
                                  flexShrink: 0,
                                  marginRight: "4px",
                                }}
                              >
                                Total - {vendorData.openingTotal}{" "}
                                {headerData?.unit}
                              </Typography>
                            </Space>
                            <Button
                              style={{ marginRight: "1em" }}
                              onClick={() => getStockDetails("VENDOR")}
                            >
                              <AutorenewIcon />
                            </Button>
                          </Row>
                        </Col>
                      </Row>

                      <AccordionDetails>
                        <Row gutter={[6, 6]}>
                          {vendorData?.stock?.map((row) => (
                            <LocationCard
                              locationAddress={row.loc_address}
                              location={row.loc_name}
                              value={row.closing}
                              opening={row.opening}
                              unit={vendorData?.unit}
                              owner={row.loc_owner}
                            />
                          ))}
                          {vendorData.length === 0 && (
                            <Col span={24} style={{ justifyItems: "center" }}>
                              <NoData />
                            </Col>
                          )}
                        </Row>
                      </AccordionDetails>
                    </Accordion>
                  </Col>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

export default QueryQ5;
