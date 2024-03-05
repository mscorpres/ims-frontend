import React, { useEffect, useState } from "react";
import { AiFillDelete } from "react-icons/ai";
import { toast } from "react-toastify";
import { Button, Drawer, Space } from "antd";
import { CloseCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import MySelect from "../../../Components/MySelect";
import { imsAxios } from "../../../axiosInterceptor";

function AlterModal({ setAltModal, altModal, firstData }) {
  const [allData, setAllData] = useState([]);
  const [dropdown, setDropdown] = useState([]);
  const [selValue, setSelValue] = useState({
    selOptionVale: "",
  });

  const dropDownData = async () => {
    const { data } = await imsAxios.post("/bom/getAlternativeComponents", {
      subject: firstData?.subjectid,
      current_component: altModal?.compKey,
    });
    // console.log(data.data);
    let arr = [];
    arr = data.data?.map((vList) => {
      return { text: vList.text, value: vList.id };
    });
    setDropdown(arr);
  };

  const addAlterComponent = async () => {
    const { data } = await imsAxios.post("/bom/addNewAltComponent", {
      subject_id: firstData.subjectid,
      product_id: firstData.sku,
      // parent_component: sfgEditModal.bom_product_sku,
      parent_component: altModal.compKey,
      child_component: selValue.selOptionVale,
    });
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
      subjectid: firstData?.subjectid,
      product_id: firstData?.sku,
      parent_component: altModal?.compKey,
    });
    setAllData(data.data);
  };
  const deleteRow = async (a) => {
    console.log(a.subject);
    const { data } = await imsAxios.post("/bom/removeAltComponent", {
      subject: a.subject,
      product: a.product_sku,
      parent_component: a.parent_component,
      child_component: a.child_component,
      refid: a.refid,
    });
    if (data.code == 200) {
      fetchMappningComponent();
      toast.success("Data Deteled Successfullt");
    } else {
      toast.error("Something went wrong");
    }
  };
  useEffect(() => {
    fetchMappningComponent();
  }, [firstData]);

  useEffect(() => {
    if (altModal) {
      dropDownData();
    }
  }, [altModal, firstData]);
  return (
    <>
      <Space>
        <Drawer
          width="100vw"
          title="Component Mapping"
          placement="right"
          closable={false}
          onClose={() => setAltModal(null)}
          open={altModal}
          getContainer={false}
          style={{
            position: "absolute",
          }}
          extra={
            <Space>
              <CloseCircleFilled onClick={() => setAltModal(null)} />
            </Space>
          }
        >
          <div className="row">
            <div className="col-md-4">
              <form>
                <div className="card">
                  <div className="card-header">COMPONENT / PART CODE</div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-9">
                        <MySelect
                          options={dropdown}
                          style={{ width: "100%" }}
                          value={selValue.selOptionVale.value}
                          onChange={(e) =>
                            setSelValue((selValue) => {
                              return { ...selValue, selOptionVale: e };
                            })
                          }
                        />
                      </div>

                      <div className="col-md-3">
                        <Button
                          onClick={addAlterComponent}
                          style={{ backgroundColor: "#3A4B53", color: "white" }}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            <div className="col-md-8">
              <div className="overflow-auto" style={{ height: "78vh" }}>
                <table className="table table-striped table-bordered table-hover">
                  <thead className="">
                    <tr className="bg-seconhdary">
                      <th className="col-md-1">S.No</th>
                      <th className="col-md-5">Component/Part</th>
                      <th className="col-md-5">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allData?.map((ab, i) => (
                      <tr>
                        <td className="col-md-5" style={{ width: "10px" }}>
                          {i + 1}
                        </td>
                        <td className="col-md-1">{ab.component_name}</td>

                        <td>
                          <div className="btn-group" role="group">
                            <AiFillDelete
                              size={30}
                              color="red"
                              onClick={() => deleteRow(ab)}
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Drawer>
      </Space>
    </>
  );
}

{
  /* <div
  style={{
    height: "93%",
    width: "100vw",
    position: "fixed",
    top: "6%",
    // right: '0'
    right: `${altModal ? "0vh" : "-100vw"}`,
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
    Component Mapping
    <AiFillCloseCircle className="cursorr " size="30" onClick={() => setAltModal(false)} />
  </div>
  <div className="row m-2 mt-5">
    <div className="col-md-4">
      <form>
        <div className="card text-center">
          <div className="card-header">COMPONENT / PART CODE</div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-11">
                <Select
                  options={dropdown}
                  value={selValue.selOptionVale}
                  onChange={(e) =>
                    setSelValue((selValue) => {
                      return { ...selValue, selOptionVale: e };
                    })
                  }
                />
              </div>
              <div className="col-md-1 mt-1">
                <IoCheckmarkDoneCircleSharp
                  size={30}
                  // color="red"
                  onClick={() => addAlterComponent()}
                  style={{ cursor: "pointer" }}
                />
              </div>
            </div>
          </div>
          <div className="card-footer text-muted">Component</div>
        </div>
      </form>
    </div>

    <div className="col-md-8">
      <div className="overflow-auto" style={{ height: "78vh" }}>
        <table className="table table-striped table-bordered table-hover">
          <thead className="">
            <tr className="bg-seconhdary">
              <th className="col-md-1">S.No</th>
              <th className="col-md-5">Component/Part</th>
              <th className="col-md-5">Action</th>
            </tr>
          </thead>
          <tbody>
            {allData?.map((ab, i) => (
              <tr>
                <td className="col-md-5" style={{ width: "10px" }}>
                  {i + 1}
                </td>
                <td className="col-md-1">{ab.component_name}</td>

                <td>
                  <div className="btn-group" role="group">
                    <AiFillDelete
                      size={30}
                      color="red"
                      onClick={() => deleteRow(ab)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>; */
}

export default AlterModal;
