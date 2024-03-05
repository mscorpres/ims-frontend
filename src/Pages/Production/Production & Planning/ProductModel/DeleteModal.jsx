import React, { useState } from "react";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { imsAxios } from "../../../../axiosInterceptor";

function DeleteModal({ viewModal, setViewModal, getProductDataFromType }) {
  const [addData, setAddData] = useState({ remark: "" });

  console.log(viewModal);
  if (!viewModal) {
    return null;
  }

  const deleteFun = async () => {
    const { data } = await imsAxios.post("/ppr/closePPR", {
      sku: viewModal.prod_product_sku,
      pprid: viewModal.prod_transaction,
      accesstoken: viewModal.prod_randomcode,
      remark: addData.remark,
    });
    console.log(data);
  };
  return (
    <>
      <div className="modal" style={{ zIndex: "1" }}>
        <div className="modal-content">
          <div className="modal-header">
            <h6 className="modal-title">GenBom wise Report</h6>
          </div>
          <div className="modal-body">
            <div className="row m-2">
              <div className="col-md-12 p-1">
                <span style={{ fontWeight: "bold" }}>
                  <BsFillQuestionCircleFill size={25} className="mr-2" />
                  are you sure you want to close the PPR ?
                </span>
              </div>
              <div className="col-md-12 p-1">
                <span>
                  Once the PPR will closed, you will not able to proceed further
                  action against to this same PPR request{" "}
                  {viewModal?.prod_transaction} and product SKU{" "}
                  {viewModal?.prod_product_sku}.
                </span>
              </div>
              <div className="col-md-12 p-1">
                <span>
                  Note: "Yes CLOSE" action is an irreversible action..
                </span>
              </div>
              <div className="col-md-12 p-1 mt-2">
                <span>
                  type 'any remark' in the field below for close PPR #
                  {viewModal?.prod_transaction}
                </span>
                <input
                  placeholder="Reason"
                  className="form-control"
                  value={addData.remark}
                  onChange={(e) =>
                    setAddData((addData) => {
                      return { ...addData, remark: e.target.value };
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <div className="btn-group" role="group" aria-label="Basic example">
              <button
                type="button"
                className="btn btn-danger px-3"
                onClick={() => setViewModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary  px-4"
                onClick={deleteFun}
              >
                Yes Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DeleteModal;
