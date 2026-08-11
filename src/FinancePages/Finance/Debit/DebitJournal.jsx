import { useState } from "react";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { v4 } from "uuid";
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";
import { toast } from "react-toastify";
import NavFooter from "../../../Components/NavFooter";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import FormTable from "../../../Components/FormTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import {
  Card,
  Col,
  Collapse,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
} from "antd";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";
import { downloadExcel } from "../../../Components/printFunction";
import { InboxOutlined } from "@ant-design/icons";

const debitNoteItemColumns = [
  { title: "Part Code", dataIndex: "partCode", width: 110 },
  { title: "Part Name", dataIndex: "partName", ellipsis: true },
  { title: "Narration", dataIndex: "narration", ellipsis: true },
  { title: "Qty", dataIndex: "quantity", width: 70, align: "right" },
  { title: "UOM", dataIndex: "uom", width: 70 },
  { title: "Rate", dataIndex: "rate", width: 80, align: "right" },
  {
    title: "Value",
    dataIndex: "value",
    width: 100,
    align: "right",
    render: (value) => (+Number(value ?? 0)).toLocaleString("en-IN"),
  },
  {
    title: "GL",
    dataIndex: "glDetails",
    width: 190,
    render: (gl) => (gl ? `${gl.name} (${gl.code})` : "-"),
  },
  {
    title: "TDS GL",
    dataIndex: "tdsDetails",
    width: 200,
    render: (tds) =>
      tds?.length ? (
        <div>
          {tds.map((t, i) => (
            <div key={i} style={{ marginBottom: i < tds.length - 1 ? 6 : 0 }}>
              <div>{t.masterDetails?.gl_code ?? "-"}</div>
            </div>
          ))}
        </div>
      ) : (
        "-"
      ),
  },
  {
    title: "TDS",
    dataIndex: "tdsDetails",
    width: 160,
    render: (tds) =>
      tds?.length
        ? tds
            .map(
              (t) => `${t.masterDetails?.name ?? t.tdsCode} (${t.tdsPercent}%)`,
            )
            .join(", ")
        : "-",
  },
  {
    title: "Total TDS Amount",
    dataIndex: "tdsAmount",
    width: 160,
  },
];

