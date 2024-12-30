import React from 'react'
import { Modal, Upload, Button, Typography } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

export default function UploadDocumentModal({
  open,
  close,
  handleUpload,
  fileList,
  setFileList
}) {
  // Handle file change (multiple files)
  const handleFileChange = ({ fileList }) => {
    // Update the file list (Ant Design automatically handles adding/removing files)
    setFileList(fileList)
  }

  // Handle upload
  const handleOk = () => {
    if (fileList.length > 0) {
      // Pass the selected files to the parent for upload
      handleUpload(fileList)
    }
  }

  return (
    <Modal
      open={open}
      title="Upload Documents"
      onOk={handleOk} // Upload files when user clicks OK
      onCancel={close} // Close the modal
      destroyOnClose
    >
      <Upload
        name="documents"
        multiple // Allow multiple file selection
        beforeUpload={() => false} // Prevent auto-upload; we’ll handle it manually
        onChange={handleFileChange} // Handle file selection change
        fileList={fileList} // Display the selected files
        showUploadList={{ showRemoveIcon: true, showPreviewIcon: false }} // Show remove icon for selected files
        maxCount={4} // Limit to 4 documents (if needed)
      >
        <Button icon={<UploadOutlined />}>Select Files</Button>
      </Upload>

      <Typography.Text type="secondary" style={{ marginTop: 10 }}>
        Selected files: {fileList.length} {fileList.length > 1 ? 'files' : 'file'}
      </Typography.Text>
    </Modal>
  )
}
