import React from "react";
import { AiOutlineCloseCircle } from "react-icons/ai";

export default function Popover({ setPopover, popover, allData1 }) {
  console.log(allData1);
  return (
    <div
      style={{
        right: `${popover ? "30vh" : "-100vh"}`,
      }}
      className="card text-center popover1"
    >
      <div
        className="card-header bg-secondary text-white"
        style={{
          fontFamily: "montserrat",
          fontSize: "13px",
          color: "dodgerblue",
        }}
      >
        RM Details
        <AiOutlineCloseCircle
          size={15}
          className="cursorr"
          onClick={() => setPopover(false)}
        />
      </div>
      <div className="card-body">
        Part/Components:{`${allData1.partno} ${allData1.component} `}
        <br />
        OP Bal:{`${allData1.openingqty} `}
        <br />
        CL Bal:{`${allData1.closingqty} `}
        <br />
        Last In Date:{`${allData1.lasttIN} `}
        <br />
        Last Rate:{`${allData1.lastRate} `}
      </div>
    </div>
  );
}
