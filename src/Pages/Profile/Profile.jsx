import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import errorToast from "../../Components/errorToast";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import validateResponse from "../../Components/validateResponse";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import OtpVerify from "./OtpVerify";
import { imsAxios } from "../../axiosInterceptor";
import { setUser } from "../../Features/loginSlice.js/loginSlice";

export default function Profile() {
  document.title = "Profile";
  const [userDetails, setUserDetails] = useState();
  const [activeTab, setActiveTab] = useState("1");
  const [skeletonLoading, setSkeletonLoading] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showOTPVerifyModal, setShowOTPVerifyModal] = useState(false);
  const { user } = useSelector((state) => state.login);
  const dispatch = useDispatch();

  const getUserDetails = async () => {
    setSkeletonLoading(true);
    const { data } = await imsAxios.get("/profile/userDetails");
    setSkeletonLoading(false);
    if (data.code == 200) {
      setUserDetails(data.data);
    } else {
      toast.error(errorToast(data.message));
    }
  };
  const onFinish = async () => {
    const { data } = await imsAxios.post("/profile/userChangePassword", {
      oldpassword: showSubmitConfirm.currentPassword,
      newpassword: showSubmitConfirm.password,
    });
    validateResponse(data);
    setShowSubmitConfirm(false);
  };
  const handleOTP = () => {
    setShowOTPVerifyModal(true);
  };
  const updateUserState = (property) => {
    let obj = {
      mobileConfirmed: user.mobileConfirmed,
      emailConfirmed: user.emailConfirmed,
      passwordChanged: user.passwordChanged,
    };
    if (property === "mobileConfirmed") {
      obj = {
        ...obj,
        mobileConfirmed: "C",
      };
    }
    dispatch(setUser(obj));
  };
  useEffect(() => {
    getUserDetails();
  }, []);
  return (
    <div style={{ padding: "40px 50px" }}>
      <Modal
        title="Confirm Password Update!"
        open={showSubmitConfirm}
        onCancel={() => setShowSubmitConfirm(false)}
        footer={[
          <Button key="back" onClick={() => setShowSubmitConfirm(false)}>
            No
          </Button>,
          <Button key="submit" type="primary" onClick={onFinish}>
            Yes
          </Button>,
        ]}
      >
        <p>Are you sure to Update your password?</p>
      </Modal>
      {/* Verify otp modal */}
      <OtpVerify
        updateUserState={updateUserState}
        showOTPVerifyModal={showOTPVerifyModal}
        setShowOTPVerifyModal={setShowOTPVerifyModal}
      />

      <Row justify="center" gutter={[24, 0]}>
        {skeletonLoading && (
          <Skeleton.Avatar
            loading={skeletonLoading}
            active
            size={100}
            shape="circle"
          />
        )}

        <Row justify="center" style={{ width: "100%" }}>
          <Col>
            <Skeleton
              paragraph={false}
              style={{ marginTop: 15, width: 200 }}
              rows={2}
              loading={skeletonLoading}
              active
            />
          </Col>
        </Row>
        {/* <Skeleton loading={skeletonLoading} active /> */}
        {!skeletonLoading && (
          <Row justify="center" style={{ width: "100%" }}>
            <Space direction="vertical">
              <Col
                style={{ display: "flex", justifyContent: "center" }}
                span={24}
              >
                <Avatar
                  size={100}
                  style={{ backgroundColor: "#87d068", fontSize: 40 }}
                >
                  {userDetails?.name[0]}
                </Avatar>
              </Col>
              <Space direction="vertical" size="small">
                <Col
                  style={{ display: "flex", justifyContent: "center" }}
                  span={24}
                >
                  <Typography.Title
                    style={{ color: "rgb(60,60,60)", margin: 0, padding: 0 }}
                    level={3}
                  >
                    {userDetails?.name}
                  </Typography.Title>
                </Col>
                <Col
                  style={{ display: "flex", justifyContent: "center" }}
                  span={24}
                >
                  <Typography.Title
                    style={{ color: "#245181", margin: 0, padding: 0 }}
                    level={5}
                  >
                    {userDetails?.type}
                  </Typography.Title>
                </Col>
              </Space>
            </Space>
          </Row>
        )}
      </Row>
      <Row gutter={16}>
        <Col span={16}>
          <Card
            title={activeTab == "1" ? "User Info" : "Update Password"}
            extra={
              <Button
                onClick={() =>
                  setActiveTab((activeTab) => (activeTab == "1" ? "2" : "1"))
                }
                type="link"
              >
                {activeTab == "1" ? "Change Password" : "Update Details"}
              </Button>
            }
            style={{
              // width: "100%",
              marginTop: 15,
              height: 300,
            }}
          >
            {/* details tab */}
            {activeTab == "1" && (
              <>
                <Skeleton loading={skeletonLoading} active />
                {!skeletonLoading && (
                  <Form
                    name="basic"
                    labelCol={{
                      span: 2,
                    }}
                    //   onFinish={onFinish}
                    //   onFinishFailed={onFinishFailed}
                  >
                    <Form.Item label="Full Name">
                      <Input value={userDetails?.name} />
                    </Form.Item>

                    <Form.Item
                      label={
                        <Typography.Text>
                          <Badge
                            count={
                              user?.emailConfirmed == "C" ? (
                                <CheckCircleOutlined
                                  style={{ color: "green", marginRight: 5 }}
                                />
                              ) : (
                                <ExclamationCircleOutlined
                                  style={{ color: "red", marginRight: 5 }}
                                />
                              )
                            }
                          />
                          Email
                        </Typography.Text>
                      }
                    >
                      <Input disabled value={userDetails?.email} />
                    </Form.Item>

                    <Form.Item
                      label={
                        <Typography.Text>
                          <Badge
                            count={
                              user?.mobileConfirmed == "C" ? (
                                <CheckCircleOutlined
                                  style={{ color: "green", marginRight: 5 }}
                                />
                              ) : (
                                <ExclamationCircleOutlined
                                  onClick={handleOTP}
                                  style={{
                                    color: "red",
                                    marginRight: 5,
                                    cursor: "pointer",
                                  }}
                                />
                              )
                            }
                          />
                          Phone
                        </Typography.Text>
                      }
                    >
                      <Input disabled value={userDetails?.phone} />
                    </Form.Item>
                    <Row justify="end">
                      <Form.Item>
                        <Button type="primary" htmlType="submit">
                          Update Details
                        </Button>
                      </Form.Item>
                    </Row>
                  </Form>
                )}
              </>
            )}
            {activeTab == "2" && (
              <>
                <Skeleton loading={skeletonLoading} active />
                {!skeletonLoading && (
                  <Form
                    name="update password"
                    labelCol={{
                      span: 4,
                    }}
                    validateMessages={{
                      required: "${label} is required!",
                      types: {
                        email: "${label} is not a valid email!",
                        number: "${label} is not a valid number!",
                      },
                      string: {
                        min: "${label} should be at least ${min} characters long",
                      },
                    }}
                    onFinish={(values) => setShowSubmitConfirm(values)}
                    //   onFinishFailed={onFinishFailed}
                  >
                    <Form.Item
                      name="currentPassword"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                      label="Current Password"
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item
                      name="password"
                      rules={[
                        {
                          required: "Please enter a new password",
                          min: 8,
                        },
                      ]}
                      label="New Password"
                    >
                      <Input.Password />
                    </Form.Item>
                    <Form.Item
                      rules={[
                        {
                          required: true,
                          message: "Please confirm your password!",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "The two passwords that you entered do not match!"
                              )
                            );
                          },
                        }),
                      ]}
                      name="confirmPassword"
                      label="Confirm New Password"
                    >
                      <Input.Password />
                    </Form.Item>
                    <Row justify="end">
                      <Form.Item>
                        <Button type="primary" htmlType="submit">
                          Update Password
                        </Button>
                      </Form.Item>
                    </Row>
                  </Form>
                )}
              </>
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card
            title="Update Info"
            style={{
              width: "100%",
              marginTop: 15,
              height: 300,
            }}
          >
            <Skeleton loading={skeletonLoading} active />
            {!skeletonLoading &&
              (activeTab == "1" ? (
                <Row gutter={[0, 16]}>
                  <Col span={24}>
                    <Typography.Title level={5}>
                      Last Name change On:
                    </Typography.Title>
                    <Typography.Text>
                      {userDetails?.lastname_change}
                    </Typography.Text>
                  </Col>
                  <Col span={24}>
                    <Typography.Title level={5}>
                      Last Email change On:
                    </Typography.Title>
                    <Typography.Text>
                      {userDetails?.lastemail_change}
                    </Typography.Text>
                  </Col>
                  <Col span={24}>
                    <Typography.Title level={5}>
                      Last Phone Number change On:
                    </Typography.Title>
                    <Typography.Text>
                      {userDetails?.lastmobile_change}
                    </Typography.Text>{" "}
                  </Col>
                </Row>
              ) : (
                <Row gutter={[0, 16]}>
                  <Col span={24}>
                    <Typography.Title level={5}>
                      Last Password change On:
                    </Typography.Title>
                    <Typography.Text>
                      {userDetails?.lastpassword_change}
                    </Typography.Text>
                  </Col>
                </Row>
              ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
