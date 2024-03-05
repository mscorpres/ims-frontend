import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Button, Col, Drawer, Form, Row, Skeleton, Space } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import MySelect from "../../../Components/MySelect";
import { v4 } from "uuid";
import { CommonIcons } from "../../../Components/TableActions.jsx/TableActions";
import MyDataTable from "../../../Components/MyDataTable";
import { imsAxios } from "../../../axiosInterceptor";

const Alter = ({
  setAltModal,
  altModal,
  secondData,
  fetchData,
  sfgEditModal,
}) => {
  const [allData, setAllData] = useState([]);
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [minusLoading, setMinusLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [dropdown, setDropdown] = useState([]);
  const [selValue, setSelValue] = useState({
    selOptionVale: "",
  });

  // console.log(fetchData);

  // console.log(selValue.selOptionVale.value);

  const dropDownData = async () => {
    setSkeletonLoading(true);
    const { data } = await imsAxios.post("/bom/getAlternativeComponents", {
      subject: fetchData?.subjectid,
      current_component: altModal?.compKey,
    });
    setSkeletonLoading(false);

    // console.log(data.data);
    let arr = [];
    arr = data.data?.map((vList) => {
      return { text: vList.text, value: vList.id };
    });
    setDropdown(arr);
  };

  const addAlterComponent = async () => {
    setSubmitLoading(true);
    const { data } = await imsAxios.post("/bom/addNewAltComponent", {
      subject_id: fetchData.subjectid,
      product_id: fetchData.sku,
      // parent_component: sfgEditModal.bom_product_sku,
      parent_component: altModal.compKey,
      child_component: selValue.selOptionVale,
    });
    setSubmitLoading(false);
    if (data.code == 200) {
      fetchMappningComponent();
      setSelValue({
        selOptionVale: "",
      });
    } else {
      toast.error("Something Went Wrong");
    }
  };

  const fetchMappningComponent = async () => {
    const { data } = await imsAxios.post("/bom/getAllAlternativeComponents", {
      // subjectid: sfgEditModal?.subject_id,
      // product_id: sfgEditModal?.bom_product_sku,
      subjectid: fetchData.subjectid,
      product_id: fetchData.sku,
      parent_component: altModal?.compKey,
    });
    if (data.code == 200) {
      const arr = data.data.map((row, index) => {
        return {
          ...row,
          id: v4(),
          index: index + 1,
        };
      });
      setAllData(arr);
    } else {
      setAllData([]);
      toast.error(data.message.msg);
    }
  };

  const deleteRow = async (a) => {
    setMinusLoading(a.refid);
    const { data } = await imsAxios.post("/bom/removeAltComponent", {
      subject: a.subject,
      product: a.product_sku,
      parent_component: a.parent_component,
      child_component: a.child_component,
      refid: a.refid,
    });
    setMinusLoading(false);
    if (data.code == 200) {
      fetchMappningComponent();
      toast.success("Data Deteled Successfullt");
    } else {
      toast.error("Something went wrong");
    }
  };
  const columns = [
    { headerName: "Serial No.", field: "index", width: 80 },
    { headerName: "Component", field: "component_name", flex: 1 },
    {
      headerName: "Actions.",
      field: "action",
      width: 100,
      renderCell: ({ row }) =>
        minusLoading == row.refid ? (
          <LoadingOutlined />
        ) : (
          <CommonIcons action="removeRow" onClick={() => deleteRow(row)} />
        ),
    },
  ];
  useEffect(() => {
    if (altModal) {
      dropDownData();
    }
  }, [altModal, fetchData]);

  useEffect(() => {
    if (fetchData.subjectid && fetchData.sku && altModal?.compKey) {
      fetchMappningComponent();
    }
  }, [secondData, sfgEditModal]);
  return (
    <>
      <Space>
        <Drawer
          width="100vw"
          title={`Alternatives for : ${altModal?.component} / ${altModal?.partcode}`}
          // closable={false}
          onClose={() => setAltModal(null)}
          open={altModal}
          // extra={
          //   <Space>
          //     <CloseCircleFilled onClick={() => setAltModal(null)} />
          //   </Space>
          // }
        >
          {<Skeleton active loading={skeletonLoading} />}
          {<Skeleton active loading={skeletonLoading} />}
          {!skeletonLoading && (
            <Row gutter={16} style={{ height: "100%" }}>
              <Col span={8}>
                <Row style={{ width: "100%" }}>
                  <Col span={24}>
                    <Form size="small" layout="vertical">
                      <Form.Item label="Component">
                        <MySelect
                          options={dropdown}
                          value={selValue.selOptionVale}
                          onChange={(e) =>
                            setSelValue((selValue) => {
                              return { ...selValue, selOptionVale: e };
                            })
                          }
                        />
                      </Form.Item>
                    </Form>
                  </Col>
                </Row>
                <Row justify="end">
                  <Col>
                    <Button
                      loading={submitLoading}
                      type="primary"
                      onClick={addAlterComponent}
                    >
                      Add
                    </Button>
                  </Col>
                </Row>
              </Col>
              <Col span={16} style={{ height: "80vh" }}>
                <MyDataTable columns={columns} data={allData} />
              </Col>
            </Row>
          )}
        </Drawer>
      </Space>
    </>
  );
};

export default Alter;

// <div
//   style={{
//     height: "95%",
//     width: "100vw",
//     position: "fixed",
//     top: "5%",
//     // right: '0'
//     right: `${altModal ? "0vh" : "-100vw"}`,
//     zIndex: "9909999",
//     transition: "all 350ms linear",
//   }}
//   className="card text-center"
// >
//   <div
//     className="card-header bg-secondary text-white"
//     style={{
//       fontFamily: "montserrat",
//       fontSize: "20px",
//       color: "dodgerblue",
//     }}
//   >
//     Component Mapping
//     <AiFillCloseCircle
//       className="cursorr "
//       size="30"
//       onClick={() => setAltModal(false)}
//     />
//   </div>

//   <div className="row m-2 mt-5">
//     <div className="col-md-4">
//       <form>
//         <div className="card text-center">
//           <div className="card-header">COMPONENT / PART CODE</div>
//           <div className="card-body">
//             <div className="row">
//               <div className="col-md-11">
//                 <Select
//                   options={dropdown}
//                   value={selValue.selOptionVale}
//                   onChange={(e) =>
//                     setSelValue((selValue) => {
//                       return { ...selValue, selOptionVale: e };
//                     })
//                   }
//                 />
//               </div>
//               <div className="col-md-1 mt-1">
//                 <IoCheckmarkDoneCircleSharp
//                   size={30}
//                   // color="red"
//                   onClick={() => addAlterComponent()}
//                   style={{ cursor: "pointer" }}
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="card-footer text-muted">Component</div>
//         </div>
//       </form>
//     </div>

// <div className="col-md-8">
//   <div className="overflow-auto" style={{ height: "78vh" }}>
//     <table className="table table-striped table-bordered table-hover">
//       <thead className="">
//         <tr className="bg-seconhdary">
//           <th className="col-md-1">S.No</th>
//           <th className="col-md-5">Component/Part</th>
//           <th className="col-md-5">Action</th>
//         </tr>
//       </thead>
//       <tbody>
//         {allData?.map((ab, i) => (
//           <tr>
//             <td className="col-md-5" style={{ width: "10px" }}>
//               {i + 1}
//             </td>
//             <td className="col-md-1">{ab.component_name}</td>

//             <td>
//               <div className="btn-group" role="group">
//                 <AiFillDelete
//                   size={30}
//                   color="red"
//                   onClick={() => deleteRow(ab)}
//                   style={{ cursor: "pointer" }}
//                 />
//               </div>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   </div>
//     // </div>
//   </div>
// </div>
