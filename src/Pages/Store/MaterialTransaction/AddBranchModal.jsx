import React from "react";
import Select from "react-select";

const AddBranchModal = ({ setAddBranch, addBranch }) => {
  const options = [
    { label: "React", value: "React" },
    { label: "Javascript", value: "Javascript" },
    { label: "Redux", value: "Redux" },
    { label: "HTML", value: "HTML" },
  ];
  return (
    <div
      style={{
        height: "81%",
        width: "30vw",
        position: "fixed",
        top: "11%",

        right: `${addBranch ? "0vh" : "-100vh"}`,
        zIndex: "2",
        transition: "all 350ms linear",
      }}
      className="card text-center"
    >
      <div className="card-header bg-secondary text-white">Add Vendor Branch</div>
      <div className="card-body">
        <div>
          <form>
            <div className="form-group">
              <input
                type="text"
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
                placeholder="Branch Label"
              />
            </div>

            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <Select options={options} />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputPassword1"
                    placeholder="City"
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputPassword1"
                    placeholder="GSTIN"
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputPassword1"
                    placeholder="Pincode"
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <input
                    type="email"
                    className="form-control"
                    id="exampleInputPassword1"
                    placeholder="Email"
                  />
                </div>
              </div>
              <div className="col-6">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputPassword1"
                    placeholder="Mobile"
                  />
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <textarea
                    className="form-control"
                    id="exampleFormControlTextarea1"
                    rows="3"
                    placeholder="Please enter to next line"
                  ></textarea>
                </div>
              </div>
              <div className="col-12">
                <div className="form-group">
                  <input
                    type="text"
                    className="form-control"
                    id="exampleInputPassword1"
                    placeholder="Fax No"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
      <div className="btn-group btn-group-toggle" data-toggle="buttons">
        <label className="btn btn-success">
          <input type="radio" name="options" id="option2" />{" "}
          Register
        </label>
        <label className="btn btn-danger">
          <input
            type="radio"
            name="options"
            id="option3"
            onClick={() => setAddBranch(false)}
          />{" "}
          Cancel
        </label>
      </div>
    </div>
  );
};

export default AddBranchModal;
