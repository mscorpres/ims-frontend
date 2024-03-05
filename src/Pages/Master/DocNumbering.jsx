import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { imsAxios } from "../../axiosInterceptor";
import "../common.css";

const DocNumbering = () => {
  const { pathname } = useLocation();
  const [numData, setNumData] = useState([]);

  const fetchNumb = async () => {
    const { data } = await imsAxios.get("/numbering/allNumbering");
    //  console.log(data.data)
    setNumData(data.data);
  };

  console.log(numData);

  const poIdHandler = (x, y, z) => {
    console.log(x, y, z);
  };
  const prefix = numData.map((a) => a[0].prefix);
  const session = numData.map((a) => a[0].session);
  const suffix = numData.map((a) => a[0].suffix);
  const number_length_limit = numData.map((a) => a[0].number_length_limit);
  // console.log(prefix, "prefix1---->")

  useEffect(() => {
    fetchNumb();
  }, []);
  return (
    <>
      <div
        id="sidebar2"
        className="sidebar sidebar-fixed sidebar-hover sidebar-h collapsed-h sidebar-light has-open sidebar-backdrop"
        data-dismiss="true"
        data-backdrop="true"
        data-swipe="true"
      >
        <div className="sidebar-inner align-items-xl-end border-b-1 brc-grey-l2 border-r-0 shadow-none">
          <div
            className="d-xl-none text-right position-tr"
            style={{ zIndex: "5" }}
          >
            <button
              type="button"
              className="btn collapsed btn-light-red radius-0"
              data-toggle-mobile="sidebar"
              data-target="#sidebar2"
              aria-controls="sidebar2"
              aria-expanded="false"
              aria-label="Toggle sidebar"
            >
              <i className="fa fa-times"></i>
            </button>
          </div>

          <nav
            aria-label="Main"
            className="ml-xl-3 flex-grow-1 flex-xl-grow-0 d-xl-flex flex-xl-row ace-scroll"
            data-ace-scroll="{}"
          >
            <ul className="nav w-auto has-active-border active-on-right active-on-top">
              <li
                className={`nav-item ${
                  pathname === "/doc_numbering" && "active"
                }`}
              >
                <Link className="nav-link" to="doc_numbering">
                  <span>Numbering</span>
                </Link>
                <b className="sub-arrow"></b>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div
        className="m-3 mt-5"
        style={{
          border: " 0.5px solid #e9dcdc",
          boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
        }}
      >
        <div className="row">
          <div className="col-2">
            <div
              className="nav flex-column nav-pills"
              id="v-pills-tab"
              role="tablist"
              aria-orientation="vertical"
            >
              <button
                className="nav-link active"
                id="v-pills-home-tab"
                data-toggle="pill"
                data-target="#v-pills-home"
                type="button"
                role="tab"
                onClick={() => poIdHandler("3", "4", "5")}
              >
                PO ID
              </button>
              <button
                className="nav-link"
                id="v-pills-profile-tab"
                data-toggle="pill"
                data-target="#v-pills-profile"
                type="button"
                role="tab"
                aria-controls="v-pills-profile"
                aria-selected="false"
              >
                Jobwork ID
              </button>

              <button
                className="nav-link"
                id="v-pills-messages-tab"
                data-toggle="pill"
                data-target="#v-pills-messages"
                type="button"
                role="tab"
                aria-controls="v-pills-messages"
                aria-selected="false"
              >
                MIN
              </button>
              <button
                className="nav-link"
                id="v-pills-settings-tab"
                data-toggle="pill"
                data-target="#v-pills-settings"
                type="button"
                role="tab"
                aria-controls="v-pills-settings"
                aria-selected="false"
              >
                Gate Pass
              </button>
              <button
                className="nav-link"
                id="v-pills-settings-tab-gate"
                data-toggle="pill"
                data-target="#v-pills-gate"
                type="button"
                role="tab"
                aria-controls="v-pills-settings"
                aria-selected="false"
              >
                JW Challan
              </button>
            </div>
          </div>

          <div className="col-10">
            <div
              className="tab-content"
              style={{ border: "none" }}
              id="v-pills-tabContent"
            >
              <div
                className="tab-pane fade show active"
                id="v-pills-home"
                role="tabpanel"
                aria-labelledby="v-pills-home-tab"
              >
                <div className="parent">
                  <div>
                    <div className="child">
                      <input className="form-control" value={prefix[0]} />
                    </div>
                    <div className="child">
                      <input className="form-control" value={session[0]} />
                    </div>
                    <div className="child">
                      <input className="form-control" value={suffix[0]} />
                    </div>
                  </div>
                  <div>
                    <div className="child">
                      <input
                        className="form-control"
                        value={number_length_limit[0]}
                      />
                    </div>
                    <button className="btn btn-primary mx-3">
                      Save And Update
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="tab-pane fade"
                id="v-pills-profile"
                role="tabpanel"
                aria-labelledby="v-pills-profile-tab"
              >
                <div className="parent">
                  <div>
                    <div className="child">
                      <input className="form-control" value={prefix[1]} />
                    </div>
                    <div className="child">
                      <input className="form-control" value={session[1]} />
                    </div>
                    <div className="child">
                      <input className="form-control" value={suffix[1]} />
                    </div>
                  </div>
                  <div>
                    <div className="child">
                      <input
                        className="form-control"
                        value={number_length_limit[1]}
                      />
                    </div>
                    <button className="btn btn-primary mx-3">
                      Save And Update
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="tab-pane fade"
                id="v-pills-messages"
                role="tabpanel"
                aria-labelledby="v-pills-messages-tab"
              >
                <div className="parent">
                  <div>
                    <div className="child">
                      <input className="form-control" value={prefix[2]} />
                    </div>
                    <div className="child">
                      <input className="form-control" value={session[2]} />
                    </div>
                    <div className="child">
                      <input className="form-control" value={suffix[2]} />
                    </div>
                  </div>
                  <div>
                    <div className="child">
                      <input
                        className="form-control"
                        value={number_length_limit[2]}
                      />
                    </div>
                    <button className="btn btn-primary mx-3">
                      Save And Update
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="tab-pane fade"
                id="v-pills-settings"
                role="tabpanel"
                aria-labelledby="v-pills-settings-tab"
              >
                <div className="parent">
                  <div>
                    <div className="child">
                      <input className="form-control" value={prefix[3]} />
                    </div>
                    <div className="child">
                      <input className="form-control" value={session[3]} />
                    </div>
                    <div className="child">
                      <input className="form-control" value={suffix[3]} />
                    </div>
                  </div>
                  <div>
                    <div className="child">
                      <input
                        className="form-control"
                        value={number_length_limit[3]}
                      />
                    </div>
                    <button className="btn btn-primary mx-3">
                      Save And Update
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="tab-pane fade"
                id="v-pills-gate"
                role="tabpanel"
                aria-labelledby="v-pills-settings-tab"
              >
                <div className="parent">
                  <div>
                    <div className="child">
                      <input className="form-control" value={prefix[4]} />
                    </div>
                    <div className="child">
                      <input className="form-control" value={session[4]} />
                    </div>
                    <div className="child">
                      <input className="form-control" value={suffix[4]} />
                    </div>
                  </div>
                  <div>
                    <div className="child">
                      <input
                        className="form-control"
                        value={number_length_limit[4]}
                      />
                    </div>
                    <button className="btn btn-primary mx-3">
                      Save And Update
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocNumbering;