export default function JournalPosting() {
  const [journalDate, setJournalDate] = useState("");
  const [debitTotal, setDebitTotal] = useState(0);
  const [creditTotal, setCreditTotal] = useState(0);
  const [parsedDebitNotes, setParsedDebitNotes] = useState(null);
  const [excelUploadLoading, setExcelUploadLoading] = useState(false);
  const [bulkDebitNoteSubmitting, setBulkDebitNoteSubmitting] = useState(false);

  const [excelUploadOpen, setExcelUploadOpen] = useState(false);
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [excelUploadForm] = Form.useForm();
  const [journalRows, setJounralRows] = useState([
    {
      id: v4(),
      glCode: "",
      debit: "",
      credit: "",
      comment: "",
    },
    {
      id: v4(),
      glCode: "",
      debit: "",
      credit: "",
      comment: "",
    },
    { id: v4(), total: true, debit: 0, credit: 0 },
  ]);

  const [loading, setLoading] = useState(false);
  const [selectLoading, setSelectLoading] = useState(false);

  const addRows = () => {
    let dummy = [];
    dummy = journalRows;
    dummy = [
      {
        id: v4(),
        glCode: "",
        debit: "",
        credit: "",
        comment: "",
      },
      ...dummy,
    ];
    setJounralRows(dummy);
  };
  const removeRow = (rowId) => {
    let arr = journalRows;
    arr = arr.filter((row) => row.id != rowId);
    let creditArr = arr.map((row, index) => {
      // console.log(index);
      if (index < arr.length - 1) {
        if (row.credit != "") {
          return row.credit;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });
    let debitArr = arr.map((row, index) => {
      if (index < arr.length - 1) {
        if (row.debit != "") {
          return row.debit;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });
    setCreditTotal(
      creditArr?.reduce((partialSum, a) => {
        return Number(partialSum) + Number(a);
      }, 0),
    );
    setDebitTotal(
      debitArr?.reduce((partialSum, a) => {
        return Number(partialSum) + Number(a);
      }, 0),
    );
    setJounralRows(arr);
  };
  const getLedger = async (search) => {
    setSelectLoading(true);
    const { data } = await imsAxios.post("/tally/ledger/ledger_options", {
      search: search,
    });
    setSelectLoading(false);
    let arr = [];
    if (!data.msg) {
      arr = data.data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    } else {
      setAsyncOptions([]);
    }
  };
  const getDebitCreditBalance = (dn) => {
    const items = dn?.items ?? [];
    const taxableValue = items.reduce(
      (sum, item) => sum + (+item.value || 0),
      0,
    );
    const tdsAmount = +dn?.totalTdsAmount || 0;
    const taxes = dn?.taxes ?? {};
    const igst = +taxes.igstInputReversal || 0;
    const cgst = +taxes.cgstInputReversal || 0;
    const sgst = +taxes.sgstInputReversal || 0;
    const roundOff = +dn?.roundOff || 0;
    const totalValue = +dn?.totalValue || 0;

    let debit = totalValue + tdsAmount;
    let credit = taxableValue + igst + cgst + sgst;

    if (roundOff < 0) {
      debit += Math.abs(roundOff);
    } else if (roundOff > 0) {
      credit += roundOff;
    }

   
    return {
      taxableValue,
      igst,
      cgst,
      sgst,
      tdsAmount,
      roundOff,
      totalValue,
      debit,
      credit,
    };
  };
  const getDebitNoteTotals = (dn) => {
    const {
      taxableValue,
      igst,
      cgst,
      sgst,
      tdsAmount,
      roundOff,
      totalValue,
      debit,
      credit,
    } = getDebitCreditBalance(dn);
    return [
      { name: "Taxable Value", value: taxableValue },
      { name: "IGST", value: igst },
      { name: "CGST", value: cgst },
      { name: "SGST", value: sgst },
      { name: "TDS Amount", value: tdsAmount },
      { name: "Round Off", value: roundOff || 0 },
      {
        name: "Total Value",
        value: `₹${totalValue}`,
      },
      {
        name: "Debit",
        value: `₹${debit.toFixed(2)}`,
      },
      {
        name: "Credit",
        value: `₹${credit.toFixed(2)}`,
      },

    ];
  };
  const inputHandler = (name, value, id) => {
    let arr = [];

    arr = journalRows.map((row) => {
      if (row.id == id) {
        let obj = row;
        obj = {
          ...obj,
          [name]: value,
        };
        return obj;
      } else {
        return row;
      }
    });
    let creditArr = arr.map((row, index) => {
      if (index < arr.length - 1) {
        if (row.credit != "") {
          return row.credit;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });
    let debitArr = arr.map((row, index) => {
      if (index < arr.length - 1) {
        if (row.debit != "") {
          return row.debit;
        } else {
          return 0;
        }
      } else {
        return 0;
      }
    });

    setCreditTotal(
      creditArr?.reduce((partialSum, a) => {
        return Number(partialSum) + Number(a);
      }, 0),
    );
    setDebitTotal(
      debitArr?.reduce((partialSum, a) => {
        return Number(partialSum) + Number(a);
      }, 0),
    );

    setJounralRows(arr);
  };
  const columns = [
    {
      headerName: (
        <span onClick={addRows}>
          <AiOutlinePlusSquare
            style={{
              cursor: "pointer",
              fontSize: "1.7rem",
              opacity: "0.7",
            }}
          />
        </span>
      ),
      width: 80,
      type: "actions",
      field: "add",
      sortable: false,
      renderCell: ({ row }) => [
        <GridActionsCellItem
          key={row.id || "pointer"}
          icon={
            <AiOutlineMinusSquare
              style={{
                fontSize: "1.7rem",
                cursor: "pointer",
                pointerEvents:
                  journalRows.length === 3 || row.total ? "none" : "all",
                opacity: journalRows.length === 3 || row.total ? 0.5 : 1,
              }}
            />
          }
          onClick={() => {
            journalRows.length > 3 && removeRow(row.id);
          }}
          label="Delete"
        />,
      ],
    },

    {
      headerName: "GL Code",
      field: "glCode",
      width: 400,
      sortable: false,
      renderCell: ({ row }) =>
        row.total ? (
          <div
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: "1.1rem",
            }}
          >
            Total
          </div>
        ) : (
          <div style={{ width: "100%" }}>
            <MyAsyncSelect
              onBlur={() => setAsyncOptions([])}
              value={row?.glCode}
              onChange={(value) => {
                inputHandler("glCode", value, row?.id);
              }}
              labelInValue
              selectLoading={selectLoading}
              optionsState={asyncOptions}
              loadOptions={getLedger}
              placeholder="Select G/L..."
            />
          </div>
        ),
    },
    {
      headerName: "Debit",
      field: "debit",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <>
          {row.total ? (
            <Input
              disabled={true}
              value={debitTotal.toFixed(2)}
              onChange={(e) => inputHandler("debit", e.target.value, row.id)}
              name="debit"
              inputType="number"
            />
          ) : (
            <Input
              value={row.debit}
              fun={inputHandler}
              onChange={(e) => inputHandler("debit", e.target.value, row.id)}
              disabled={row.credit?.length > 0}
              inputType="number"
            />
          )}
        </>
      ),

      // width: "10vw",
    },
    {
      headerName: "Credit",
      field: "credit",
      flex: 1,
      sortable: false,
      // width: "10vw",
      renderCell: ({ row }) => (
        <Input
          // size="small"
          value={row.total ? creditTotal.toFixed(2) : row.credit}
          onChange={(e) => inputHandler("credit", e.target.value, row.id)}
          disabled={row.total || row.debit?.length > 0}
        />
      ),
    },
    {
      headerName: "Comment",
      // width: "20.5vw",
      field: "comment",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) =>
        !row.total && (
          <Input
            onChange={(e) => {
              inputHandler("comment", e.target.value, row.id);
            }}
            value={row?.comment}
            name="comment"
          />
        ),
    },
  ];
  const submitHandler = async () => {
    if (!journalDate) {
      return toast.error("Please select Effective date");
    }
    let finalObj = {
      effective_date: journalDate,
      gl_code: [],
      credit: [],
      debit: [],
      comment: [],
    };
    let problem = null;
    journalRows.map((row, index) => {
      if (row.glCode == "") {
        problem = "gl_code";
      } else {
        if (index < journalRows.length - 1) {
          finalObj = {
            ...finalObj,
            gl_code: [...finalObj.gl_code, row.glCode.value],
            credit: [...finalObj.credit, row.credit == "" ? 0 : row.credit],
            debit: [...finalObj.debit, row.debit == "" ? 0 : row.debit],
            comment: [...finalObj.comment, row.comment],
          };
        }
      }
    });
    if (!problem) {
      setLoading(true);
      const { data } = await imsAxios.post("/tally/dv/createDebitVoucher", {
        ...finalObj,
      });
      setLoading(false);
      if (data.code == 200) {
        resetHandler();
        toast.success(data.message.msg);
      } else {
        toast.error(data.message.msg);
      }
    } else {
      if (problem == "gl_code") {
        return toast.error("All entries should have a gl_code");
      }
    }
  };
  const resetHandler = () => {
    setJounralRows([
      {
        id: v4(),
        glCode: "",
        debit: "",
        credit: "",
        comment: "",
      },
      {
        id: v4(),
        glCode: "",
        debit: "",
        credit: "",
        comment: "",
      },
      { id: v4(), total: true, debit: 0, credit: 0 },
    ]);
    setDebitTotal(0);
    setCreditTotal(0);
    // setJournalDate("");
  };

  const handleExcelUpload = async () => {
    const values = excelUploadForm.getFieldsValue();
    const file = values.files?.[0]?.originFileObj;
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      setExcelUploadLoading("upload");
      const response = await imsAxios.post(
        "/tally/vbt01/upload/item",
        formData,
      );
      const { data } = response;
      if (data && data.code === 200) {
        const debitNotes = data.data?.debitNotes ?? [];
        if (debitNotes.length === 0) {
          toast.error("No debit notes found in the uploaded file");
        } else {
          setParsedDebitNotes(debitNotes);
          toast.success(data.message ?? "Excel file processed successfully");
          setExcelUploadOpen(false);
          excelUploadForm.resetFields();
        }
      } else {
        toast.error(
          data?.message?.msg ?? data?.message ?? "Excel validation failed",
        );
      }
    } catch (error) {
      toast.error("Some error occured while uploading the excel");
      console.log("Some error occured while uploading the excel", error);
    } finally {
      setExcelUploadLoading(false);
    }
  };

  const downloadDebitNoteSampleFile = async () => {
    try {
      setExcelUploadLoading("sample");
      const response = await imsAxios.get("/tally/debitNote/downloadSample", {
        params: { type: "vbt" },
      });
      const { data } = response;
      if (data && data.code === 200) {
        downloadExcel(data.data.buffer.data, "Debit Note Sample");
      } else {
        toast.error(data?.message?.msg ?? "Unable to download sample file");
      }
    } catch (error) {
      toast.error("Some error occured while downloading the sample file");
    } finally {
      setExcelUploadLoading(false);
    }
  };
  const submitBulkDebitNotes = async () => {
    if (!parsedDebitNotes || parsedDebitNotes.length === 0) {
      toast.error("No debit notes to submit");
      return;
    }
    const unbalancedNotes = parsedDebitNotes.filter(
      (dn) => !getDebitCreditBalance(dn).balanced,
    );
    if (unbalancedNotes.length > 0) {
      toast.error(
        `Debit and Credit value is not equal for: ${unbalancedNotes
          .map((dn) => dn.voucherNo)
          .join(", ")}`,
      );
      return;
    }
    try {
      setBulkDebitNoteSubmitting(true);
      const response = await imsAxios.post("/tally/vbt01/create-bulk-debit-note", {
        debitNotes: parsedDebitNotes,
      });
      const { data } = response;
      if (data && data.code === 200) {
        
        toast.success(data.message ?? "Debit notes saved successfully");
        setParsedDebitNotes(null);
      } else {
        toast.error(
          data?.message?.msg ?? data?.message ?? "Unable to save debit notes",
        );
      }
    } catch (error) {
      toast.error("Some error occured while saving the debit notes");
      console.log("Some error occured while saving the debit notes", error);
    } finally {
      setBulkDebitNoteSubmitting(false);
    }
  };

  const normExcelFile = (e) => {
    if (Array.isArray(e)) return e;
    return e?.fileList;
  };

  const excelUploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    beforeUpload: () => false,
  };
  const { Text } = Typography;

  return (
    <div style={{ height: "90%" }}>
      <Row
        gutter={[4, 4]}
        style={{
          height: "100%",
          padding: "0px 5px",
        }}
      >
        <Col span={6}>
          <Card title="Select Date" size="small">
            <Row>
              <Col span={24}>
                <SingleDatePicker
                  setDate={setJournalDate}
                  placeholder="Select Effective Date.."
                  selectedDate={journalDate}
                />
              </Col>
              <Col
                span={24}
                style={{
                  marginTop: "10px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <MyButton
                  variant="upload"
                  text="Bulk Upload"
                  onClick={() => {
                    setExcelUploadOpen(true);
                  }}
                />
            
              </Col>
            </Row>
          </Card>
        </Col>
        <Col style={{ height: "100%", padding: 0 }} span={18}>
          <Row style={{ height: "100%", padding: 0 }}>
            <Col style={{ height: "100%", padding: 0 }} span={24}>
              <Card
                style={{ height: "90%", padding: 0 }}
                bodyStyle={{ height: "100%", padding: 0 }}
                size="small"
              >
                <FormTable data={journalRows} columns={columns} />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      <NavFooter
        loading={loading}
        submitFunction={submitHandler}
        resetFunction={resetHandler}
        nextLabel="Submit"
      />
      <Modal
        title="Upload Excel"
        open={excelUploadOpen}
        onCancel={() => {
          setExcelUploadOpen(false);
          excelUploadForm.resetFields();
        }}
        footer={[
          <MyButton
            key="cancel"
            onClick={() => {
              setExcelUploadOpen(false);
              excelUploadForm.resetFields();
            }}
            variant="reset"
            text="Cancel"
          />,
          <MyButton
            key="upload"
            type="primary"
            variant="upload"
            text="Upload"
            loading={excelUploadLoading === "upload"}
            onClick={handleExcelUpload}
          />,
        ]}
      >
        <Form form={excelUploadForm} layout="vertical">
          <Form.Item
            name="files"
            valuePropName="fileList"
            getValueFromEvent={normExcelFile}
            noStyle
          >
            <Upload.Dragger name="file" {...excelUploadProps}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                Click or drag excel file to this area to upload
              </p>
            </Upload.Dragger>
          </Form.Item>
          <Row justify="end" style={{ marginTop: 5 }}>
            <MyButton
              variant="downloadSample"
              loading={excelUploadLoading === "sample"}
              onClick={downloadDebitNoteSampleFile}
            />
          </Row>
        </Form>
      </Modal>
      <Drawer
        title={
          parsedDebitNotes
            ? `Parsed Debit Notes (${parsedDebitNotes.length})`
            : "Parsed Debit Notes"
        }
        open={!!parsedDebitNotes}
        onClose={() => setParsedDebitNotes(null)}
        width="100vw"
        destroyOnClose
        extra={
          <Space>
            <MyButton
              variant="reset"
              text="Close"
              onClick={() => setParsedDebitNotes(null)}
            />
            <MyButton
              variant="submit"
              text="Submit"
              loading={bulkDebitNoteSubmitting}
              onClick={submitBulkDebitNotes}
            />
          </Space>
        }
      >
        <div style={{ paddingRight: 4 }}>
          {!parsedDebitNotes || parsedDebitNotes.length === 0 ? (
            <Empty description="No debit notes to preview" />
          ) : (
            <>
              <Collapse
                defaultActiveKey={parsedDebitNotes.map((_, idx) => idx)}
              >
                {parsedDebitNotes.map((dn, idx) => (
                  <Collapse.Panel
                    key={idx}
                    header={
                      <Space size="middle" wrap>
                        <Text strong>{dn.voucherNo}</Text>
                        <Tag color="blue">{dn.date}</Tag>
                        <Text>
                          {dn.venName} ({dn.vendorCode})
                        </Text>
                        <Text type="secondary">Ref: {dn.voucherRefNo}</Text>
                        {/* <Tag color="green">
                          ₹{(+dn.totalValue || 0).toLocaleString("en-IN")}
                        </Tag> */}
                      </Space>
                    }
                  >
                    <Descriptions
                      size="small"
                      column={3}
                      bordered
                      style={{ marginBottom: 12 }}
                    >
                      <Descriptions.Item label="Vendor Code">
                        {dn.venRegisterId}
                      </Descriptions.Item>
                      <Descriptions.Item label="GSTIN">
                        {dn.gstin}
                      </Descriptions.Item>
                      <Descriptions.Item label="Voucher Ref No.">
                        {dn.voucherRefNo}
                      </Descriptions.Item>
                    </Descriptions>
                    <Row gutter={12}>
                      <Col span={18}>
                        <Table
                          size="small"
                          pagination={false}
                          rowKey={(row, rowIdx) => row.componentKey ?? rowIdx}
                          dataSource={dn.items}
                          columns={debitNoteItemColumns}
                          scroll={{ x: "max-content" }}
                        />
                      </Col>
                      <Col span={6}>
                        <Card size="small" title="Total Values">
                          {getDebitNoteTotals(dn).map((row) => (
                            <Row key={row.name}>
                              <Col span={12}>
                                <Text strong style={{ fontSize: "0.8rem" }}>
                                  {row.name}
                                </Text>
                              </Col>
                              <Col span={12}>
                                <Row justify="end">
                                  <Text style={{ fontSize: "0.8rem" }}>
                                    {row.value}
                                  </Text>
                                </Row>
                              </Col>
                              <Divider
                                style={{ marginBottom: 5, marginTop: 5 }}
                              />
                            </Row>
                          ))}
                        </Card>
                      </Col>
                    </Row>
                  </Collapse.Panel>
                ))}
              </Collapse>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
}
