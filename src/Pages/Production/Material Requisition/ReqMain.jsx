import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const ReqMain = () => {
  const { pathname } = useLocation();
  const [activeTab, setActiveTab] = useState("tab1");
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
          <nav
            aria-label="Main"
            className="ml-xl-3 flex-grow-1 flex-xl-grow-0 d-xl-flex flex-xl-row ace-scroll"
            data-ace-scroll="{}"
          >
            <ul className="nav w-auto has-active-border active-on-right active-on-top">
              <li
                className={`nav-item ${pathname == "/reqWithBom" && "active"}`}
              >
                <Link className="nav-link" to="/reqWithBom">
                  <span>Material Requisition With BOM</span>
                </Link>
                <b className="sub-arrow"></b>
              </li>
              <li
                className={`nav-item ${
                  pathname == "/reqWithoutBom" && "active"
                }`}
              >
                <Link className="nav-link" to="/reqWithoutBom">
                  <span>Material Requisition Without BOM</span>
                </Link>
                <b className="sub-arrow"></b>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default ReqMain;
