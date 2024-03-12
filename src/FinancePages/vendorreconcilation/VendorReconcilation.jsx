import {
  Form,
  Input,
  Modal,
  Col,
  Row,
  Button,
  Card,
  Typography,
  Flex,
  Divider,
} from "antd";
import { useEffect, useState } from "react";
import useApi from "../../hooks/useApi";
import { getVendorOptions } from "../../api/general";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import MyDatePicker from "../../Components/MyDatePicker";
import { getLedgerReport } from "../../api/ledger";
import MyDataTable from "../../Components/MyDataTable";
import ManualTransactions from "./components/manualTransactions";
import {
  addNote,
  deleteManualTransaction,
  getManualTransactions,
  getNotes,
  updateMatchStatus,
} from "../../api/finance/vendor-reco";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { GridActionsCellItem } from "@mui/x-data-grid";
import ToolTipEllipses from "../../Components/ToolTipEllipses";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";
import Loading from "../../Components/Loading";
import * as xlsx from "xlsx";
import { downloadExcel } from "../../Components/printFunction";
import { useSelector } from "react-redux/es/exports";
import {
  // convertDateRangeValue,
  convertSelectOptions,
} from "../../utils/general";
import { useSearchParams } from "react-router-dom";
// import MyFormDatePicker from "../../Components/MyFormDatePicker";
import dayjs from "dayjs";
import RequestLedgerModal from "./ledgers/RequestLedger";
import Ledgers from "./ledgers";

const initialValues = {
  location: undefined,
  date: "",
};

const statusOption = {
  match: "matched",
  unmatch: "unmatched",
};

