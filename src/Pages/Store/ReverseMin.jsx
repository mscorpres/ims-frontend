import React, { useMemo, useState } from "react";
import { Button, Col, Popover, Row } from "antd";
import MyAsyncSelect from "../../Components/MyAsyncSelect";
import { toast } from "react-toastify";
import { v4 } from "uuid";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { InfoCircleFilled } from "@ant-design/icons";
import MinReverseModal from "./Modal/MinReverseModal";
import { imsAxios } from "../../axiosInterceptor";
import MyButton from "../../Components/MyButton";
import EmptyRowsFallback from "../../new/components/reuseable/EmptyRowsFallback";
import { Box, LinearProgress } from "@mui/material";
import { getRevMinColumns } from "./mincolums";

function ReverseMin() {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [reverseModal, setReverseModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputStore, setInputStore] = useState("");
  const [mainData, setMainData] = useState([]);
  const [headerData, setHeaderData] = useState([]);

  const getOption = async (e) => {
    if (e?.length > 2) {
      const { data } = await imsAxios.post("/backend/getMinTransactionByNo", {
        search: e,
      });
      let arr = [];
      arr = data.map((d) => {
        return { text: d.text, value: d.id };
      });
      setAsyncOptions(arr);
    }
  };

  const fetchInputData = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/reversal/fetchMINData", {
      transaction: inputStore,
    });
    if (data.code == 200) {
      let arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setMainData(arr);
      setHeaderData(data.header);
      setLoading(false);
    } else if (data.code == 500) {
      toast.error(data.message.msg);
      setLoading(false);
    }
  };

  const resetFun = () => {
    setMainData([]);
  };

  const content = (
    <div style={{ padding: "15px" }}>
      <div>
        <span>Name:</span>
        <span
          style={{ fontSize: "13px", fontWeight: "bolder", marginLeft: "5px" }}
        >
          {headerData.insert_by}
        </span>
      </div>
      <div>
        <span>Email:</span>
        <span
          style={{ fontSize: "13px", fontWeight: "bolder", marginLeft: "5px" }}
        >
          {headerData.insert_by_useremail}
        </span>
      </div>
      <div>
        <span>Contact:</span>
        <span
          style={{ fontSize: "13px", fontWeight: "bolder", marginLeft: "5px" }}
        >
          {headerData.insert_by_usermobile}
        </span>
      </div>
    </div>
  );

  const columns = useMemo(() => getRevMinColumns(), []);
  const table = useMaterialReactTable({
    columns: columns,
    data: mainData || [],
    enableDensityToggle: false,
    initialState: {
      density: "compact",
      pagination: { pageSize: 100, pageIndex: 0 },
    },
    positionActionsColumn: "last",
    enableStickyHeader: true,

    muiTableContainerProps: {
      sx: {
        height: loading ? "calc(100vh - 238px)" : "calc(100vh - 290px)",
      },
    },
    renderEmptyRowsFallback: () => (
      <EmptyRowsFallback message="No Product Found" />
    ),

    renderTopToolbar: () =>
      loading ? (
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#0d9488",
              },
              backgroundColor: "#e1fffc",
            }}
          />
        </Box>
      ) : null,
  });

  return (
    <div style={{ marginTop: 12 }}>
      <Row gutter={10} style={{ margin: "5px" }}>
        <Col span={5}>
          <MyAsyncSelect
            style={{ width: "100%" }}
            onBlur={() => setAsyncOptions([])}
            loadOptions={getOption}
            value={inputStore}
            optionsState={asyncOptions}
            onChange={(a) => setInputStore(a)}
            placeholder="MIN / TXN ID"
          />
        </Col>
        <Col span={2}>
          <MyButton
            type="primary"
            loading={loading}
            onClick={fetchInputData}
            variant="search"
          >
            Fetch
          </MyButton>
        </Col>
        {mainData?.length > 0 && (
          <Col span={2} offset={15}>
            <Popover
              placement="leftTop"
              title="Information"
              content={content}
              trigger="click"
            >
              <Button>
                <InfoCircleFilled style={{ fontSize: "15px" }} />
              </Button>
            </Popover>
          </Col>
        )}
      </Row>

      <div style={{ height: "calc(100vh - 180px)", margin: 10 }}>
        <MaterialReactTable table={table} />
      </div>

      {mainData?.length > 0 && (
        <Row gutter={10} style={{ margin: "5px", marginTop: "20px" }}>
          <Col span={24}>
            <div style={{ textAlign: "end" }}>
              <Button
                onClick={resetFun}
                style={{
                  marginRight: "5px",
                  backgroundColor: "red",
                  color: "white",
                }}
              >
                Reset
              </Button>
              {/* <Button> */}
              <Button type="primary" onClick={() => setReverseModal(true)}>
                Reverse
              </Button>
            </div>
          </Col>
        </Row>
      )}

      <MinReverseModal
        inputStore={inputStore}
        reverseModal={reverseModal}
        setReverseModal={setReverseModal}
        mainData={mainData}
      />
    </div>
  );
}

export default ReverseMin;
