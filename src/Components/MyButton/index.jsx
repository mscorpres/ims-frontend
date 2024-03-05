import { Button } from "antd";
import {
  CheckOutlined,
  SyncOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  CloseOutlined,
  DownloadOutlined,
  ArrowLeftOutlined,
  EditFilled,
  EyeOutlined,
  UnorderedListOutlined,
  SearchOutlined,
} from "@ant-design/icons";

const MyButton = (props) => {
  if (props.variant === "reset") {
    return (
      <Button {...props} type={props.type} icon={<SyncOutlined />}>
        {props.text ?? "Reset"}
      </Button>
    );
  }
  if (props.variant === "submit") {
    return (
      <Button
        {...props}
        type={props.type ?? "primary"}
        icon={<CheckOutlined />}
      >
        {props.text ?? "Submit"}
      </Button>
    );
  }
  if (props.variant === "next") {
    return (
      <Button
        {...props}
        type={props.type ?? "primary"}
        icon={<ArrowRightOutlined />}
      >
        {props.text ?? "Next"}
      </Button>
    );
  }
  if (props.variant === "add") {
    return (
      <Button {...props} type={props.type ?? "primary"} icon={<PlusOutlined />}>
        {props.text ?? "Add"}
      </Button>
    );
  }
  if (props.variant === "clear") {
    return (
      <Button
        {...props}
        type={props.type ?? "primary"}
        icon={<CloseOutlined />}
      >
        {props.text ?? "Clear"}
      </Button>
    );
  }
  if (props.variant === "downloadSample") {
    return (
      <Button
        {...props}
        type={props.type ?? "link"}
        icon={<DownloadOutlined />}
      >
        {props.text ?? "Sample File"}
      </Button>
    );
  }
  if (props.variant === "back") {
    return (
      <Button
        {...props}
        type={props.type ?? "default"}
        icon={<ArrowLeftOutlined />}
      >
        {props.text ?? "Back"}
      </Button>
    );
  }
  if (props.variant === "edit") {
    return (
      <Button {...props} type={props.type ?? "primary"} icon={<EditFilled />}>
        {props.text ?? "Edit"}
      </Button>
    );
  }
  if (props.variant === "details") {
    return (
      <Button {...props} type={props.type ?? "primary"} icon={<EyeOutlined />}>
        {props.text ?? "Details"}
      </Button>
    );
  }
  if (props.variant === "logs") {
    return (
      <Button
        {...props}
        type={props.type ?? "link"}
        icon={<UnorderedListOutlined />}
      >
        {props.text ?? "Logs"}
      </Button>
    );
  }
  if (props.variant === "search") {
    return (
      <Button
        {...props}
        type={props.type ?? "primary"}
        icon={<SearchOutlined />}
      >
        {props.text ?? "Search"}
      </Button>
    );
  }
};

export default MyButton;