const VendorReconcilation = () => {
  const [details, setDetails] = useState({});
  const [rows, setRows] = useState([]);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [vedorInput, setVendorInput] = useState({
    opening: "",
    closing: "",
  });
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [manualTransactions, setManualTransactions] = useState([]);
  const [note, setNote] = useState([]);
  const [manualTotal, setManualTotal] = useState({
    debitIms: "0",
    creditIms: "0",
    debitVendor: "0",
    creditVendor: "0",
  });
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRows, setSelectedRows] = useState([]);
  const [showRequestLedgerModal, setShowRequestLedgerModal] = useState(null);

  const { executeFun, loading } = useApi();
  const [filterForm] = Form.useForm();
  const [noteAddForm] = Form.useForm();

  const selectedVendor = Form.useWatch("vendor", filterForm);

  const hideFilters = async () => {
    setShowFilters(false);
  };

  var paramsVendorCode = searchParams.get("vendorCode");
  var paramsVendor = searchParams.get("vendor");
  var paramsDate = searchParams.get("date");
  const [showFilters, setShowFilters] = useState(
    paramsVendorCode ? false : true
  );

  const handleFetchLedgerDetais = async (vendor, date) => {
    const values = await filterForm.getFieldsValue();
    console.log("values", values);
    // const values = await filterForm.validateFields();
    const payload = {
      date: date ?? values.date,
      ledger: vendor ?? values.vendor.value,
    };

    const response = await executeFun(
      () => getLedgerReport(payload),
      "fetchDetails"
    );
    if (response.success) {
      const { summary, rows } = response.data.data;
      const obj = {
        closing: summary.closing,
        opening: summary.opening,
      };
      const arr = rows.map((row, index) => ({
        id: index + 1,
        refDate: row.ref_date,
        invoiceNumber: row.invoice_no,
        invoiceDate: row.invoice_date,
        reference: row.ref,
        type: row.which_module,
        voucherNo: row.module_used,
        status: row.credit !== "0" ? "Debit" : "Credit",
        credit: row.credit,
        matched: row.recoStatus === "matched",
        debit: row.debit,
      }));
      setRows(arr);
      setDetails(obj);
      setShowFilters();
    }
  };

  const handleFetchManualTransactions = async (
    vendorFromParams,
    dateFromParams
  ) => {
    const { vendor, date } = await filterForm.getFieldsValue();
    console.log("getting cendor parans", vendorFromParams);
    const response = await executeFun(
      () =>
        getManualTransactions(
          vendorFromParams ?? vendor.value,
          dateFromParams ?? date
        ),
      "fetchManualTrans"
    );

    if (response.success) {
      const arr = response.data.map((row, index) => ({
        id: index + 1,
        invoiceNumber: row.invoiceNo,
        invoiceDate: row.invoiceDate,
        type: row.type,
        amount: row.amount,
        transactionType: row.type,
        description: row.description,
        debit: row.type === "debit" ? row.amount : 0,
        credit: row.type === "credit" ? row.amount : 0,
        reference: row.impactOn,
        status: row.type,
        impact: row.impactOn,
        transactionId: row.transactionID,
      }));
      const debitImsArr = arr.filter(
        (row) =>
          row.status.toLowerCase() === "debit" &&
          row.impact.toLowerCase() === "ims"
      );

      const creditImsArr = arr.filter(
        (row) =>
          row.status.toLowerCase() === "credit" &&
          row.impact.toLowerCase() === "ims"
      );

      const debitVendorArr = arr.filter(
        (row) =>
          row.status.toLowerCase() === "debit" &&
          row.impact.toLowerCase() === "vendor"
      );

      const creditVendorArr = arr.filter(
        (row) =>
          row.status.toLowerCase() === "credit" &&
          row.impact.toLowerCase() === "vendor"
      );
      setManualTotal({
        debitIms: debitImsArr.reduce(
          (partialSum, a) => partialSum + +Number(a.debit).toFixed(2),
          0
        ),
        creditIms: creditImsArr.reduce(
          (partialSum, a) => partialSum + +Number(a.credit).toFixed(2),
          0
        ),
        debitVendor: debitVendorArr.reduce(
          (partialSum, a) => partialSum + +Number(a.debit).toFixed(2),
          0
        ),
        creditVendor: creditVendorArr.reduce(
          (partialSum, a) => partialSum + +Number(a.credit).toFixed(2),
          0
        ),
      });
      setManualTransactions(arr);
    }
  };

  const handleUpdateMatchStatus = async (status) => {
    let finalArr = [];
    selectedRows.map((selRow) => {
      const found = rows.find((row) => row.id === selRow);
      if (found) {
        finalArr = [...finalArr, found.voucherNo];
      }
    });

    const response = await executeFun(
      () => updateMatchStatus(status, finalArr),
      "updateStatus"
    );
    if (response.success) {
      handleFetchLedgerDetais();
    }
  };

  const handleAddNoteForm = async () => {
    const values = await noteAddForm.validateFields();
    const filterValues = await filterForm.validateFields();
    const payload = {
      ...values,
      vendor: filterValues.vendor.value,
    };
    const response = await executeFun(() => addNote(payload), "addNote");
    if (response.success) {
      noteAddForm.resetFields();
      setShowNoteDialog(false);
      handleFetchNote();
    }
  };

  const handleFetchNote = async (vendorCode) => {
    const response = await executeFun(() => getNotes(vendorCode), "fetchNotes");
    let arr = [];
    if (response.success) {
      arr = response.data;
    }
    setNote(arr);
  };

  const handleDeleteManual = async (transId) => {
    const response = await executeFun(
      () => deleteManualTransaction(transId),
      "deleteManual"
    );

    if (response.success) {
      handleFetchManualTransactions();
    }
  };

  const toggleShowRequestLedgerModal = async () => {
    const values = await filterForm.validateFields();
    setShowRequestLedgerModal(values);
  };

  useEffect(() => {
    if (showNoteDialog) {
      const vendor = filterForm.getFieldValue("vendor");
      handleFetchNote(vendor?.value);
    }
  }, [showNoteDialog]);

  useEffect(() => {
    if (paramsVendor) {
      setShowFilters(false);
      console.log("calling fetchin gledger rport", paramsVendorCode);
      filterForm.setFieldValue("vendor", {
        label: paramsVendor,
        value: paramsVendorCode,
      });

      filterForm.setFieldValue("date", paramsDate);
      handleFetchManualTransactions(paramsVendorCode, paramsDate);
      handleFetchLedgerDetais(paramsVendorCode, paramsDate);
    }
  }, [paramsVendorCode]);

  // useEffect(() => {
  //   setVendorInput({
  //     opening: "",
  //     closing: "",
  //   });
  // }, [details]);
  // const actionColumn = {
  //   headerName: "Matched?",
  //   field: "matched",
  //   renderCell: ({ row }) =>
  //     row.matched ? (
  //       <div onClick={() => handleUpdateMatchStatus("Draft")}>
  //         <CheckCircleOutlined style={{ color: "green" }} />
  //       </div>
  //     ) : (
  //       <div onClick={() => handleUpdateMatchStatus("Matched")}>
  //         <CloseCircleOutlined style={{ color: "red" }} />
  //       </div>
  //     ),
  //   width: 80,
  // };
  const actionColumn = {
    headerName: "",
    type: "actions",
    width: 30,
    getActions: ({ row }) => [
      // match icon
      <GridActionsCellItem
        showInMenu
        disabled={row.type === "M"}
        label={row.matched ? "Unmatch" : "Match"}
        onClick={() =>
          handleUpdateMatchStatus(
            row.matched ? "Draft" : "Matched",
            row.voucherNo
          )
        }
      />,
    ],
  };
  return (
    <div style={{ padding: 10, height: "95%" }}>
      {/* <AddNote
        open={showNoteDialog}
        hide={() => setShowNoteDialog(false)}
        form={noteAddForm}
        submitHandler={handleAddNoteForm}
        loading={loading("addNote")}
      /> */}
      <Ledgers
        open={showRequestLedgerModal}
        hide={() => setShowRequestLedgerModal(null)}
      />
      <Filters
        show={showFilters}
        form={filterForm}
        submitFun={() => {
          handleFetchLedgerDetais();
          handleFetchManualTransactions();
        }}
        hide={hideFilters}
        loading={loading("fetchDetails")}
      />

      <ManualTransactions
        open={showTransactionModal}
        hide={() => setShowTransactionModal(false)}
        vendor={filterForm.getFieldValue("vendor")?.value}
        handleFetchManualTransactions={handleFetchManualTransactions}
        manualTransactions={manualTransactions}
        handleDelete={handleDeleteManual}
        deleteLoading={loading("deleteManual")}
      />

      <NotesModal
        open={showNoteDialog}
        hide={() => setShowNoteDialog(false)}
        form={noteAddForm}
        submitHandler={handleAddNoteForm}
        loading={loading}
        note={note}
      />

      <Row style={{ height: "100%" }} gutter={6}>
        <Col span={4} style={{ height: "100%", overflowY: "auto" }}>
          <Flex gap={6} vertical>
            <ButtonsCard
              setShowTransactionModal={setShowTransactionModal}
              setShowNoteDialog={setShowNoteDialog}
              selectedVendor={selectedVendor}
              selectedRows={selectedRows}
              setShowNotesModal={setShowNotesModal}
              handleUpdateMatchStatus={handleUpdateMatchStatus}
              toggleShowRequestLedgerModal={toggleShowRequestLedgerModal}
            />
            <VendorCard
              form={filterForm}
              setShowFilters={setShowFilters}
              vendorInput={vedorInput}
              details={details}
              manualTransactions={manualTransactions}
              manualTotal={manualTotal}
            />
            <ClosingCard
              vendorInput={vedorInput}
              setVendorInput={setVendorInput}
              details={details}
            />
            <OpeningCard
              vendorInput={vedorInput}
              setVendorInput={setVendorInput}
              details={details}
            />

            <ReconcilationCard
              manualTotal={manualTotal}
              details={details}
              vendorInput={vedorInput}
            />
          </Flex>
        </Col>
        <Col span={20}>
          <MyDataTable
            checkboxSelection
            onSelectionModelChange={(newSelectionModel) => {
              setSelectedRows(newSelectionModel);
            }}
            rows={rows}
            columns={[actionColumn, ...columns]}
            loading={loading("fetchManualTrans") || loading("updateStatus")}
          />
        </Col>
      </Row>
    </div>
  );
};

