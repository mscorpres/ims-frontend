import React, { useState, useEffect } from "react";
import { v4 } from "uuid";
import MyDataTable from "../../../Components/MyDataTable";
import axios from "axios";
import {
  Button,
  Col,
  Divider,
  Drawer,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Tooltip,
  Typography,
} from "antd";
import { PrinterFilled, DownloadOutlined } from "@ant-design/icons";
import printFunction, {
  downloadFunction,
} from "../../../Components/printFunction";
import { imsAxios } from "../../../axiosInterceptor";
import DescriptionsItem from "antd/es/descriptions/Item";
import { useForm } from "rc-field-form";
import { values } from "lodash";
import { toast } from "react-toastify";

function DeleteVbt({
  openModal,
  setOpenModal,
  getVBTDetails,
  getSearchResults,
}) {
  //   console.log("edit", openModal.vbt_code);
  const [comments, setComments] = useState([]);
  const [panel, setPanel] = useState("1");
  const [deleteVbt] = Form.useForm();
  const [clicked, setClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteVBT = async () => {
    setLoading(true);
    // const values = await deleteVbt.validateFields();
    console.log("values-------------------------", comments);

    const response = await imsAxios.delete(
      `/tally/vbt/deleteVbt?vbtKey=${openModal.vbt_code}&reason=${comments.comment}`
    );
    // console.log("response", response);
    if (response.status === 200) {
      const { data } = response;
      getSearchResults();
      setOpenModal(null);
      backfunction()
      toast.success(data);
    } else {
      setOpenModal(null);
      getSearchResults();
    }
    setLoading(false);
    setPanel("1");
  };
  const validateFields = async () => {
    const values = await deleteVbt.validateFields();
    console.log("vslues", values);
    setComments(values);
    if (panel === "1") {
      if (values) {
        setPanel("2");
      }
    }
    // if (panel === "2") {
    //   deleteVBT();
    // }
  };
  const reset = () => {
    deleteVbt.resetFields();
  };
  const submitComment = async () => {
    if (panel === "1") {
      validateFields();
    }

    // setOpenModal(null);
    // setPanel("1");
  };
  //   console.log("values=", values);
  const backfunction = () => {
    setPanel("1");
    setOpenModal(null);
    reset();
  };
  // const closeModal =()=>{
  //   setOpenModal(null)
  //    reset();
  //     setPanel("1");
  // }
  return (
    <Drawer
      title={`Delete VBT Number ${openModal?.vbt_code}`}
      width="30vw"
      height="50vh"
      onClose={backfunction}
      open={openModal}
    >
      <Form form={deleteVbt} layout="vertical">
        {panel === "1" ? (
          <>
            <Row>
              <Col span={24}>
                <Form.Item
                  name="comment"
                  label="Comment"
                  rules={[
                    {
                      required: true,
                      message: "Please Enter the Comment Before Submitting!",
                    },
                  ]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Please provide the reason for deleting the VBT."
                  />
                </Form.Item>
              </Col>
            </Row>
            <Divider />
            <Row justify="end">
              <Col span={4}>
                <Button onClick={backfunction}>Back</Button>
              </Col>
              <Col span={5}>
                {" "}
                <Button type="primary" onClick={submitComment}>
                  Proceed
                </Button>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Row>
              <Col span={24}>
                <Typography.Title level={5}>
                  {" "}
                  Check the below Details
                </Typography.Title>
                <Divider />
                <Col span={24}>
                  <Typography.Text type="warning">Please Note!</Typography.Text>
                  <Typography.Paragraph>
                    All the existing VBT's having the above details will be
                    deleted. The MIN Against this VBT will be Reactivated
                  </Typography.Paragraph>

                  <Typography.Text
                    level={1}
                    strong
                  >{`VBT number - ${openModal?.vbt_code} `}</Typography.Text>
                </Col>

                <Typography.Text
                  strong
                >{`MIN number - ${openModal?.min_id} `}</Typography.Text>
              </Col>
            </Row>
            <Divider />
            <Row justify="end">
              <Col span={4}>
                <Button onClick={backfunction}>Back</Button>
              </Col>
              <Col span={5}>
                {" "}
                <Button type="primary" loading={loading} onClick={deleteVBT}>
                  Proceed
                </Button>
              </Col>
            </Row>
          </>
          // Modal.confirm({
          //   title: "Are you sure you want to Delete this VBT?",
          //   content: `All the VBT have the VBT Number ${openModal.vbt_code} will be deleted. The MIN Against this VBT will be Reactivated`,
          //   onOk() {
          //     deleteVBT();
          //   },
          //   onCancel() {
          //     setPanel("1");
          //   },
          // })
        )}
        {/* <Row justify="end">
          <Col span={5}>
            <Button onClick={backfunction}>Back</Button>
          </Col>
          <Col span={5}>
            {" "}
            <Button type="primary" onClick={submitComment}>
              Proceed
            </Button>
          </Col>
        </Row> */}
      </Form>
    </Drawer>
  );
}

export default DeleteVbt;
