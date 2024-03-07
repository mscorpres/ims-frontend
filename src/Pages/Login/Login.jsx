import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setSettings, setUser } from "../../Features/loginSlice/loginSlice";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Typography,
} from "antd";
import { imsAxios } from "../../axiosInterceptor";
import useApi from "../../hooks/useApi";

const Login = () => {
  document.title = "IMS Login";
  const [signUpPage, setSignUpPage] = useState("1");
  const [forgotPassword, setForgotPassword] = useState("0");

  const { executeFun, loading } = useApi();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [inpVal, setInpVal] = useState({
    username: "",
    password: "",
  });
  const { Title, Link, Text } = Typography;
  const [signUp] = Form.useForm();
  const inputHandler = (name, value) => {
    setInpVal(() => {
      return {
        ...inpVal,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    const { username, password } = inpVal;
    if (username === "" && password === "") {
      toast.error("Please fill the field");
    } else if (username === "") {
      toast.error("username Field is Empty");
    } else if (password === "") {
      toast.error("password fill is empty");
    } else {
      const { data, success } = await executeFun(
        () =>
          imsAxios.post("/auth/signin", {
            username: username,
            password: password,
          }),
        "submit"
      );

      if (success) {
        console.log("this is the login data", data);
        const obj = {
          email: data.data.crn_email,
          phone: data.data.crn_mobile,
          userName: data.data.username,
          token: data.data.token,
          favPages: JSON.parse(data.data.fav_pages),
          type: data.data.crn_type,
          mobileConfirmed: data.data.other.m_v,
          emailConfirmed: data.data.other.e_v,
          passwordChanged: data.data.other.c_p ?? "C",
          company_branch: JSON.parse(localStorage.getItem("otherData"))
            ?.company_branch,
          currentLink: JSON.parse(localStorage.getItem("otherData"))
            ?.currentLink,
          id: data.data.crn_id,
          showlegal: data.data.department === "legal" ? true : false,
          session: "23-24",
          company_branch: "BRMSC012",
        };
        dispatch(setUser(obj));
        dispatch(setSettings(data.data.settings));
      }
      // dispatch(
      //   loginAuth({ username: inpVal.username, password: inpVal.password })
      // );
    }
  };
  const validatecreateNewUser = async () => {
    const values = await signUp.validateFields();
    console.log("values", values);
    // createNewUser(values);
    askModalConfirm(values);
  };
  const askModalConfirm = (values) => {
    console.log("values.username", values.username);
    Modal.confirm({
      title: `Are you sure you want to create this new user?`,
      content: (
        <>
          <Typography>
            You requested for creating account. Please make sure that the values
            are correct.
          </Typography>
          <Row style={{ marginTop: "1em" }}>
            <Text>
              {" "}
              Email Id -<Text strong>{values.username}</Text>
            </Text>
          </Row>
          <Row>
            <Text>
              {" "}
              Number -<Text strong>{values.number}</Text>
            </Text>
          </Row>
        </>
      ),

      onOk() {
        createNewUser(values);
      },
      onCancel() {
        // submitUnVerifyHandler(row);
      },
      okText: "Yes",
      cancelText: "No",
    });
  };
  const createNewUser = async (values) => {
    const response = await imsAxios.post("/auth/singup/new", {
      username: values.name,
      email: values.username,
      mobile: values.number,
      password: values.password2,
    });
    console.log("response", response);
    let { data } = response;
    if (data.code == 200) {
      toast.success(data.message);
      setSignUpPage("1");
      signUp.resetFields();
    } else {
      toast.error(data.message.msg);
    }
  };
  // useEffect(() => {
  //   if (message?.length > 0) {
  //     if (user) {
  //       navigate("/r1");
  //       // toast.success(message);
  //     }
  //   }
  // }, [message, user]);
  // useEffect(() => {
  //   if (user) {
  //     navigate("/");
  //   }
  // }, []);
  return (
    <div style={{ height: "100vh" }}>
      <Row style={{ height: "100%" }}>
        <Col
          span={8}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <div
            style={{
              height: "100vh",
              width: "100%",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "-600px 00px",
              backgroundColor: "#ecf4fc !important",
              backgroundImage:
                "url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyMCIgaGVpZ2h0PSIxMDgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPg0KICA8ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9Im5vbmUiPg0KDQogICA8Y2lyY2xlIHI9IjU3MCIgY3k9IjEwMDAiIGN4PSIxNDAwIiBmaWxsLXJ1bGU9Im5vbnplcm8iIGZpbGw9InBhbGV2aW9sZXRyZWQiIG9wYWNpdHk9IjAuMDciIC8+DQogICANCiAgIDxjaXJjbGUgcj0iMTIiIGN5PSI4MDAiIGN4PSI2OTAiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNDUiIHN0cm9rZT0icHVycGxlIiBzdHJva2Utd2lkdGg9IjciIC8+DQogICA8Y2lyY2xlIHI9IjEyIiBjeT0iNjYwIiBjeD0iODAwIiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjciIHN0cm9rZT0iIzRCN0RBMCIgc3Ryb2tlLXdpZHRoPSI3IiAvPg0KICAgPGNpcmNsZSByPSIxNiIgY3k9IjY1MCIgY3g9IjExMDAiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNiIgc3Ryb2tlPSIjZmZjMTEzIiBzdHJva2Utd2lkdGg9IjEwIiAvPg0KICAgDQoNCiAgIDxjaXJjbGUgcj0iMzAwIiBjeT0iMTA1MCIgY3g9IjQ1MCIgZmlsbD0ibm9uZSIgb3BhY2l0eT0iMC4zIiBzdHJva2U9ImdyZWVuIiBzdHJva2Utd2lkdGg9IjEyIiAvPg0KICAgPGNpcmNsZSByPSIyMjAiIGN5PSI4MDAiIGN4PSIxNDUwIiBmaWxsPSJub25lIiBvcGFjaXR5PSIwLjI3IiBzdHJva2U9InJlZCIgc3Ryb2tlLXdpZHRoPSIxMiIgLz4NCiAgIDxjaXJjbGUgcj0iNTUwIiBjeT0iMTIwMCIgY3g9IjE2MDAiIGZpbGw9Im5vbmUiIG9wYWNpdHk9IjAuNCIgc3Ryb2tlPSIjZmZjMTEzIiBzdHJva2Utd2lkdGg9IjEyIiAvPg0KDQogIDwvZz4NCjwvc3ZnPg==)",
            }}
          >
            <Row>
              <Row style={{ height: "100%", width: "100%" }} justify="center">
                <Col style={{ paddingTop: "5vh", zIndex: 2 }} span={6}>
                  <img
                    style={{ width: "100%" }}
                    src="./../assets/images/mscorpres_auto_logo.png"
                  />
                </Col>
              </Row>
              <Row style={{ width: "100%" }} justify="center">
                <Col style={{ whiteSpace: "nowrap", marginTop: 30 }}>
                  <Title level={5}>Stay Tuned With Updated Stocks!</Title>
                  <Divider />
                </Col>
              </Row>
            </Row>
            <Row justify="center" style={{ marginTop: "80%" }}>
              <Col offset={1}>
                <Text>
                  IMS from 2019 - 2022. All Rights reserved | Performance &
                  security by
                  <Link
                    style={{ marginLeft: 5 }}
                    href="https://www.mscorpres.com"
                  >
                    MSCorpres Automation Pvt. Ltd.
                  </Link>
                </Text>
              </Col>
            </Row>
          </div>
        </Col>
        <Col span={16}>
          <Row
            justify="center"
            style={{ width: "100%", height: "100%" }}
            align="middle"
            gutter={[5, 5]}
          >
            <Col span={12}>
              {signUpPage === "1" ? (
                <Card style={{ height: 350 }}>
                  <Title
                    style={{
                      color: "gray",
                      textAlign: "center",
                      marginBottom: 20,
                    }}
                    level={4}
                  >
                    Secure Login To IMS
                  </Title>
                  <Form
                    name="basic"
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                    form={signUp}
                  >
                    <Form.Item
                      label="Username / Mobile / CRN Number"
                      name="username"
                      rules={[
                        {
                          required: true,
                          message:
                            "Please provide either your email or phone number or CRN Nunber",
                        },
                      ]}
                    >
                      <Input
                        value={inpVal.username}
                        onChange={(e) =>
                          inputHandler("username", e.target.value)
                        }
                        size="large"
                      />
                    </Form.Item>
                    {forgotPassword === "0" ? (
                      <>
                        <Form.Item
                          label="Password"
                          name="password"
                          rules={[
                            {
                              required: true,
                              message: "Please input your password!",
                            },
                          ]}
                        >
                          <Input.Password
                            value={inpVal.password}
                            onChange={(e) =>
                              inputHandler("password", e.target.value)
                            }
                            size="large"
                          />
                        </Form.Item>
                        {/* <Link onClick={() => setForgotPassword("1")}>
                          Forgot Password
                        </Link> */}
                        <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                          <Button
                            loading={loading("submit")}
                            block
                            size="large"
                            type="primary"
                            htmlType="submit"
                            style={{ marginTop: "1em" }}
                          >
                            Log In
                          </Button>
                        </Form.Item>
                        <Text style={{ marginLeft: "8em" }}>
                          {" "}
                          Not Registered yet?
                        </Text>
                        <Link
                          style={{ marginLeft: "1em" }}
                          onClick={() => setSignUpPage("2")}
                        >
                          Create an Account
                        </Link>
                      </>
                    ) : (
                      <>
                        <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
                          <Button
                            // loading={loading}
                            block
                            size="large"
                            type="primary"
                            htmlType="submit"
                            style={{ marginTop: "1em" }}
                          >
                            Reset Password
                          </Button>
                        </Form.Item>

                        <Link
                          style={{ marginLeft: "8em" }}
                          onClick={
                            (() => setSignUpPage("1"), setForgotPassword("0"))
                          }
                        >
                          Back to Log In
                        </Link>
                        <Link
                          style={{ marginLeft: "1em" }}
                          onClick={() => setSignUpPage("2")}
                        >
                          Create an Account
                        </Link>
                      </>
                    )}
                  </Form>
                </Card>
              ) : (
                <Card style={{ height: 490 }}>
                  <Title
                    style={{
                      color: "gray",
                      textAlign: "center",
                      marginBottom: 20,
                    }}
                    level={4}
                  >
                    Secure Login To IMS
                  </Title>
                  <Form
                    name="basic"
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                    form={signUp}
                  >
                    <Form.Item
                      label="Full Name"
                      name="name"
                      rules={[
                        {
                          required: true,
                          message: "Please provide your name",
                        },
                      ]}
                    >
                      <Input
                        value={inpVal.name}
                        onChange={(e) => inputHandler("name", e.target.value)}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      label="Mobile Number"
                      name="number"
                      rules={[
                        {
                          required: true,
                          message: "Please provide phone number.",
                        },
                      ]}
                    >
                      <Input
                        value={inpVal.number}
                        onChange={(e) => inputHandler("number", e.target.value)}
                        size="large"
                      />
                    </Form.Item>
                    <Form.Item
                      label="Email Address"
                      name="username"
                      rules={[
                        {
                          required: true,
                          message:
                            "Please provide either your email or phone number or CRN Nunber",
                        },
                      ]}
                    >
                      <Input
                        value={inpVal.username}
                        onChange={(e) =>
                          inputHandler("username", e.target.value)
                        }
                        size="large"
                      />
                    </Form.Item>

                    <Form.Item
                      label="Password"
                      name="password"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>

                    {/* Field */}
                    <Form.Item
                      label="Confirm Password"
                      name="password2"
                      dependencies={["password"]}
                      rules={[
                        {
                          required: true,
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "The new password that you entered do not match!"
                              )
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                  </Form>
                  <Button
                    // loading={loading}
                    block
                    size="large"
                    type="primary"
                    htmlType="submit"
                    style={{ marginTop: "2em" }}
                    onClick={() => validatecreateNewUser()}
                  >
                    Sign Up
                  </Button>
                  <Row justify="center" style={{ marginTop: "1em" }}>
                    <Link
                      style={{ marginLeft: "1em" }}
                      onClick={() => setSignUpPage("1")}
                    >
                      Back to Log In
                    </Link>
                  </Row>
                </Card>
              )}
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default Login;
