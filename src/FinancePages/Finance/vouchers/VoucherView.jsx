import React, { useState, useEffect } from "react";
import MyDataTable from "../../../Components/MyDataTable";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { Button, Col, Drawer, Row, Space, Tooltip } from "antd";
import { PrinterFilled, DownloadOutlined } from "@ant-design/icons";
import { v4 } from "uuid";
import { imsAxios } from "../../../axiosInterceptor";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import Loading from "../../../Components/Loading";
import { useLocation } from "react-router-dom";

export default function VoucherView({ detailVoucherId, setDetailVoucherId }) {
  const [voucherDate, setVoucherDate] = useState("");
  const [printLoading, setPrintLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [voucherRows, setVoucherRows] = useState([]);
  const [voucherType, setVoucherType] = useState("");
  const { pathname } = useLocation();

  const columns = [
    {
      headerName: "Particular",
      field: "particular",
      renderCell: ({ row }) => <ToolTipEllipses text={row.particular} />,
      flex: 1,
      sortable: false,
    },
    {
      headerName: "Payment",
      // renderCell: ({ row }) =>
      //   row.which_module == "BP" ? (
      //     <span>{row.debit}</span>
      //   ) : (
      //     <span>{row.credit}</span>
      //   ),

      field: "payment",
      flex: 1,
      sortable: false,
    },

    {
      headerName: "Comment",
      //   width: "12.5vw",
      flex: 1,
      field: "comment",
      renderCell: ({ row }) => (
        <Tooltip title={row.comment}>{row.comment}</Tooltip>
      ),
      sortable: false,
    },
  ];
  const getJVDetail = async () => {
    if (detailVoucherId) {
      let link = "";
      if (pathname.includes("payment")) {
        link = "/tally/voucher/bank_payment_report";
      } else if (pathname.includes("receipt")) {
        link = "/tally/voucher/bank_recipt_report";
      }

      setLoading(true);
      const { data } = await imsAxios.post(link, {
        v_code: detailVoucherId,
      });
      setLoading(false);
      if (data.code == 200) {
        setVoucherDate(data.data[0].insert_date);

        const arr = data.data.map((row) => {
          return {
            ...row,
            id: v4(),
          };
        });
        setVoucherRows(arr);
        setVoucherType(data.data[0].which_module);
      }
    }
  };
  const downloadFun = async () => {
    let link = "";
    let filename = "";
    setDownloadLoading(true);
    if (voucherType == "BP") {
      link = "/tally/voucher/bp_print";
      filename = `Bank Payment ${detailVoucherId}`;
    } else if (voucherType == "BR") {
      link = "tally/voucher/br_print";
      filename = `Bank Receipt ${detailVoucherId}`;
    }
    const { data } = await imsAxios.post(link, {
      v_code: detailVoucherId,
    });
    setDownloadLoading(false);
    downloadFunction(data.buffer.data, filename);
  };
  const printFun = async () => {
    let link = "";
    setPrintLoading(true);
    if (voucherType == "BP") {
      link = "/tally/voucher/bp_print";
    } else if (voucherType == "BR") {
      link = "tally/voucher/br_print";
    }
    const { data } = await imsAxios.post(link, {
      v_code: detailVoucherId,
    });
    setPrintLoading(false);
    printFunction(data.buffer.data);
  };
  const DescriptionItem = ({ title, content }) => (
    <div className="site-description-item-profile-wrapper">
      <p className="site-description-item-profile-p-label">{title}</p>
      {content}
    </div>
  );
  useEffect(() => {
    getJVDetail();
  }, [detailVoucherId]);
  return (
    <>
      <Drawer
        title={`Bank ${
          voucherRows[0]?.which_module == "BP" ? "Payment" : "Receipt"
        } Voucher:  ${detailVoucherId}`}
        width="50vw"
        height="100vh"
        onClose={() => setDetailVoucherId(null)}
        open={detailVoucherId}
        extra={
          <Space>
            <Button
              type="primary"
              shape="circle"
              loading={printLoading}
              icon={<PrinterFilled />}
              onClick={printFun}
            />
            <Button
              type="primary"
              shape="circle"
              loading={downloadLoading}
              icon={<DownloadOutlined />}
              onClick={downloadFun}
            />
          </Space>
        }
      >
        {loading && <Loading />}
        <Row>
          <Col span={12}>
            <DescriptionItem title="Created Date" content={voucherDate} />
          </Col>
          <Col
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
            span={12}
          >
            <DescriptionItem
              title={
                <>
                  <span style={{ fontWeight: 500 }}>Voucher Type:</span>{" "}
                  <span>{voucherRows[0]?.which_module}</span>
                </>
              }
            />

            <DescriptionItem
              title={
                <>
                  <span style={{ fontWeight: 500 }}>Account:</span>{" "}
                  <span>{voucherRows[0]?.account_name}</span>
                </>
              }
            />
          </Col>
        </Row>
        <Row>
          <Col>
            <DescriptionItem
              title="Effective Date"
              content={voucherRows[0]?.ref_date}
            />
          </Col>
        </Row>
        <div
          className="remove-table-footer"
          style={{ height: "75%", paddingTop: "10px" }}
        >
          <MyDataTable data={voucherRows} columns={columns} />
        </div>
      </Drawer>
    </>
  );
}
