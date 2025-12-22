import React, { useState, useEffect } from "react";
import { Button, Col, Input, Row, Select, Modal, Form } from "antd";
import MyDatePicker from "../../Components/MyDatePicker.jsx";
import { toast } from "react-toastify";
import MyAsyncSelect from "../../Components/MyAsyncSelect.jsx";
import { v4 } from "uuid";
import MyDataTable from "../../Components/MyDataTable.jsx";
import { ArrowRightOutlined } from "@ant-design/icons";
import JwRmConsumptionModal from "./Modal/JwRmConsumptionModal.jsx";
import { imsAxios } from "../../axiosInterceptor.js";
import useLoading from "../../hooks/useLoading.js";
import useApi from "../../hooks/useApi.ts";
import { getVendorOptions } from "../../api/general.ts";
import { convertSelectOptions } from "../../utils/general.ts";
import MyButton from "../../Components/MyButton/index.jsx";

const JwRmConsumption = () => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [loading, setLoading] = useLoading(false);
  const [editModal, setEditModal] = useState(false);
  const [datee, setDatee] = useState("");
  const [allData, setAllData] = useState({
    setType: "",
    jw: "",
    sku: "",
    ven: "",
  });
  const [dateData, setDateData] = useState([]);
  const [jwData, setDJWData] = useState([]);
  const [skuData, setSKUData] = useState([]);
  const [vendorData, setVendorData] = useState([]);
  const [qtyModalVisible, setQtyModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [qtyForm] = Form.useForm();
  const [bomLoading, setBomLoading] = useState(false);
  // console.log(allData);
  const { executeFun, loading: loading1 } = useApi();
  const option = [
    { label: "Date Wise", value: "datewise" },
    { label: "JW ID Wise", value: "jw_transaction_wise" },
    { label: "SFG SKU Wise", value: "jw_sfg_wise" },
    { label: "Vendor Wise", value: "vendorwise" },
  ];

  const getOption = async (e) => {
    if (e?.length > 2) {
      const { data } = await imsAxios.post("/backend/getProductByNameAndNo", {
        search: e,
      });
      // console.log(data);
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const getVendor = async (search) => {
    if (search.length > 2) {
      const response = await executeFun(
        () => getVendorOptions(search),
        "select"
      );
      let arr = [];
      if (response.success) {
        arr = convertSelectOptions(response.data);
      }
      setAsyncOptions(arr);
    }
  };

  const fetchDatewise = async () => {
    if (allData?.setType == "") {
      toast.error("Please Select Option");
    } else {
      setLoading("fetch", true);
      const { data } = await imsAxios.post("/jobwork/jw_sf_inward", {
        data: datee,
        wise: allData.setType,
      });
      if (data.code == 200) {
        let arr = data.data.map((row, index) => {
          return {
            ...row,
            id: v4(),
            index: index + 1,
          };
        });
        setDateData(arr);
        setLoading("fetch", false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading("fetch", false);
      }
    }
  };

  const fetchJWwise = async () => {
    setLoading("fetch", true);
    const { data } = await imsAxios.post("/jobwork/jw_sf_inward", {
      data: allData.jw,
      wise: allData.setType,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setDJWData(arr);
      setLoading("fetch", false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading("fetch", false);
    }
  };

  const fetchSKUwise = async () => {
    setLoading("fetch", true);
    const { data } = await imsAxios.post("/jobwork/jw_sf_inward", {
      data: allData.sku,
      wise: allData.setType,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setSKUData(arr);
      setLoading("fetch", false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading("fetch", false);
    }
  };
  const fetchVendorwise = async () => {
    setLoading("fetch", true);
    const { data } = await imsAxios.post("/jobwork/jw_sf_inward", {
      data: allData.ven,
      wise: allData.setType,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setVendorData(arr);
      setLoading("fetch", false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading("fetch", false);
    }
  };

  const handleActionsClick = (row) => {
    setSelectedRow(row);
    setQtyModalVisible(true);
    qtyForm.resetFields();
  };

  const handleQtyModalSave = async () => {
    try {
      const values = await qtyForm.validateFields();
      const qty = values.qty;
      const jwId =
        selectedRow?.transaction_id || selectedRow?.jw_transaction_id;

      if (!jwId) {
        toast.error("JW ID is missing");
        return;
      }

      setBomLoading(true);
      // Execute GET request to fetch BOM data
      const response = await imsAxios.get(
        `/jobwork/rm-consumption/view/bom?jw=${encodeURIComponent(
          jwId
        )}&qty=${qty}`
      );

      if (response.success || response.data) {
        toast.success("BOM data fetched successfully");
        setQtyModalVisible(false);
        // Open the edit modal with the row data, including qty for BOM API call
        setEditModal({
          all: allData.setType,
          row: selectedRow,
          bomData: response.data || response,
          qty: qty, // Store qty for use in getFetchData
        });
      } else {
        toast.error(response.message || "Failed to fetch BOM data");
      }
      setBomLoading(false);
    } catch (error) {
      setBomLoading(false);
      toast.error(error.message || "Error fetching BOM data");
    }
  };

  const handleQtyModalCancel = () => {
    setQtyModalVisible(false);
    setSelectedRow(null);
    qtyForm.resetFields();
  };

  const columns = [
    { field: "index", headerName: "S No.", width: 8 },
    { field: "date", headerName: "JW Date", width: 120 },
    { field: "vendor", headerName: "Vendor", width: 380 },
    { field: "transaction_id", headerName: "JW Id", width: 150 },
    { field: "sku_code", headerName: "SKU", width: 100 },
    { field: "sku_name", headerName: "Product", width: 340 },
    { field: "ord_qty", headerName: "JW PO Order Qty", width: 150 },
    // { field: "jw_sku_name", headerName: "Actions", width: 260 },
    {
      type: "actions",
      headerName: "Actions",
      width: 150,
      getActions: ({ row }) => [
        // <TableActions action="view" onClick={() => setViewModalOpen(row)} />,
        // <TableActions action="cancel" onClick={() => setCloseModalOpen(row)} />,
        // <TableActions action="print" onClick={() => console.log(row)} />,
        // <TableActions action="edit" />,
        <ArrowRightOutlined
          onClick={() => handleActionsClick(row)}
          style={{ color: "#1890ff", fontSize: "15px", cursor: "pointer" }}
        />,
      ],
    },
  ];
  return (
    <div style={{ height: "95%" }}>
      {/* <InternalNav links={JobworkLinks} /> */}
      <Row gutter={10} style={{ margin: "10px" }}>
        <Col span={4}>
          <Select
            placeholder="Please Select Option"
            style={{ width: "100%" }}
            options={option}
            value={allData.setType.value}
            onChange={(e) =>
              setAllData((allData) => {
                return { ...allData, setType: e };
              })
            }
          />
        </Col>
        {allData.setType == "datewise" ? (
          <>
            <Col span={5}>
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2}>
              <Button
                type="primary"
                loading={loading("fetch")}
                onClick={fetchDatewise}
              >
                Fetch
              </Button>
            </Col>
          </>
        ) : allData.setType == "jw_transaction_wise" ? (
          <>
            <Col span={6}>
              <Input
                placeholder="JW/Challan"
                value={allData.jw}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, jw: e.target.value };
                  })
                }
              />
            </Col>
            <Col span={2}>
              <Button
                loading={loading("fetch")}
                type="primary"
                onClick={fetchJWwise}
              >
                Fetch
              </Button>
            </Col>
          </>
        ) : allData.setType == "jw_sfg_wise" ? (
          <>
            <Col span={6}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getOption}
                value={allData.sku}
                optionsState={asyncOptions}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, sku: e };
                  })
                }
                placeholder="SFG SKU wise"
              />
            </Col>
            <Col span={2}>
              <Button
                loading={loading("fetch")}
                type="primary"
                onClick={fetchSKUwise}
              >
                Fetch
              </Button>
            </Col>
          </>
        ) : allData.setType == "vendorwise" ? (
          <>
            <Col span={6}>
              <MyAsyncSelect
                style={{ width: "100%" }}
                onBlur={() => setAsyncOptions([])}
                loadOptions={getVendor}
                value={allData.ven}
                optionsState={asyncOptions}
                onChange={(e) =>
                  setAllData((allData) => {
                    return { ...allData, ven: e };
                  })
                }
                placeholder="Vendor wise"
              />
            </Col>
            <Col span={2}>
              <Button
                loading={loading("fetch")}
                type="primary"
                onClick={fetchVendorwise}
              >
                Fetch
              </Button>
            </Col>
          </>
        ) : (
          <>
            <Col span={5}>
              <MyDatePicker setDateRange={setDatee} size="default" />
            </Col>
            <Col span={2}>
              <MyButton
                variant="search"
                type="primary"
                loading={loading("fetch")}
                onClick={fetchDatewise}
              >
                Fetch
              </MyButton>
            </Col>
          </>
        )}
      </Row>

      <div style={{ height: "89%", margin: "10px" }}>
        {allData.setType == "datewise" ? (
          <MyDataTable
            loading={loading("fetch")}
            data={dateData}
            columns={columns}
          />
        ) : allData.setType == "jw_transaction_wise" ? (
          <MyDataTable data={jwData} columns={columns} />
        ) : allData.setType == "jw_sfg_wise" ? (
          <MyDataTable data={skuData} columns={columns} />
        ) : allData.setType == "vendorwise" ? (
          <MyDataTable data={vendorData} columns={columns} />
        ) : (
          <MyDataTable data={dateData} columns={columns} />
        )}
      </div>

      <JwRmConsumptionModal
        editModal={editModal}
        setEditModal={setEditModal}
        fetchDatewise={fetchDatewise}
        fetchJWwise={fetchJWwise}
        fetchSKUwise={fetchSKUwise}
        fetchVendorwise={fetchVendorwise}
      />

      {/* Quantity Input Modal */}
      <Modal
        title="Enter Quantity"
        open={qtyModalVisible}
        onOk={handleQtyModalSave}
        onCancel={handleQtyModalCancel}
        confirmLoading={bomLoading}
        okText="Save"
        cancelText="Cancel"
      >
        <Form form={qtyForm} layout="vertical">
          <Form.Item
            name="qty"
            label="Quantity"
            rules={[
              { required: true, message: "Please enter quantity" },
              {
                pattern: /^\d+(\.\d+)?$/,
                message: "Please enter a valid number",
              },
            ]}
          >
            <Input
              type="number"
              placeholder="Enter quantity"
              autoFocus
              onPressEnter={handleQtyModalSave}
            />
          </Form.Item>
          {selectedRow && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
              <div>
                JW ID:{" "}
                {selectedRow.transaction_id || selectedRow.jw_transaction_id}
              </div>
              <div>Product: {selectedRow.sku_name}</div>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default JwRmConsumption;
