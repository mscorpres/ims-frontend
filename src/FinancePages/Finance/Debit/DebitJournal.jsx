import { useState } from "react";
import SingleDatePicker from "../../../Components/SingleDatePicker";
import { v4 } from "uuid";
import { AiOutlineMinusSquare, AiOutlinePlusSquare } from "react-icons/ai";
import { toast } from "react-toastify";
import NavFooter from "../../../Components/NavFooter";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import FormTable from "../../../Components/FormTable";
import { GridActionsCellItem } from "@mui/x-data-grid";
import { Card, Col, Input, Row, Modal, Upload, Drawer, Form, Button } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { imsAxios } from "../../../axiosInterceptor";
import MyButton from "../../../Components/MyButton";
import { downloadExcel } from "../../../Components/printFunction.js";



export default function JournalPosting() {
  const [journalDate, setJournalDate] = useState("");
  const [debitTotal, setDebitTotal] = useState(0);
  const [creditTotal, setCreditTotal] = useState(0);
  const [asyncOptions, setAsyncOptions] = useState([]);
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
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [submitAllLoading, setSubmitAllLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewRows, setPreviewRows] = useState([]);
  const [uploadForm] = Form.useForm();

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
      }, 0)
    );
    setDebitTotal(
      debitArr?.reduce((partialSum, a) => {
        return Number(partialSum) + Number(a);
      }, 0)
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

   const downloadSampleFile = async () => {
    // const vbtNo =
    //   debitNoteDrawer?.length >= 1
    //     ? debitNoteDrawer[0]
    //     : debitNoteDrawer?.vbt_code;
    try {
      setLoading("sample");
      const response = await imsAxios.get(
        "/tally/debitNote/downloadSample",
        { params: { type: "debitnote" } }
      );
      const { data } = response;
      if (data && data.code === 200) {
        downloadExcel(data.data.buffer.data, "Debit Note Sample");
      } else {
        toast.error(data?.message?.msg ?? "Unable to download sample file");
      }
    } catch (error) {
      toast.error("Some error occured while downloading the sample file");
    } finally {
      setLoading(false);
    }
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
      }, 0)
    );
    setDebitTotal(
      debitArr?.reduce((partialSum, a) => {
        return Number(partialSum) + Number(a);
      }, 0)
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
        key={"delete"}
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
    if (Math.abs(debitTotal - creditTotal) > 0.01) {
      return toast.error("Total Debit and Total Credit must be equal");
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
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  const uploadProps = {
    name: "file",
    multiple: false,
    maxCount: 1,
    beforeUpload() {
      return false;
    },
  };
  const recalcTotals = (rows) => {
    const nonTotalRows = rows.filter((r) => !r.total);
    const totalDebit = nonTotalRows.reduce(
      (sum, r) => sum + (Number(r.debit) || 0),
      0
    );
    const totalCredit = nonTotalRows.reduce(
      (sum, r) => sum + (Number(r.credit) || 0),
      0
    );
    const rowsWithTotal = rows.map((r) =>
      r.total ? { ...r, debit: totalDebit, credit: totalCredit } : r
    );
    return { rows: rowsWithTotal, totalDebit, totalCredit };
  };
  const updatePreviewRow = (rowId, name, value) => {
    setPreviewRows((prev) => {
      const rows = prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [name]: value,
              resolved: name === "glCode" ? true : row.resolved,
            }
          : row
      );
      const { rows: rowsWithTotal } = recalcTotals(rows);
      return rowsWithTotal;
    });
  };
  const uploadHandler = async () => {
    try {
      const values = uploadForm.getFieldsValue();
      if(journalDate == null || !journalDate) {
        return toast.error("Please select Effective date");
      }
      if (!values.files || values.files.length === 0) {
        return toast.error("Please select a file");
      }
      setUploadLoading(true);
      const file = values.files[0].originFileObj;
      const formData = new FormData();
      formData.append("file", file);
      const response = await imsAxios.post("/tally/dv/upload", formData);
      if (response?.success) {
        const lines = response.data?.lines || [];
        const rows = [
          ...lines.map((line) => ({
            id: v4(),
            glCode: line.ledgerKey
              ? { label: line.ledgerName || line.glCode, value: line.ledgerKey }
              : "",
            glCodeText: line.glCode,
            debit: line.debit || "",
            credit: line.credit || "",
            comment: line.comment || "",
            resolved: Boolean(line.ledgerKey),
          })),
          { id: v4(), total: true, debit: 0, credit: 0 },
        ];
        const { rows: rowsWithTotal } = recalcTotals(rows);
        setPreviewRows(rowsWithTotal);
        setPreview(true);
        setUploadModalOpen(false);
      } else {
        toast.error(
          response?.message?.msg || response?.message || "Error uploading file"
        );
      }
    } catch (error) {
      toast.error(error?.message || "Error uploading and parsing file");
    } finally {
      setUploadLoading(false);
    }
  };
  const addPreviewRow = () => {
    setPreviewRows((prev) => {
      const rows = [
        {
          id: v4(),
          glCode: "",
          debit: "",
          credit: "",
          comment: "",
          resolved: false,
        },
        ...prev,
      ];
      const { rows: rowsWithTotal } = recalcTotals(rows);
      return rowsWithTotal;
    });
  };
  const removePreviewRow = (rowId) => {
    setPreviewRows((prev) => {
      const rows = prev.filter((row) => row.id !== rowId);
      const { rows: rowsWithTotal } = recalcTotals(rows);
      return rowsWithTotal;
    });
  };
  const previewColumns = (totalDebit, totalCredit, rowsLength) => [
    {
      headerName: (
        <span onClick={addPreviewRow}>
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
          key="delete"
          icon={
            <AiOutlineMinusSquare
              style={{
                fontSize: "1.7rem",
                cursor: "pointer",
                pointerEvents:
                  rowsLength === 2 || row.total ? "none" : "all",
                opacity: rowsLength === 2 || row.total ? 0.5 : 1,
              }}
            />
          }
          onClick={() => {
            rowsLength > 2 && removePreviewRow(row.id);
          }}
          label="Delete"
        />,
      ],
    },
    {
      headerName: "GL Code",
      field: "glCode",
      width: 320,
      sortable: false,
      renderCell: ({ row }) =>
        row.total ? (
          <div
            style={{ width: "100%", textAlign: "center", fontWeight: 600 }}
          >
            Total
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              border: row.resolved ? "none" : "1px solid #ff4d4f",
              borderRadius: 4,
            }}
          >
            <MyAsyncSelect
              onBlur={() => setAsyncOptions([])}
              value={row.glCode}
              onChange={(value) =>
                updatePreviewRow(row.id, "glCode", value)
              }
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
        <Input
          value={row.total ? Number(totalDebit).toFixed(2) : row.debit}
          disabled={row.total || Number(row.credit) > 0}
          onChange={(e) =>
            updatePreviewRow(row.id, "debit", e.target.value)
          }
        />
      ),
    },
    {
      headerName: "Credit",
      field: "credit",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) => (
        <Input
          value={row.total ? Number(totalCredit).toFixed(2) : row.credit}
          disabled={row.total || Number(row.debit) > 0}
          onChange={(e) =>
            updatePreviewRow(row.id, "credit", e.target.value)
          }
        />
      ),
    },
    {
      headerName: "Comment",
      field: "comment",
      flex: 1,
      sortable: false,
      renderCell: ({ row }) =>
        !row.total && (
          <Input
            value={row.comment}
            onChange={(e) =>
              updatePreviewRow(row.id, "comment", e.target.value)
            }
          />
        ),
    },
  ];
  const submitPreview = () => {
    if (!journalDate) {
      return toast.error("Please select Effective date");
    }
    const unresolved = previewRows.some((r) => !r.total && !r.glCode?.value);
    if (unresolved) {
      return toast.error("Please resolve all GL Codes");
    }
    const totalRow = previewRows.find((r) => r.total);
    if (Math.abs((totalRow?.debit || 0) - (totalRow?.credit || 0)) > 0.01) {
      return toast.error("Total Debit and Total Credit must be equal");
    }
    Modal.confirm({
      title: "Submit Debit Voucher",
      content: "This will create a debit voucher from the excel. Continue?",
      okText: "Continue",
      cancelText: "Back",
      onOk: async () => {
        setSubmitAllLoading(true);
        const lines = previewRows.filter((r) => !r.total);
        const payload = {
          effective_date: journalDate,
          gl_code: lines.map((r) => r.glCode.value),
          credit: lines.map((r) => (r.credit === "" ? 0 : r.credit)),
          debit: lines.map((r) => (r.debit === "" ? 0 : r.debit)),
          comment: lines.map((r) => r.comment || ""),
        };
        try {
          const { data } = await imsAxios.post(
            "/tally/dv/createDebitVoucher",
            payload
          );
          if (data.code == 200) {
            toast.success(data.message.msg);
            setPreview(false);
            setPreviewRows([]);
            resetHandler();
          } else {
            toast.error(data.message.msg);
          }
        } catch (error) {
          toast.error("Some error occured while creating the voucher");
        } finally {
          setSubmitAllLoading(false);
        }
      },
    });
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
            <Row gutter={[4, 4]}>
              <Col span={24}>
                <SingleDatePicker
                  setDate={setJournalDate}
                  placeholder="Select Effective Date.."
                  selectedDate={journalDate}
                />
              </Col>
              <Col span={24} style={{ textAlign: "right", marginTop: 10 }}>
                <MyButton
                  variant="upload"
                  text="Excel"
                  onClick={() => setUploadModalOpen(true)}
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
      <Modal
        title="Upload File Here"
        open={uploadModalOpen}
        width={500}
        onCancel={() => setUploadModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setUploadModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={uploadLoading}
            onClick={uploadHandler}
          >
            Preview
          </Button>,
        ]}
      >
        <Card>
          <Form form={uploadForm} layout="vertical">
            <Form.Item>
              <Form.Item
                name="files"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                noStyle
              >
                <Upload.Dragger name="files" {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    Click or drag file to this area to upload
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </Form.Item>
            <Row justify="end" style={{ marginTop: 5 }}>
              <MyButton
                variant="downloadSample"
                onClick={downloadSampleFile}
                loading={loading === "sample"}
              />
            </Row>
          </Form>
        </Card>
      </Modal>
      <Drawer
        width="100%"
        title="Data From Excel"
        placement="right"
        onClose={() => setPreview(false)}
        destroyOnClose={true}
        open={preview}
        bodyStyle={{ padding: 5 }}
      >
        <Row
          style={{ height: "calc(100% - 80px)", display: "flex", justifyContent: "center" }}
        >
          <Col span={24}>
            <Card size="small" style={{ marginBottom: 12 }}>
              <FormTable
                data={previewRows}
                columns={previewColumns(
                  previewRows.find((r) => r.total)?.debit || 0,
                  previewRows.find((r) => r.total)?.credit || 0,
                  previewRows.length
                )}
              />
            </Card>
          </Col>
          <Row
            span={24}
            style={{
              width: "100%",
              height: "10%",
              display: "flex",
              justifyContent: "end",
            }}
          >
            <NavFooter
              loading={submitAllLoading}
              submitFunction={submitPreview}
              nextLabel="Submit"
              resetFunction={() => setPreview(false)}
            />
          </Row>
        </Row>
      </Drawer>
      <NavFooter
        loading={loading}
        submitFunction={submitHandler}
        resetFunction={resetHandler}
        nextLabel="Submit"
      />
    </div>
  );
}
