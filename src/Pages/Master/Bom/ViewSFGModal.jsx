import React, { useEffect, useState } from "react";
import { Drawer, Space } from "antd";
import MyDataTable from "../../../Components/MyDataTable";
import { v4 } from "uuid";
import { imsAxios } from "../../../axiosInterceptor";

export default function ViewSFGModal({ sfgViewModal, setSfgViewModal }) {
  console.log(sfgViewModal);
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState([]);
  const [filterData, setFilterData] = useState([]);

  const fetchDataFromViewBom = async () => {
    setLoading(true);
    const { data } = await imsAxios.post("/bom/bomComponents", {
      subject_id: sfgViewModal?.subject_id,
    });
    setLoading(false);
    let arr = data.data.map((row) => {
      return {
        ...row,
        id: v4(),
      };
    });

    setStoreData(arr);
  };
  const columns = [
    // { field: "serial_no", headerName: "#", width: 80 },
    { field: "c_name", headerName: "Component Name", width: 450 },
    { field: "c_part_no", headerName: "Part No", flex: 1 },
    { field: "units_name", headerName: "Uom", flex: 1 },
    { field: "qty", headerName: "Req. Qty", flex: 1 },
  ];

  useEffect(() => {
    if (sfgViewModal) {
      fetchDataFromViewBom();
    }
  }, [sfgViewModal]);

  useEffect(() => {
    // console.log(filterData);
  }, [filterData]);

  return (
    <Space>
      <Drawer
        width="50vw"
        title={`${sfgViewModal?.subject_name} / ${storeData?.length} item${
          storeData?.length == 1 ? "" : "s"
        }`}
        onClose={() => setSfgViewModal(false)}
        open={sfgViewModal}
        getContainer={false}
        style={{
          position: "absolute",
        }}
        // extra={
        //   <Space>
        //     <CloseCircleFilled onClick={() => setSfgViewModal(false)} />
        //   </Space>
        // }
      >
        <MyDataTable loading={loading} data={storeData} columns={columns} />
      </Drawer>
    </Space>
  );
}

{
  /* <div
  style={{
    height: "94%",
    width: "100vw",
    position: "fixed",
    top: "6%",
    // right: '0'
    right: `${sfgViewModal ? "0vh" : "-100vw"}`,
    zIndex: "9909999",
    transition: "all 350ms linear",
  }}
  className="card text-center"
>
  <div
    className="card-header bg-secondary text-white"
    style={{
      fontFamily: "montserrat",
      fontSize: "16px",
      color: "dodgerblue",
    }}
  >
    View SFG
    <AiFillCloseCircle
      className="cursorr "
      size="22"
      onClick={() => setSfgViewModal(false)}
    />
  </div>
  <div className="card-body p-1">
    <DataTable
      customStyles={customStyles}
      columns={columns}
      data={filterData}
      pagination
      subHeader
      subHeaderComponent={
        <input
          className="form-control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          type="text"
          placeholder="Component"
        />
      }
      fixedHeader="true"
      fixedHeaderScrollHeight={"55vh"}
    />
  </div>
  <div className="card-footer text-muted"></div>
</div>; */
}
