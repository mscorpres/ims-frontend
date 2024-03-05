import React, { useEffect, useState } from "react";
import { v4 } from "uuid";
import { toast } from "react-toastify";
import Select from "react-select";
import { IoClose } from "react-icons/io5";
import { imsAxios } from "../../../../axiosInterceptor";
import Loading from "../../../../Components/Loading";

export default function PendingModal({
  showModal,
  setShowModal,
  loading,
  setLoading,
}) {
  const [sendData, setSenData] = useState({
    locSend: "",
    reqSend: "",
    repSend: "",

    qtySend: "",
    rejQtySend: "",
    remarkSend: "",
  });
  // console.log(sendData);
  // const [loading, setLoading] = useState(false);
  const [locationStore, setLocationStore] = useState(false);
  const [headerData, setHeaderData] = useState({});
  const [activeTab, setActiveTab] = useState("Part");
  const [tabs, setTabs] = useState([
    {
      id: v4(),
      name: "Part",
      data: [],
    },
    {
      id: v4(),
      name: "Packing",
      data: [],
    },
    {
      id: v4(),
      name: "Other",
      data: [],
    },
  ]);

  const [valueComesApi, setValueComesApi] = useState({
    actualConsumption: [],
    rejected: [],
    remark: [],
  });

  const [changeValue, setChangeValue] = useState([
    {
      actQty: "",
      rej: "",
      rem: "",
      type: "",
    },
  ]);

  const compInputHandler = async (name, value, id, type) => {
    console.log(name, value, id, type);
    let arr = tabs;
    if (name == "actQty") {
      arr = arr.map((a) => {
        //   console.log("obh => ", a);
        return {
          ...a,
          data: a.data.map((obj) => {
            if (obj.key == id) {
              //   console.log("correcti f");
              {
                return { ...obj, [name]: value };
              }
            } else {
              return obj;
            }
          }),
        };
      });
    } else if (name == "rej") {
      arr = arr.map((a) => {
        //   console.log("obh => ", a);
        return {
          ...a,
          data: a.data.map((obj) => {
            if (obj.key == id) {
              //   console.log("correcti f");
              {
                return { ...obj, [name]: value };
              }
            } else {
              return obj;
            }
          }),
        };
      });
    } else if (name == "rem") {
      arr = arr.map((a) => {
        //   console.log("obh => ", a);
        return {
          ...a,
          data: a.data.map((obj) => {
            if (obj.key == id) {
              //   console.log("correcti f");
              {
                return { ...obj, [name]: value };
              }
            } else {
              return obj;
            }
          }),
        };
      });
    }

    setTabs(arr);
    //  else if (name == "loc") {
    //    setAllDataComes((loc_to) =>
    //      loc_to.map((a) => {
    //        if (a.serial_no == id) {
    //          {
    //            return { ...a, loc: value };
    //          }
    //        } else {
    //          return a;
    //        }
    //      })
    //    );
    //  }
  };
  const customStyles = {
    rows: {
      style: {
        minHeight: "35px", // override the row height
      },
    },
    headCells: {
      style: {
        background: "#4D636F",
        color: "white",
        // minHeight: "72px"

        // fontSize: "12px",
      },
    },
    cells: {
      style: {
        fontSize: "10px",
        // minHeight: "5px",
      },
    },
  };

  const columns = [
    { name: "FG Type", selector: (row) => row.fgtype },
    { name: "Part Code", selector: (row) => row.partcode },
    { name: "Component", selector: (row) => row.component },
    { name: "UOM", selector: (row) => row.unit },
    { name: "Part Consumed", selector: (row) => row.cons_qty },
    { name: "Consume Loc", selector: (row) => row.cons_loc },
  ];

  const fetchDetailWhenClickModal = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/ppr/fetchPprComponentDetails", {
      accesstoken: showModal.prod_randomcode,
      pprrequest: showModal.prod_transaction,
      sku: showModal.prod_product_sku,
    });
    //  let arr = tabs;

    let arr = tabs;
    if (data.code == 200) {
      setHeaderData(data.data.header_data);
      arr = arr.map((tab) => {
        if (tab.name == "Part") {
          return {
            ...tab,
            data: data?.data?.comp_data?.filter((aa) => aa?.type == "P"),
          };
        } else if (tab.name == "Packing") {
          return {
            ...tab,
            data: data?.data?.comp_data?.filter((aa) => aa?.type == "PCK"),
          };
        } else if (tab.name == "Other") {
          return {
            ...tab,
            data: data?.data?.comp_data?.filter((aa) => aa?.type == "O"),
          };
        }
      });

      arr = arr.map((row) => {
        return {
          ...row,
          data: row.data.map((r) => {
            return { ...r, actQty: "", rej: "", rem: "" };
          }),
        };
      });

      // console.log(arr);
      setTabs(arr);
      setLoading(false);

      // setComponentData(data.data.comp_data);
      // // console.log(data.data);
      // toast.success(data.data.data);
      // setLoading(false);

      //  setLoading(false);
    }
  };
  const getLocation = async () => {
    const { data } = await imsAxios.get("/ppr/mfg_locations");
    const arr = [];
    data.data.map((a) => arr.push({ label: a.text, value: a.id }));
    setLocationStore(arr);
  };
  const deleteArr = (id) => {
    setActiveTab("Part");
    let arr = tabs;
    arr = arr.filter((tab) => tab.id != id);
    setTabs(arr);
  };

  const savePPR = async () => {
    let part = tabs[0];
    let packing = tabs[1];
    let other = tabs[2];

    // part
    const partPart = [];
    const parkingPart = [];
    const otherPart = [];

    // component
    const partComponent = [];
    const parkingComponent = [];
    const otherComponent = [];

    let partFinalQty = [];
    let packingFinalQty = [];
    let otherFinalQty = [];

    let partFinalRej = [];
    let packingFinalRej = [];
    let otherFinalRej = [];

    let partFinalRem = [];
    let packingFinalRem = [];
    let otherFinalRem = [];

    part.data.map((partQty) => partFinalQty.push(partQty.actQty));
    packing.data.map((parkingQty) => packingFinalQty.push(parkingQty.actQty));
    other.data.map((otherQty) => otherFinalQty.push(otherQty.actQty));

    part.data.map((partRej) => partFinalRej.push(partRej.rej));
    packing.data.map((parkingRej) => packingFinalRej.push(parkingRej.rej));
    other.data.map((otherRej) => otherFinalRej.push(otherRej.rej));

    part.data.map((partRej) => partFinalRem.push(partRej.rem));
    packing.data.map((parkingRej) => packingFinalRem.push(parkingRej.rem));
    other.data.map((otherRem) => otherFinalRem.push(otherRem.rem));

    // part.data.map
    const allQty = [...partFinalQty, ...packingFinalQty, ...otherFinalQty];
    const allRej = [...partFinalRej, ...packingFinalRej, ...otherFinalRej];
    const allRem = [...partFinalRem, ...packingFinalRem, ...otherFinalRem];

    // component
    part.data.map((a) => partComponent.push(a.key));
    packing.data.map((a) => parkingComponent.push(a.key));
    other.data.map((a) => otherComponent.push(a.key));
    const allComponent = [
      ...partComponent,
      ...parkingComponent,
      ...otherComponent,
    ];

    // part
    part.data.map((a) => partPart.push(a.partno));
    packing.data.map((a) => parkingPart.push(a.partno));
    other.data.map((a) => otherPart.push(a.partno));
    const allpart = [...partPart, ...parkingPart, ...otherPart];

    if (!sendData.locSend.value) {
      toast.error("Please Enter Location");
    } else if (!sendData.reqSend) {
      toast.error("Please add quantity");
    } else {
      setLoading(true);
      const { data } = await imsAxios.post("/ppr/addBomOutData", {
        accesstoken: headerData.accesstoken,
        bom: headerData.key,
        component: allComponent,
        conqty: allQty,
        conlocation: headerData.productionLocKey,
        mfgqty: sendData.reqSend,
        part: allpart,
        ppr_transaction: headerData.pprid,
        reject: allRej,
        remark: allRem,
        sendinglocation: sendData.locSend.value,
        sku: headerData.sku,
        comment: sendData.repSend,
      });
      if (data.code == 200) {
        toast.success("ad");
        setLoading(false);
      } else if (data.code == 500) {
        toast.error(data.message.msg);
        setLoading(false);
      }
    }
    // console.log(data);
  };
  useEffect(() => {
    if (showModal) {
      fetchDetailWhenClickModal();
      getLocation();
    }
  }, [showModal]);
  useEffect(() => {
    //  console.log(tabs);
  }, [tabs]);
  return (
    <div
      style={{
        height: "95%",
        width: "100vw",
        position: "fixed",
        top: "6%",
        // right: '0'
        right: `${showModal ? "0vh" : "-100vw"}`,
        zIndex: "9909999",
        transition: "all 350ms linear",
      }}
      className="card text-center"
    >
      <form>
        <div
          className="card-header bg-secondary text-white"
          style={{
            fontFamily: "montserrat",
            fontSize: "15px",
            color: "dodgerblue",
          }}
        >
          MFG Journal
          <div className="btn-group" role="group" aria-label="Basic example">
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Exit
            </button>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={savePPR}
            >
              Save
            </button>
          </div>
        </div>
        <div className="card-body p-3">
          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="row">
                <div className="col-md-3 p-2">
                  <span style={{ fontSize: "15px" }}>
                    PRODUCT SKU:{headerData.productname_sku}{" "}
                  </span>
                </div>
                <div className="col-md-3 p-2">
                  <span style={{ fontSize: "15px" }}>
                    BOM NO:{headerData.bom}{" "}
                  </span>
                </div>
                <div className="col-md-3 p-2">
                  <span style={{ fontSize: "15px" }}>
                    MFG BY :{headerData.productionLocName}{" "}
                  </span>
                </div>
                <div className="col-md-3 p-2">
                  <Select
                    placeholder="Location"
                    options={locationStore}
                    value={sendData.locSend}
                    onChange={(e) =>
                      setSenData((sendData) => {
                        return { ...sendData, locSend: e };
                      })
                    }
                  />
                </div>
                <div className="col-md-3 p-2">
                  <span>Left Qty:{headerData.mfg}</span>
                </div>
                <div className="col-md-3 p-2">
                  <input
                    placeholder="MFG Qty"
                    type="no"
                    className="form-control "
                    value={sendData.reqSend}
                    onChange={(e) =>
                      setSenData((sendData) => {
                        return { ...sendData, reqSend: e.target.value };
                      })
                    }
                  />
                </div>
                <div className="col-md-3 p-2">
                  <textarea
                    value={headerData.comment}
                    className="form-control"
                    disabled
                  />
                </div>
                <div className="col-md-3 p-2">
                  <textarea
                    // value={headerData.comment}
                    className="form-control"
                    placeholder="Comment....."
                    value={sendData.repSend}
                    onChange={(e) =>
                      setSenData((sendData) => {
                        return { ...sendData, repSend: e.target.value };
                      })
                    }
                  />
                </div>
              </div>
              <hr />

              {/* main content */}
              <div className="p-3">
                <ul className="nav nav-tabs" id="myTab" role="tablist">
                  {tabs.map((tab) => (
                    <li className="nav-item" role="presentation" key={tab.id}>
                      <button
                        className={`nav-link ${
                          tab.name == activeTab && "active"
                        }`}
                        id={`${tab.name}-tab`}
                        data-toggle="tab"
                        data-target={`#${tab.name}`}
                        type="button"
                        role="tab"
                        aria-controls={tab.name}
                        aria-selected="true"
                        onClick={() => setActiveTab(tab.name)}
                      >
                        {tab.name}{" "}
                      </button>
                      {tab.name != "Part" && (
                        <span
                          className="cursorr"
                          onClick={() => deleteArr(tab.id)}
                          style={{ marginLeft: "-19px", marginTop: "-10px" }}
                        >
                          <IoClose />
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="tab-content" id="myTabContent">
                  <div
                    className="tab-panel  overflow-auto"
                    id="contact"
                    role="tabpanel"
                    style={{ height: "60vh" }}
                    aria-labelledby="contact-tab"
                  >
                    <table className="table ">
                      <thead>
                        <tr>
                          <th>COMPONENT / PART</th>
                          <th>BOM CONSUMPTION</th>
                          <th>STOCK QTY</th>
                          <th>ACTUAL CONSUMPTION</th>
                          <th>REJECTED</th>
                          <th>REMARK</th>
                        </tr>
                      </thead>

                      <tbody>
                        {tabs
                          .filter((tab) => tab?.name == activeTab)[0]
                          ?.data?.map((data, i) => {
                            console.log(data);
                            return (
                              <tr key={data?.slno}>
                                <td scope="row">{`${data.name} / ${data.partno}`}</td>
                                <td>{data?.qty * data?.qty}</td>
                                <td>{data?.location_qty}</td>
                                <td>
                                  <input
                                    placeholder="Qty"
                                    className="form-control form-control-sm"
                                    value={data.actQty}
                                    onChange={(e) =>
                                      compInputHandler(
                                        "actQty",
                                        e.target.value,
                                        data.key,
                                        data.type
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    placeholder="Reject"
                                    className="form-control form-control-sm"
                                    value={data.rej}
                                    onChange={(e) =>
                                      compInputHandler(
                                        "rej",
                                        e.target.value,
                                        data.key,
                                        data.type
                                      )
                                    }
                                  />
                                </td>
                                <td>
                                  <input
                                    placeholder="Remark"
                                    className="form-control form-control-sm"
                                    value={data.rem}
                                    onChange={(e) =>
                                      compInputHandler(
                                        "rem",
                                        e.target.value,
                                        data.key,
                                        data.type
                                      )
                                    }
                                  />
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
