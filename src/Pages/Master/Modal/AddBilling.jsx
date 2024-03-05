import { Button, Col, Drawer, Form, Input, Row, Space } from "antd";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "./modal.css";
import MyAsyncSelect from "../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../axiosInterceptor";

const AddBilling = ({
  setShowAddBillingModal,
  ShowAddBillingModal,
  fetchLocation,
}) => {
  const [asyncOptions, setAsyncOptions] = useState([]);
  const [addBilling, setAddBilling] = useState({
    name: "",
    company: "",
    pan: "",
    gst: "",
    cin: "",
    state: "",
    address: "",
  });
  const [selectLoading, setSelectLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const selectInputHandler = (name, value) => {
    setAddBilling((addBilling) => {
      return {
        ...addBilling,
        [name]: value,
      };
    });
  };

  const getOption = async (e) => {
    if (e.length > 1) {
      setSelectLoading(true);

      const { data } = await imsAxios.post("/backend/stateList", {
        search: e,
      });
      setSelectLoading(false);
      let arr = [];
      arr = data.map((vList) => {
        return { text: vList.text, value: vList.id };
      });
      console.log("Array Vendor=>", arr);
      // return arr;
      setAsyncOptions(arr);
    }
  };

  const addLocation = async () => {
    if (!addBilling.name) {
      return toast.error("Please Enter Your Warehouse Name");
    } else if (!addBilling.company) {
      return toast.error("Please Enter Your Company Name");
    } else if (!addBilling.pan) {
      return toast.error("Please Enter Your Pan No..");
    } else if (!addBilling.gst) {
      return toast.error("Please Enter Your GST NO...");
    } else if (!addBilling.cin) {
      return toast.error("Please Enter Your CIN NO...");
    } else if (!addBilling.state) {
      return toast.error("Please Enter Your State");
    } else if (!addBilling.address) {
      return toast.error("Please Enter Address...");
    } else {
      setSubmitLoading(true);
      const { data } = await imsAxios.post(
        "/billingAddress/saveBillingAddress",
        {
          label: addBilling.name,
          company: addBilling.company,
          cin: addBilling.cin,
          pan: addBilling.pan,
          gstin: addBilling.gst,
          state: addBilling.state,
          address: addBilling.address,
        }
      );
      setSubmitLoading(false);
      if (data.code == 200) {
        fetchLocation();
        setShowAddBillingModal(false);
        resetFun();
        toast.success(data.message);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const resetFun = () => {
    setAddBilling({
      name: "",
      company: "",
      pan: "",
      gst: "",
      cin: "",
      state: "",
      address: "",
    });
  };
  useEffect(() => {});
  return (
    <Space>
      <Drawer
        width="50vw"
        title="Add Billing Address"
        onClose={() => setShowAddBillingModal(false)}
        open={ShowAddBillingModal}
      >
        <Form style={{ height: "95%" }} layout="vertical">
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="Warehouse Name">
                <Input
                  value={addBilling.name}
                  onChange={(e) =>
                    setAddBilling((addBilling) => {
                      return { ...addBilling, name: e.target.value };
                    })
                  }
                  placeholder="Enter Warehouse Name"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Company Name">
                <Input
                  value={addBilling.company}
                  onChange={(e) =>
                    setAddBilling((company) => {
                      return { ...addBilling, company: e.target.value };
                    })
                  }
                  placeholder="Enter Company Name"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item label="Pan No.">
                <Input
                  value={addBilling.pan}
                  onChange={(e) =>
                    setAddBilling((addBilling) => {
                      return { ...addBilling, pan: e.target.value };
                    })
                  }
                  placeholder="Enter Pan Number... "
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="GST No.">
                <Input
                  value={addBilling.gst}
                  onChange={(e) =>
                    setAddBilling((addBilling) => {
                      return { ...addBilling, gst: e.target.value };
                    })
                  }
                  placeholder="Enter GST Number..."
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item label="CIN No">
                <Input
                  value={addBilling.cin}
                  onChange={(e) =>
                    setAddBilling((addBilling) => {
                      return { ...addBilling, cin: e.target.value };
                    })
                  }
                  placeholder="Enter CIN Number... "
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item label="Select City">
                <MyAsyncSelect
                  selectLoading={selectLoading}
                  loadOptions={getOption}
                  onBlur={() => setAsyncOptions([])}
                  value={addBilling.state}
                  optionsState={asyncOptions}
                  onChange={(value) => {
                    selectInputHandler("state", value);
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={8}>
            <Col span={24}>
              <Form.Item label="Select Address">
                <Input.TextArea
                  rows={4}
                  placeholder="Enter Complete Address"
                  value={addBilling.address}
                  onChange={(e) =>
                    setAddBilling((addBilling) => {
                      return { ...addBilling, address: e.target.value };
                    })
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Row justify="end">
          <Col>
            <Space>
              <Button onClick={resetFun} type="text">
                Reset
              </Button>
              <Button onClick={() => setShowAddBillingModal(false)}>
                Back
              </Button>
              <Button onClick={addLocation} type="primary">
                Submit
              </Button>
            </Space>
          </Col>
        </Row>
      </Drawer>
    </Space>
  );
};

export default AddBilling;

// <form>
//   <div
//     style={{
//       right: `${ShowAddBillingModal ? "0vh" : "-100vh"}`,
//     }}
//     className="card text-center mainDiv1"
//   >
//     <div
//       className="card-header bg-secondary text-white"
//       style={{
//         fontFamily: "montserrat",
//         fontSize: "15px",
//         color: "dodgerblue",
//       }}
//     >
//       Add Billing Address
//     </div>
//     <div className="card-body">
//       <div className="form-group">
//         <input
//           type="no"
//           className="form-control"
//           value={addBilling.name}
//           onChange={(e) =>
//             setAddBilling((addBilling) => {
//               return { ...addBilling, name: e.target.value };
//             })
//           }
//           placeholder="Warehouse Name"
//         />
//       </div>
//       <div className="form-group">
//         <input
//           type="no"
//           className="form-control"
//           id="exampleInputEmail1"
//           placeholder="Company Name"
//           value={addBilling.company}
//           onChange={(e) =>
//             setAddBilling((company) => {
//               return { ...addBilling, company: e.target.value };
//             })
//           }
//         />
//       </div>
//       <hr />

//       <div className="form-group">
//         <input
//           type="no"
//           className="form-control"
//           id="exampleInputPassword1"
//           placeholder="PAN No: XXXXXX0X"
//           value={addBilling.pan}
//           onChange={(e) =>
//             setAddBilling((addBilling) => {
//               return { ...addBilling, pan: e.target.value };
//             })
//           }
//         />
//       </div>
//       <div className="form-group">
//         <input
//           type="no"
//           className="form-control"
//           id="exampleInputPassword1"
//           placeholder="GST No: XXXXXX0X"
//           value={addBilling.gst}
//           onChange={(e) =>
//             setAddBilling((addBilling) => {
//               return { ...addBilling, gst: e.target.value };
//             })
//           }
//         />
//       </div>
//       <div className="form-group">
//         <input
//           type="no"
//           className="form-control"
//           id="exampleInputPassword1"
//           placeholder="CIN No: XXXXXX0X"
//           value={addBilling.cin}
//           onChange={(e) =>
//             setAddBilling((addBilling) => {
//               return { ...addBilling, cin: e.target.value };
//             })
//           }
//         />
//       </div>
//       <hr />

//       <div className="row">
//         <div className="col-12">
//           <div className="form-group">
//             <AsyncSelect
//               value={addBilling.state}
//               onChange={(value) => {
//                 selectInputHandler("state", value);
//               }}
//               onInputChange={(e) => setSearchVendor(e)}
//               loadOptions={getOption}
//               placeholder="State"
//             />
//           </div>
//         </div>
//         <div className="col-12">
//           <div className="form-group">
//             <textarea
//               className="form-control"
//               id="exampleFormControlTextarea1"
//               rows="3"
//               placeholder="Address"
//               value={addBilling.address}
//               onChange={(e) =>
//                 setAddBilling((addBilling) => {
//                   return { ...addBilling, address: e.target.value };
//                 })
//               }
//             ></textarea>
//           </div>
//         </div>
//       </div>
//     </div>
//     <div className="text-center">
//       <button
//         type="button"
//         onClick={addLocation}
//         className="btn btn-info btn-sm w-25 mb-3 mr-2"
//       >
//         Add Location
//       </button>
//       <button
//         type="button"
//         onClick={() => setShowAddBillingModal(false)}
//         className="btn btn-danger btn-sm w-25 mb-3"
//       >
//         Cancel
//       </button>
//     </div>
//     <div
//       className="card-footer bg-secondary  text-white"
//       style={{ minHeight: "45px" }}
//     ></div>
//   </div>
// </form>