export default VendorReconcilation;

const Filters = ({
  form,
  show,
  hide,
  submitFun,
  loading,
  manualTransactions,
  vcode,
  daterange,
}) => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const { executeFun, loading: fetchLoading } = useApi();
  const dateValue = Form.useWatch("date", form);
  const handleFetchVendorOptiions = async (search) => {
    // if (vcode) {
    // }
    const response = await executeFun(
      () => getVendorOptions(search),
      "vendorSelect"
    );
    let arr = [];
    if (response.success) {
      arr = convertSelectOptions(response.data);
    }

    setAsyncOptions(arr);
  };

  return (
    <Modal
      open={show}
      size="small"
      title="Reconcilation Filters"
      width={350}
      onCancel={hide}
      onOk={submitFun}
      okText="Fetch"
      confirmLoading={loading}
    >
      <Row>
        <Col span={24}>
          <Form initialValues={initialValues} form={form} layout="vertical">
            <Form.Item name="vendor" label="Vendor" rules={filterRule.vendor}>
              <MyAsyncSelect
                labelInValue={true}
                optionsState={asyncOptions}
                loadOptions={handleFetchVendorOptiions}
                selectLoading={fetchLoading("vendorSelect")}
                onBlur={() => setAsyncOptions([])}
                defaultValue={vcode}
              />
            </Form.Item>

            <Form.Item name="date" label="Time Period" rules={filterRule.date}>
              <MyDatePicker
                setDateRange={(value) => form.setFieldValue("date", value)}
                // defaultValue={daterange}

                // format="YYYY-MM-DD"
              />
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Modal>
  );
};

