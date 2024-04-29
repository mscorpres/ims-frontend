import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import AsyncSelect from "react-select/async";

import moment from "moment";
import { DatePicker } from "antd";
import { toast } from "react-toastify";
import waiting from "../../../animation/waiting.json";
import makeAnimated from "react-select/animated";
import Loading from "../../../Components/Loading";
import { getComponentOptions } from "../../../api/general";
import useApi from "../../../hooks/useApi.ts";
// import MultiSelect from "react-multiple-select-dropdown-lite";
// import "react-multiple-select-dropdown-lite/dist/index.css";

const animatedComponents = makeAnimated();

const OpenModal10 = ({
  viewModal,
  setViewModal,
  setAllResponseData,
  loading,
  setLoading,
}) => {
  const [allData, setAllData] = useState({
    selectProduct: "",
    selectLocation: "",
    selectName: "",
  });
  const [seacrh, setSearch] = useState("");

  console.log(allData);

  const [locDataTo, setloctionDataTo] = useState([]);
  const [allDetails, setallDetails] = useState([]);
  const [value, setvalue] = useState("");
  const [allArray, setAllArray] = useState([]);
  const [allLocation, setAllLocation] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const { executeFun, loading: loading1 } = useApi();
  const getSearchByProduct = async (e) => {
    // const { data } = await imsAxios.post("/backend/getComponentByNameAndNo", {
    //   search: "e",
    // });
    const response = await executeFun(() => getComponentOptions(e), "select");
    const { data } = response;
    // console.log(data);

    let arr = data.map((row) => {
      return { label: row.text, value: row.id };
    });
    setAllArray(arr);
  };

  const getSearchByLocation = async (e) => {
    const { data } = await imsAxios.post("/backend/fetchLocation", {
      searchTerm: e,
    });

    // console.log(data);

    let arr = data.map((row) => {
      return { label: row.text, value: row.id };
    });
    setAllLocation(arr);
  };

  const getFetchAllName = async (e) => {
    if (e?.length > 2) {
      const { data } = await imsAxios.post("/backend/fetchAllUser", {
        search: e,
      });
      let arr = [];
      arr = data.map((d) => {
        return { label: d.text, value: d.id };
      });
      return arr;
    }
  };

  const update = async () => {
    let a = [];
    let b = [];
    allData.selectProduct.map((aa) => a.push(aa.value));
    allData.selectLocation.map((aa1) => b.push(aa1.value));

    const { data } = await imsAxios.post("/report10/update", {
      component_part: a,
      location: b,
    });
    if (data.code == 200) {
      setViewModal(false);
      toast.success(data.message);
    }
  };

  useEffect(() => {
    if (viewModal) {
      getSearchByProduct();
      getSearchByLocation();
    }
  }, [viewModal]);

  if (!viewModal) {
    return null;
  }

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="modal" style={{ zIndex: "1" }}>
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title">Generate R1</h6>
            </div>
            <div className="modal-body">
              <div className="row ">
                <div className="col-md-12 p-3">
                  <Select
                    placeholder="Part Name"
                    defaultValue={(allArray[0], allArray[1])}
                    options={allArray ? allArray : ""}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    isMulti
                    style={{ width: "35vw" }}
                    onChange={(e) =>
                      setAllData((allData) => {
                        return { ...allData, selectProduct: e };
                      })
                    }
                  />
                </div>
                <div className="col-md-12 p-3">
                  <Select
                    defaultValue={(allLocation[0], allLocation[1])}
                    options={allLocation ? allLocation : ""}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    isMulti
                    style={{ width: "35vw" }}
                    onChange={(e) =>
                      setAllData((allData) => {
                        return { ...allData, selectLocation: e };
                      })
                    }
                  />
                </div>
                <div className="col-md-12 p-3">
                  <AsyncSelect
                    placeholder="Select Name"
                    loadOptions={getFetchAllName}
                    onInputChange={(e) => setSearch(e)}
                    value={allData.selectName}
                    onChange={(e) =>
                      setAllData((allData) => {
                        return { ...allData, selectName: e };
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div
                className="btn-group"
                role="group"
                aria-label="Basic example"
              >
                <button
                  type="button"
                  className="btn btn-danger px-3"
                  onClick={() => setViewModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success  px-4"
                  onClick={update}
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OpenModal10;
