const bankColumns = [
  // {
  //   headerName: "Action",
  //   field: "action",
  //   type: "actions",
  //   getActions: ({ row }) => [
  //     <GridActionsCellItem
  //       icon={<EyeFilled className="view-icon" />}
  //       onClick={() => setDetailVoucherId(row.module_used)}
  //       label="Delete"
  //     />,
  //     <GridActionsCellItem
  //       icon={<PrinterFilled className="view-icon" />}
  //       onClick={() => {
  //         printFun(row.module_used);
  //       }}
  //       label="Delete"
  //     />,
  //     <GridActionsCellItem
  //       icon={<CloudDownloadOutlined className="view-icon" />}
  //       onClick={() => {
  //         handleDownload(row.module_used);
  //       }}
  //       label="Delete"
  //     />,
  //     <GridActionsCellItem
  //       disabled={row.status == "Deleted"}
  //       icon={
  //         <EditFilled
  //           className={`view-icon ${row.status == "Deleted" && "disable"}`}
  //         />
  //       }
  //       onClick={() => {
  //         setEditVoucher(row.module_used);
  //       }}
  //       label="Delete"
  //     />,
  //     <GridActionsCellItem
  //       disabled={row.status == "Deleted"}
  //       icon={
  //         <Popconfirm
  //           title="Are you sure to delete this Transaction?"
  //           onConfirm={deleteFun}
  //           onCancel={() => {
  //             setDeleteConfirm(null);
  //           }}
  //           okText="Yes"
  //           cancelText="No"
  //         >
  //           <DeleteFilled
  //             style={{ marginBottom: 10 }}
  //             className={`view-icon ${row.status == "Deleted" && "disable"}`}
  //           />{" "}
  //         </Popconfirm>
  //       }
  //       onClick={() => {
  //         setDeleteConfirm(row.module_used);
  //       }}
  //       label="Delete"
  //     />,
  //   ],
  // },

  {
    headerName: "Date",
    field: "ref_date",
  },
  {
    headerName: "Voucher ID",
    field: "module_used",
  },
  {
    headerName: "Voucher Type",
    field: "which_module",
  },
  {
    headerName: "Bank Name",
    field: "bank_name",
  },
  {
    headerName: "Bank Code",
    field: "bank_name_code",
  },
  {
    headerName: "Particular Name",
    field: "perticular",
  },
  {
    headerName: "Particular Code",
    field: "perticular_code",
  },
  {
    headerName: "Payment",
    field: "payment",
  },
  {
    headerName: "Comment",
    field: "comment",
  },

  {
    headerName: "Status",
    field: "status",
  },
];
const cashColumns = [
  // {
  //   field: "actions",
  //   headerName: "View",
  //   type: "actions",
  //   getActions: ({ row }) => [
  //     <GridActionsCellItem
  //       icon={<EyeFilled onClick={() => setOpen(row?.module_used)} />}
  //     />,
  //   ],
  // },
  { field: "ref_date", headerName: "DATE" },
  { field: "bank_name", headerName: "BANK NAME" },
  { field: "perticular", headerName: "PERTICULAR" },
  { field: "perticular_code", headerName: "BANK CODE" },
  { field: "which_module", headerName: "VOUCHER TYPE" },
  { field: "module_used", headerName: "VOUCHER ID" },
  { field: "payment", headerName: "PAYMENT" },
  { field: "comment", headerName: "COMMENT" },
  { field: "status", headerName: "STATUS" },
];
const journalColumns = [
  {
    headerName: "Date",
    field: "ref_date",
  },

  {
    headerName: "JV Code",
    field: "module_used",
  },
  {
    headerName: "Account",
    field: "account",
  },
  {
    headerName: "Account Code",
    field: "account_code",
  },
  {
    headerName: "Credit",
    field: "credit",
  },
  {
    headerName: "Debit",
    field: "debit",
  },
  {
    headerName: "Comment",
    field: "comment",
  },

  {
    headerName: "Status",
    field: "status",
  },

  // {
  //   headerName: "Action",
  //   field: "action",
  //   type: "actions",
  //   flex: 1,
  //   getActions: ({ row }) => [
  //     // view voucher
  //     <GridActionsCellItem
  //       disabled={loading}
  //       icon={<EyeFilled className="view-icon" />}
  //       onClick={() => {
  //         setViewJVDetail(row.module_used);
  //       }}
  //       label="view"
  //     />,
  //     <GridActionsCellItem
  //       // print voucher
  //       disabled={loading}
  //       icon={<PrinterFilled className="view-icon" />}
  //       onClick={() => {
  //         printFun(row.module_used);
  //       }}
  //       label="print"
  //     />,
  //     <GridActionsCellItem
  //       // download voucher
  //       disabled={loading}
  //       icon={<CloudDownloadOutlined className="view-icon" />}
  //       onClick={() => {
  //         handleDownload(row.module_used);
  //       }}
  //       label="download"
  //     />,
  //     <GridActionsCellItem
  //       // edit voucher
  //       disabled={loading}
  //       icon={<EditFilled className="view-icon" />}
  //       onClick={() => {
  //         setEditVoucher(row.module_used);
  //       }}
  //       label="download"
  //     />,
  //     <GridActionsCellItem
  //       // delete voucher
  //       style={{ marginTop: -5 }}
  //       disabled={row.status == "Deleted"}
  //       icon={
  //         <Popconfirm
  //           title="Are you sure to delete this Voucher?"
  //           onConfirm={deleteFun}
  //           onCancel={() => {
  //             setDeleteConfirm(null);
  //           }}
  //           okText="Yes"
  //           cancelText="No"
  //         >
  //           <DeleteFilled
  //             className={`view-icon ${row.status == "Deleted" && "disable"}`}
  //           />{" "}
  //         </Popconfirm>
  //       }
  //       onClick={() => {
  //         setDeleteConfirm(row.module_used);
  //       }}
  //       label="Delete"
  //     />,
  //   ],
  // },
];
const contraColumns = [
  {
    headerName: "Contra ID",
    field: "contra_number",
  },
  {
    headerName: "Created Date",
    field: "create_date",
  },
  {
    headerName: "Reference Date",
    field: "ref_date",
  },
  {
    headerName: "Amount",
    field: "ammount",
    flex: 1,
  },
  {
    headerName: "Status",
    field: "status",
  },
  // {
  //   headerName: "Action",
  //   field: "action",
  //   type: "actions",
  //   flex: 1,
  //   getActions: ({ row }) => [
  //     <GridActionsCellItem
  //       disabled={loading}
  //       icon={<BsEyeFill className="view-icon" />}
  //       onClick={() => {
  //         setContraId(row.contra_number);
  //       }}
  //       label="Delete"
  //     />,
  //     <GridActionsCellItem
  //       disabled={loading}
  //       icon={<AiFillPrinter className="view-icon" />}
  //       onClick={() => {
  //         printFun(row.contra_number);
  //       }}
  //       label="Delete"
  //     />,
  //     <GridActionsCellItem
  //       disabled={loading}
  //       icon={<BsDownload className="view-icon" />}
  //       onClick={() => {
  //         handleDownload(row.contra_number);
  //       }}
  //       label="Delete"
  //     />,
  //     <GridActionsCellItem
  //       disabled={row.status == "Deleted"}
  //       icon={
  //         <Popconfirm
  //           title="Are you sure to delete this Transaction?"
  //           onConfirm={deleteFun}
  //           onCancel={() => {
  //             setDeleteConfirm(null);
  //           }}
  //           okText="Yes"
  //           cancelText="No"
  //         >
  //           <AiFillDelete
  //             style={{ marginTop: -5 }}
  //             className={`view-icon ${row.status == "Deleted" && "disable"}`}
  //           />{" "}
  //         </Popconfirm>
  //       }
  //       onClick={() => {
  //         setDeleteConfirm(row.contra_number);
  //       }}
  //       label="Delete"
  //     />,
  //   ],
  // },
];
const vbtColumns = [
  {
    headerName: "VBT Code",
    field: "vbt_code",
  },
  {
    headerName: "MIN ID",
    field: "min_id",
  },
  {
    headerName: "VBT Status",
    field: "status",
  },
  {
    headerName: "VBT Type",
    field: "type",
  },
  {
    headerName: "Invoice No.",
    field: "invoice_no",
  },
  {
    headerName: "Vendor Name",
    field: "vendor",
  },
  {
    headerName: "Vendor Code",
    field: "ven_code",
  },
  {
    headerName: "Item Name",
    field: "part",
  },
  {
    headerName: "Part Code",
    field: "part_code",
  },
  {
    headerName: "Actual Quantity",
    field: "act_qty",
  },
  {
    headerName: "Rate",
    field: "rate",
  },
  {
    headerName: "Taxable Value",
    field: "taxable_value",
  },
  {
    headerName: "CGST",
    field: "cgst",
  },
  {
    headerName: "SGST",
    field: "sgst",
  },
  {
    headerName: "IGST",
    field: "igst",
  },
  {
    headerName: "TDS",
    field: "vbt_tds_amount",
  },
  {
    headerName: "Custom",
    field: "custum",
  },
  {
    headerName: "Freight",
    field: "freight",
  },
  {
    headerName: "Ven. Bill Amount",
    field: "ven_bill_amm",
  },
  {
    headerName: "Purchase GL",
    field: "vbt_gl",
  },
  {
    headerName: "CGST GL",
    field: "cgst_gl",
  },
  {
    headerName: "SGST GL",
    field: "sgst_gl",
  },
  {
    headerName: "IGST GL",
    field: "igst_gl",
  },
  {
    headerName: "TDS GL",
    field: "tds_gl",
  },
];

export { bankColumns, cashColumns, journalColumns, contraColumns, vbtColumns };