const VendorCard = ({
  form,
  setShowFilters,
  vendorInput,
  details,
  manualTransactions,
  manualTotal,
}) => {
  const vendor = form.getFieldValue("vendor");
  const date = form.getFieldValue("date");
  const { user } = useSelector((state) => state.login);

  const vendorDetailsClosing = +Number(
    details?.closing?.replaceAll(",", "")
  ).toFixed(2);
  const vendorInputClosing = +Number(
    vendorInput?.closing?.replaceAll(",", "")
  ).toFixed(2);
  const manualTotalSum =
    manualTotal.creditIms -
    manualTotal.debitIms +
    manualTotal.creditVendor -
    manualTotal.debitVendor;

  const vendorManualTotal = manualTotal.creditVendor - manualTotal.debitVendor;
  const imsManualTotal = manualTotal.creditIms - manualTotal.debitIms;

  const closingDiff = vendorDetailsClosing - vendorInputClosing;
  const netClosingBalance = closingDiff - manualTotalSum;

  const manualArr = manualTransactions.map((row) => ({
    type:
      row.type === "debit"
        ? "Less" + "/" + row.impact
        : "Add" + "/" + row.impact,
    particulars: row.description,
    amount: row.amount,
  }));

  const vendorManualArr = manualTransactions
    .filter((row) => row.impact === "vendor")
    .map((row) => ({
      type: row.type === "debit" ? "Less" : "Add",
      particulars: row.description,
      amount: row.amount,
    }));
  const imsManualArr = manualTransactions
    .filter((row) => row.impact === "ims")
    .map((row) => ({
      type: row.type === "debit" ? "Less" : "Add",
      particulars: row.description,
      amount: row.amount,
    }));

  const adjustedRiotBalance = vendorDetailsClosing + imsManualTotal;
  const adjustedVendorBalance = vendorInputClosing + vendorManualTotal;
  const arr1 = [
    {
      type: vendorDetailsClosing > 0 ? "Dr Closing" : "Cr Closing",
      particulars: "Balance as per Oakter (Riot Labz) books",
      amount: vendorDetailsClosing,
    },
    {
      type: vendorInputClosing > 0 ? "Dr Closing" : "Cr Closing",
      particulars: `Balance as per ${vendor?.label} books`,
      amount: vendorInputClosing,
    },
    {
      type: "",
      particulars: "Difference",
      amount: vendorDetailsClosing - vendorInputClosing,
    },
    {
      type: "",
      particulars: "",
      amount: "",
    },
    {
      type: "Pending Entries",
      particulars: "Balance of Riot Labz as on",
      amount: details.closing,
    },
    {
      type: "IMS Manual Entries",
      particulars: "",
      amount: "",
    },
    ...imsManualArr,
    {
      type: "",
      particulars: "IMS Manual Total",
      amount: imsManualTotal,
    },
    {
      type: "",
      particulars: "Riot adjusted Balance",
      amount: adjustedRiotBalance,
    },
    {
      type: "",
      particulars: "",
      amount: "",
    },
    {
      type: "",
      particulars: "Balance of Vendor as on",
      amount: vendorInputClosing,
    },
    {
      type: "Vendor Manual Entries",
      particulars: "",
      amount: "",
    },
    ...vendorManualArr,
    {
      type: "",
      particulars: "Vendor Manual Total",
      amount: vendorManualTotal,
    },
    {
      type: "",
      particulars: "Vendor Adjusted Balane",
      amount: adjustedVendorBalance,
    },
    {
      type: "",
      particulars: "",
      amount: "",
    },

    {
      type: "",
      particulars: "Balance of Riot Labz Books after entries adjustments",
      amount: "",
    },
    {
      type: "",
      particulars: "Net Difference",
      amount: netClosingBalance,
    },
  ];

  const handleDownloadExcel = () => {
    const obj = {
      vendor: vendor?.label,
      date: "",
      preparedBy: user?.userName,
      fileName: vendor?.value,
      period: "1 April 23- 9 April 23",
      arr1: arr1,
    };
    handleDownload(obj);
  };

  return (
    <Card size="small">
      <Row>
        <Col span={24}>
          <Row>
            <Col span={24}>
              <Row justify="space-between">
                <Col>
                  <Typography.Text strong style={{ fontSize: 14 }}>
                    Vendor:
                  </Typography.Text>
                </Col>

                <Col>
                  <Row gutter={4}>
                    <Col>
                      <Button
                        onClick={() => setShowFilters(true)}
                        type="primary"
                        size="small"
                      >
                        Change
                      </Button>
                    </Col>

                    <Col>
                      <CommonIcons
                        onClick={handleDownloadExcel}
                        action="downloadButton"
                        size={"small"}
                      />
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Typography.Text style={{ fontSize: 12 }}>
                {vendor?.label}
              </Typography.Text>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Typography.Text strong style={{ fontSize: 14 }}>
                Time Period:
              </Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text style={{ fontSize: 12 }}>{date}</Typography.Text>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

const OpeningCard = ({ vendorInput, setVendorInput, details }) => {
  const openingBalance =
    details.opening && details.opening !== "NAN" ? details.opening : "--";

  const diff =
    +Number(details?.opening?.replaceAll(",", "")).toFixed(2) -
    +Number(vendorInput.opening).toFixed(2);

  const transType =
    openingBalance && +Number(openingBalance).toFixed(2) < 0 ? "Dr" : "Cr";

  const difTransType = diff && +Number(diff).toFixed(2) > 0 ? "Dr" : "Cr";
  return (
    <Card size="small">
      <Row gutter={[0, 4]}>
        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text style={{ fontSize: 14 }} strong>
                Opening Balance as per Riot
              </Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text style={{ fontSize: 14 }}>
                {openingBalance} -/
                <span style={{ marginLeft: 20 }}>{transType}</span>
              </Typography.Text>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Typography.Text style={{ fontSize: 12 }}>
            Opening Balance as per Vendor
          </Typography.Text>
        </Col>
        <Col span={24}>
          <Row gutter={[0, 6]}>
            <Col span={24}>
              <Input
                value={vendorInput.opening}
                onChange={(e) =>
                  setVendorInput((curr) => ({
                    ...curr,
                    opening: e.target.value,
                  }))
                }
              />
            </Col>
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Typography.Text style={{ fontSize: 14 }} strong>
                    Difference
                  </Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {diff && diff.toFixed(2) !== "NAN" ? diff : "--"} -/
                    <span style={{ marginLeft: 20 }}>{difTransType}</span>
                  </Typography.Text>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

const ClosingCard = ({ vendorInput, setVendorInput, details }) => {
  const transType =
    details.closing && +Number(details.closing).toFixed(2) < 0 ? "Dr" : "Cr";
  const diff =
    +Number(vendorInput.closing).toFixed(2) -
    +Number(details?.closing?.replaceAll(",", "")).toFixed(2);

  const difTransType = +Number(diff).toFixed(2) > 0 ? "Dr" : "Cr";
  return (
    <Card size="small">
      <Row gutter={[0, 4]}>
        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text style={{ fontSize: 14 }} strong>
                Closing Balance as per Riot
              </Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text style={{ fontSize: 14 }}>
                {details.closing && details.closing !== "NAN"
                  ? details.closing
                  : "--"}
                {"  "}
                -/
                <span style={{ marginLeft: 20 }}>{transType}</span>
              </Typography.Text>
            </Col>
          </Row>
        </Col>
        <Col span={24}>
          <Typography.Text style={{ fontSize: 12 }}>
            Closing Balance as per Vendor
          </Typography.Text>
        </Col>
        <Col span={24}>
          <Row gutter={[0, 6]}>
            <Col span={24}>
              <Input
                value={vendorInput.closing}
                onChange={(e) =>
                  setVendorInput((curr) => ({
                    ...curr,
                    closing: e.target.value,
                  }))
                }
              />
            </Col>
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Typography.Text style={{ fontSize: 14 }} strong>
                    Difference
                  </Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {diff && diff !== "NAN" ? diff.toFixed(2) : "--"} -/
                    <span style={{ marginLeft: 20 }}>{difTransType}</span>
                  </Typography.Text>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

const ReconcilationCard = ({ manualTotal, details, vendorInput }) => {
  const riotClosing = +Number(details?.closing?.replaceAll(",", "")).toFixed(2);

  const vendorClosing = +Number(
    vendorInput?.closing?.replaceAll(",", "")
  ).toFixed(2);

  const closingDiff = riotClosing - vendorClosing;
  const manualTotalSum =
    manualTotal.creditIms -
    manualTotal.debitIms +
    manualTotal.creditVendor -
    manualTotal.debitVendor;
  const netClosingBalance = closingDiff - manualTotalSum;
  return (
    <Card size="small">
      <Row gutter={[0, 4]}>
        <Col span={24}>
          <Row>
            <Col span={24}>
              <Typography.Text style={{ fontSize: 14 }} strong>
                Riot Adjusted Balance
              </Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text style={{ fontSize: 14 }}>
                {manualTotal.creditIms - manualTotal.debitIms + riotClosing}
              </Typography.Text>
            </Col>
          </Row>
        </Col>
        <Row gutter={[0, 4]}>
          <Col span={24}>
            <Row>
              <Col span={24}>
                <Typography.Text style={{ fontSize: 14 }} strong>
                  Vendor Adjusted Balance
                </Typography.Text>
              </Col>
              <Col span={24}>
                <Typography.Text style={{ fontSize: 14 }}>
                  {(
                    manualTotal.creditVendor -
                    manualTotal.debitVendor +
                    vendorClosing
                  ).toFixed(2)}
                </Typography.Text>
              </Col>
            </Row>
          </Col>
        </Row>
        <Col span={24}>
          <Row gutter={[0, 6]}>
            <Col span={24}>
              <Row>
                <Col span={24}>
                  <Typography.Text style={{ fontSize: 14 }} strong>
                    Net Closing Balance :
                  </Typography.Text>
                </Col>
                <Col span={24}>
                  <Typography.Text style={{ fontSize: 14 }}>
                    {netClosingBalance && netClosingBalance !== "NAN"
                      ? netClosingBalance.toFixed(2)
                      : "--"}
                  </Typography.Text>
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

const ButtonsCard = ({
  setShowTransactionModal,
  setShowNoteDialog,
  selectedVendor,
  setShowNotesModal,
  selectedRows,
  handleUpdateMatchStatus,
  toggleShowRequestLedgerModal,
}) => {
  return (
    <Card size="small">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Button
          type="primary"
          disabled={selectedRows.length === 0}
          onClick={() => handleUpdateMatchStatus(statusOption.match)}
        >
          Match Selected
        </Button>
        <Button
          type="primary"
          disabled={selectedRows.length === 0}
          onClick={() => handleUpdateMatchStatus(statusOption.unmatch)}
        >
          Un-Match Selected
        </Button>
        <Button
          disabled={!selectedVendor}
          onClick={() => setShowTransactionModal(true)}
        >
          Manual Transactions
        </Button>
        <Button
          disabled={!selectedVendor}
          onClick={() => setShowNoteDialog(true)}
        >
          Notes
        </Button>
        <Button
          disabled={!selectedVendor}
          onClick={toggleShowRequestLedgerModal}
        >
          Ledgers
        </Button>
      </div>
    </Card>
  );
};

const NotesModal = ({
  open,
  hide,
  note,
  form,
  initialValues,
  loading,
  submitHandler,
}) => {
  const [searchString, setSearchString] = useState("");
  return (
    <Modal
      open={open}
      onCancel={hide}
      title="Reconcillation Notes"
      footer={<div></div>}
    >
      <Row gutter={[0, 6]}>
        <Col span={24}>
          <Form form={form} layout="vertical" initialValues={initialValues}>
            <Form.Item label="Note" name="note">
              <Input.TextArea rows={4} />
            </Form.Item>

            <Row justify="end">
              <Button
                type="primary"
                loading={loading("addNote")}
                onClick={submitHandler}
              >
                Save
              </Button>
            </Row>
          </Form>
        </Col>
        <Col span={24}>
          <div>{loading("fetchNotes") && <Loading />}</div>
        </Col>
        <Col span={24}>
          <Flex justify="space-between" align="center">
            <div style={{ wordWrap: "nowrap" }}>
              <Typography.Text strong>Previous Notes</Typography.Text>
            </div>
            <div style={{ width: "60%" }}>
              <Input
                // size="small"
                placeholder="Search Notes"
                value={searchString}
                onChange={(e) => setSearchString(e.target.value)}
              />
            </div>
          </Flex>
        </Col>
        <Col span={24}>
          <Row
            style={{ maxHeight: 400, overflowY: "auto", overflowX: "hidden" }}
          >
            {note
              .filter(
                (row) =>
                  row.date.includes(searchString) ||
                  row.note.includes(searchString)
              )
              .map((note) => (
                <Col span={24}>
                  <Row gutter={6}>
                    <Col span={24}>
                      <b>{note.date}</b>
                    </Col>
                  </Row>
                  <Col span={24}>
                    <Typography.Text>{note.note}</Typography.Text>
                  </Col>
                  <Divider />
                </Col>
              ))}
          </Row>
        </Col>

        {!note.length === 0 && (
          <Col span={24} style={{ padding: 20 }}>
            <Typography.Text strong>No notes found...</Typography.Text>
          </Col>
        )}
      </Row>
    </Modal>
  );
};

const columns = [
  {
    headerName: "#",
    field: "id",
    width: 30,
  },
  {
    headerName: "Ref. Date",
    field: "refDate",
    width: 100,
    renderCell: ({ row }) => <ToolTipEllipses text={row.refDate} />,
  },
  {
    headerName: "Invoice No.",
    field: "invoiceNumber",
    width: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceNumber} />,
  },
  {
    headerName: "Invoice Date",
    field: "invoiceDate",
    width: 100,
    renderCell: ({ row }) => <ToolTipEllipses text={row.invoiceDate} />,
  },
  {
    headerName: "Reference",
    field: "reference",
    minWidth: 120,
    flex: 1,
    renderCell: ({ row }) => <ToolTipEllipses text={row.reference} />,
  },
  {
    headerName: "Type",
    field: "type",
    width: 50,
    renderCell: ({ row }) => <ToolTipEllipses text={row.type} />,
  },
  {
    headerName: "Voucher No.",
    field: "voucherNo",
    width: 150,
    renderCell: ({ row }) => <ToolTipEllipses text={row.voucherNo} />,
  },
  {
    headerName: "Status",
    field: "status",
    width: 60,
    renderCell: ({ row }) => <ToolTipEllipses text={row.status} />,
  },
  {
    headerName: "Debit",
    field: "debit",
    width: 100,
    renderCell: ({ row }) => <ToolTipEllipses text={row.debit} />,
  },
  {
    headerName: "Credit",
    field: "credit",
    width: 100,
    renderCell: ({ row }) => <ToolTipEllipses text={row.credit} />,
  },
  {
    headerName: "Matched?",
    field: "matched",
    renderCell: ({ row }) =>
      row.matched ? (
        <CheckCircleOutlined style={{ color: "green" }} />
      ) : (
        <CloseCircleOutlined style={{ color: "red" }} />
      ),
    width: 80,
  },
];

const filterRule = {
  vendor: [
    {
      required: true,
      message: "Please select a vendor",
    },
  ],
  date: [
    {
      required: true,
      message: "Please select the time period",
    },
  ],
};

const handleDownload = (payload) => {
  const columns = ["", "Particlular", "Amount"];

  const rows = [
    {
      type: "DR",
      particular: "Test particular 1",
      amount: "10000",
      remarks: "test remarks here",
    },
    {
      type: "CR",
      particular: "Test particular 2",
      amount: "4660",
      remarks: "test remarks here",
    },
    {
      type: "DR",
      particular: "Test particular 3",
      amount: "100",
      remarks: "test remarks here",
    },
    {
      type: "DR",
      particular: "Test particular 4",
      amount: "100",
      remarks: "test remarks here",
    },
  ];
  const wb = xlsx.utils.book_new();
  wb.Props = {
    Title: "New Sheet",
  };
  wb.SheetNames.push(payload.fileName);

  const data = [
    {
      A: "",
      B: "Reconciliation  of Books of Accounts",
      C: "",
    },
  ];
  const ws = xlsx.utils.json_to_sheet(data, {
    skipHeader: true,
    header: ["A"],
  });

  // party details
  xlsx.utils.sheet_add_json(
    ws,
    [
      {
        A2: "Party Name",
        B2: payload.vendor,
        C2: "Prepared By",
        D2: payload.preparedBy,
      },
    ],
    {
      skipHeader: true,
      origin: "A2",
    }
  );
  // Date details
  xlsx.utils.sheet_add_json(
    ws,
    [
      {
        A3: "Date",
        B3: payload.date,
        C3: "",
        D3: "",
      },
    ],
    {
      skipHeader: true,
      origin: "A3",
    }
  );
  // perios details
  xlsx.utils.sheet_add_json(
    ws,
    [
      {
        A5: "Periods",
        B5: payload.date,
      },
    ],
    {
      skipHeader: true,
      origin: "A5",
    }
  );

  xlsx.utils.sheet_add_json(
    ws,
    [
      {
        A6: "",
        B6: "Particulars",
        C6: "Amount",
        D6: "",
      },
    ],
    {
      skipHeader: true,
      origin: "A6",
    }
  );

  xlsx.utils.sheet_add_json(
    ws,
    payload.arr1,
    // [
    //   {
    //     A6: "",
    //     B6: "Particulars",
    //     C6: "Amount",
    //     D6: "",
    //   },
    // ],
    {
      skipHeader: true,
      origin: "A7",
    }
  );

  wb.Sheets[payload.fileName] = ws;

  const outFile = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

  downloadExcel(outFile, payload.fileName + " Reconcillation");
};
