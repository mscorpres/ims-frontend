
import { Upload } from "antd";
import UploadIcon from '@mui/icons-material/Upload';
import CustomButton from "../../../../new/components/reuseable/CustomButton";

export default function UploadDocs({ files, setFiles, disable, size }) {
  const props = {
    maxCount: 1,
    showUploadList: files.length > 0,
    onRemove: (file) => {
      const index = files.indexOf(file);
      const newFileList = files.slice();
      newFileList.splice(index, 1);
      setFiles(newFileList);
    },
    beforeUpload: (file) => {
      setFiles([file]);
      return false;
    },
    files,
  };

  return (
    <Upload {...props}>
      {/* <Button
        disabled={disable}
        type="primary"
        size={size && "large"}
        style={{ marginRight: size === "large" && 20 }}
        icon={<UploadOutlined />}
      >
        Upload File
      </Button> */}
      <CustomButton
        title="Upload File"
        starticon={<UploadIcon fontSize="small" />}
        disabled={disable}
        size={"small"}
      />
    </Upload>
  );
}
