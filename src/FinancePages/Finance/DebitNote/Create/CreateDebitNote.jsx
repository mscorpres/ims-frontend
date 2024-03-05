import { useEffect, useState } from "react";
import { Form, Row, Col } from "antd";
import HeaderDetails from "../HeaderDetails";
import Components from "../Components";
import { useLocation } from "react-router-dom";
import { imsAxios } from "../../../../axiosInterceptor";
import { toast } from "react-toastify";

export const CreateDebitNote = () => {
  const location = useLocation();
  const [allTdsOptions, setAllTdsOptions] = useState([]);
  const [tdsArray, setTdsArray] = useState([]);
  const [minID, setMinId] = useState("");
  const [addRateDiff, setAddRateDiff] = useState("");

  const [debitNoteForm] = Form.useForm();

  const getTDSData = async () => {
    const response = await imsAxios.get("/tally/tds/nature_of_tds");
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        let arr = data.data;

        return arr;
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const getTdsOptions = async (minId) => {
    const response = await imsAxios.post("/tally/vbt01/fetch_minData", {
      min_id: minId,
    });
    const { data } = response;
    data.data[0].ven_tds.push({
      ladger_name: "--",
      ledger_key: "--",
      tds_code: "--",
      tds_key: "--",
      tds_name: "--",
      tds_gl_code: "--",
      tds_percent: "0",
    });
    // console.log("data===========", data.data[0].ven_tds[0]);
    if (data.code === 200) {
      let arr = data.data;
      setAllTdsOptions(arr[0].ven_tds);

      let tdsC = arr[0].ven_tds.map((r) => {
        return {
          text: r.tds_name,
          value: r.tds_key,
        };
      });
      setTdsArray(tdsC);
    } else {
      toast.error(data.message.msg);
    }
  };
  const getDetails = async (vbtCodes) => {
    // setLoading("fetch");
    const response = await imsAxios.post("/tally/vbt01/vbt_edit", {
      vbt_code: vbtCodes,
    });
    // setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        const tdsOptions = await getTDSData();
        let tdsPerc = tdsOptions.filter(
          (tds) => tds.tds_key === data.data[0].tds_code
        )[0]?.percentage;
        const tdsPercentage = +Number(tdsPerc).toFixed(2);

        let arr = data.data.map((row) => {
          const value = +Number(
            +Number(row.inrate).toFixed(3) * +Number(row.vbt_qty).toFixed(3)
          ).toFixed(3);
          return {
            minId: row.min_id,
            invoiceDate: row.invoice_date,
            invoiceNo: row.invoice_no,
            partCode: row.item_code,
            component: row.item_name,
            billingQty: row.vbt_qty,
            qty: "",
            rate: row.inrate,
            value,
            freight: 0,
            freightGl: "",
            editable_qty: row.pending_qty ?? 0,
            freight_gl: "",
            gstAssValue: row.gst_ass_value,
            glName: row.gl_name,
            gstRate: row.gst_rate,
            ...row,
          };
        });
        setMinId(arr?.minI);
        // getTdsOptions(arr?.minId);

        // setRows(arr);
        // let summaryDetailsArr = [
        //     { title: "Vendor", description: data.data[0].ven_name },
        //     { title: "Vendor GSTIN", description: data.data[0].gstin },
        //     {
        //       title: "Vendor Address",
        //       description: data.data[0].ven_address.replaceAll("<br>", "\n"),
        //     },
        //   ];
        // setSummaryDetails(summaryDetailsArr);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  useEffect(() => {
    if (minID) {
      getTdsOptions(minID);
    }
  }, [minID]);

  useEffect(() => {
    if (location.state) {
      getDetails(location.state.vbtCodes);
    }
  }, [location.state]);
  return (
    <div style={{ flex: 1 }}>
      <Form form={debitNoteForm} style={{ flex: 1 }}>
        <Row gutter={6} style={{ flex: 1 }}>
          <Col span={4}>
            <HeaderDetails
              addRateDiff={addRateDiff}
              setAddRateDiff={setAddRateDiff}
            />
          </Col>
          <Col span={20}>
            <Components
              addRateDiff={addRateDiff}
              setAddRateDiff={setAddRateDiff}
              allTdsOptions={allTdsOptions}
              tdsArray={tdsArray}
            />
          </Col>
        </Row>
      </Form>
    </div>
  );
};
