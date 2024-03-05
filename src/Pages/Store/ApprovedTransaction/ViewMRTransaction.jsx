import { useState, useEffect } from "react";
import { Col, Row, Table, Typography } from "antd";
import validateResponse from "../../../Components/validateResponse";
import ToolTipEllipses from "../../../Components/ToolTipEllipses";
import { v4 } from "uuid";
import { imsAxios } from "../../../axiosInterceptor";
import Loading from "../../../Components/Loading";

export default function ViewMRTransaction({ viewTransaction }) {
  const [details, setDetails] = useState([]);
  const [pageLoading, setPageLoading] = useState(false);
  const getDetails = async () => {
    setPageLoading(true);
    setDetails([]);
    const { data } = await imsAxios.post(
      "/transaction/fetchAllComponentStatus",
      {
        transactionid: viewTransaction,
      }
    );
    setPageLoading(false);
    const validatedData = validateResponse(data);
    let arr = validatedData.data.map((row, index) => ({
      ...row,
      index: index + 1,
      key: v4(),
    }));
    setDetails(arr);
  };
  const nestedDetails = (record) => {
    return (
      <Row style={{ width: "100%" }}>
        <Col span={24}>
          <Row style={{ width: "100%" }}>
            <Col span={6}>
              <Typography.Title style={{ fontSize: "0.8rem" }} level={5}>
                Transaction Id :
              </Typography.Title>
            </Col>
            <Col span={18}>{record.approve_txn_id}</Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row style={{ width: "100%" }}>
            <Col span={6}>
              <Typography.Title style={{ fontSize: "0.8rem" }} level={5}>
                Cancel Remark :
              </Typography.Title>
            </Col>
            <Col span={18}>{record.remark_cancel}</Col>
          </Row>
        </Col>
        <Col span={24}>
          <Row style={{ width: "100%" }}>
            <Col span={6}>
              <Typography.Title style={{ fontSize: "0.8rem" }} level={5}>
                Issue Remark :
              </Typography.Title>
            </Col>
            <Col span={18}>{record.remark_issue}</Col>
          </Row>
        </Col>
      </Row>
    );
  };
  const columns = [
    { title: "#", width: 40, key: "index", dataIndex: "index" },
    {
      title: "Component",
      flex: 1,
      key: "components",
      render: (_, row) => <ToolTipEllipses text={row.components} />,
    },
    {
      title: "Part",
      width: 100,
      key: "partcode",
      render: (_, row) => <ToolTipEllipses text={row.partcode} copy={true} />,
    },
    {
      title: "Req. / Appr. Qty",
      width: 100,
      key: "executeqty",
      render: (_, row) => (
        <ToolTipEllipses text={`${row.reqqty} / ${row.executeqty}`} />
      ),
    },
    {
      title: "Status",
      width: 100,
      key: "status",
      dataIndex: "status",
    },
  ];
  useEffect(() => {
    if (viewTransaction) {
      getDetails();
    }
  }, [viewTransaction]);
  return (
    <div style={{ height: "100%" }}>
      {pageLoading && <Loading />}
      <Table
        bordered={true}
        columns={columns}
        showSorterTooltip={false}
        expandable={{
          expandedRowRender: (record) => nestedDetails(record),
          rowExpandable: (record) => record.name !== "Not Expandable",
        }}
        scroll={{ y: "70vh" }}
        dataSource={details}
        pagination={false}
        size="small"
      />
    </div>
  );
}
