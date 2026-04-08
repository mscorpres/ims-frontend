import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Button, Card, Col, Divider, Form, Input, Row, Typography } from "antd";
import { imsAxios } from "../../axiosInterceptor";
import useApi from "../../hooks/useApi.ts";

const SignUp = () => {
  document.title = "IMS Sign Up";
  const { executeFun, loading } = useApi();
  const readStoredTempToken = () => {
    const raw = localStorage.getItem("tempToken");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  };
  const token =
    readStoredTempToken() ||
    window.location.search.split("token=")[1]?.split("&")[0];
  const navigate = useNavigate();
  const [inpVal, setInpVal] = useState({
    number: "",
    password: "",
  });
  const { Title, Link, Text } = Typography;
  const [form] = Form.useForm();

  const inputHandler = (name, value) => {
    setInpVal((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (values) => {
    const { number, password } = values;
    if (number === "" && password === "") {
      toast.error("Please fill the field");
    } else if (number === "") {
      toast.error("Mobile Field is Empty");
    } else if (password === "") {
      toast.error("password fill is empty");
    } else {
      const res = await executeFun(
        () =>
          imsAxios.post("/auth/complete-registration", {
            mobile_no: number,
            password: password,
          }, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        "signUpSubmit",
      );
  
      if (res?.success) {
        toast.success(res?.message || "Registration completed successfully!");
        form.resetFields();
        setInpVal({ number: "", password: "" });
        localStorage.removeItem("tempToken")
        navigate("/login");
      } else {
        toast.error(res?.message || "Unable to complete registration");
      }
    }
  };

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
                  IMS from 2019 - 2024. All Rights reserved | Performance &
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
           
           
         
                <Card style={{ height: 490 }}>
                  <Title
                    style={{
                      color: "gray",
                      textAlign: "center",
                      marginBottom: 20,
                    }}
                    level={4}
                  >
                    Register To IMS
                  </Title>
                  <Form
                    name="basic"
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                    form={form}
                  >
                
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
                      label="Password"
                      name="password"
                      rules={[
                        {
                          required: true,
                          message: "Please input password.",
                        },
                      ]}
                    >
                      <Input.Password
                        value={inpVal.password}
                        onChange={(e) => inputHandler("password", e.target.value)}
                      />
                    </Form.Item>

                    {/* Field */}
                    <Form.Item
                      label="Confirm Password"
                      name="password2"
                      dependencies={["password"]}
                      rules={[
                        {
                          required: true,
                          message: "Please confirm your password.",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error(
                                "The new password that you entered do not match!",
                              ),
                            );
                          },
                        }),
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                  </Form>
        
                  <Button
                    loading={loading("signUpSubmit")}
                    block
                    size="large"
                    type="primary"
                    style={{ marginTop: "2em" }}
                    onClick={() => form.submit()}
                  >
                    Sign Up
                  </Button>

                  <Row justify="center" style={{ marginTop: "1em" }}>
                    <Link onClick={() => {
                      localStorage.removeItem("tempToken")
                      navigate("/login")}}>Back to Log In</Link>
                  </Row>
           
                </Card>
          
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default SignUp;
