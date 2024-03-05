import { Button, Modal } from "antd";
import React from "react";
import MyDataTable from "../../../../Components/MyDataTable";

function VerifiedFilePreview({
  verifiedFile,
  setVerifiedFile,
  submitHandler,
  loading,
}) {
  const columns = [
    { headerName: "Sr. No.", width: 80, field: "id" },
    { headerName: "Part", width: 120, field: "PART_CODE" },
    { headerName: "Name", width: 120, field: "PART_NAME", flex: 1 },
  ];
  return (
    <Modal
      closable={false}
      bodyStyle={{ height: "70vh" }}
      open={verifiedFile}
      width={800}
      title="Confirm Uploading these records?"
      footer={[
        <Button onClick={() => setVerifiedFile(false)}>Cancel</Button>,
        <Button
          loading={loading === "2"}
          onClick={submitHandler}
          type="primary"
        >
          Submit
        </Button>,
      ]}
    >
      <MyDataTable columns={columns} rows={verifiedFile} />
    </Modal>
  );
}

export default VerifiedFilePreview;
