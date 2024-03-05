import { Button, Col, Form, Input, Row, Typography } from "antd";
import { useForm } from "antd/lib/form/Form";
import React from "react";
import { imsAxios } from "../../axiosInterceptor";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux/es/exports";
import { useEffect } from "react";
import { setUser } from "../../Features/loginSlice.js/loginSlice";
import { useState } from "react";

function FirstLogin() {
  const [changePasswordForm] = useForm();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.login);
  const dispatch = useDispatch();

  const handleSubmit = async (values) => {
    setLoading("submit");
    const response = await imsAxios.post(
      "/profile/userChangePassword",
      {
        oldpassword: values.oldPassword,
        newpassword: values.newPassword,
      },
      { "Company-Branch": "BRMSC012" }
    );
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        dispatch(setUser({ passwordChanged: "C" }));
        toast.success(data.message);

        navigate("/r1");
      } else {
        toast.error(data.message.msg);
      }
    }
    console.log(values);
  };
  useEffect(() => {
    if (user.passwordChanged != "P") {
      navigate("/r1");
    }
  }, []);
  return (
    <div style={{ height: "100%" }}>
      <Row
        justify="center"
        style={{ width: "100%", height: "100%" }}
        align="middle"
      >
        <Col span={8}>
          <Typography.Title
            style={{
              color: "gray",
              textAlign: "center",
              marginBottom: 20,
            }}
            level={4}
          >
            Change your Password before starting using IMS
          </Typography.Title>
          <Form
            form={changePasswordForm}
            name="basic"
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            <Form.Item
              label="Old Password"
              name="oldPassword"
              rules={[
                {
                  required: true,
                  message: "Please provide old password",
                },
              ]}
            >
              <Input size="large" />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: "Please input your new password!" },
              ]}
            >
              <Input.Password size="large" />
            </Form.Item>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
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
            <Form.Item wrapperCol={{ offset: 0, span: 24 }}>
              <Button
                loading={loading === "submit"}
                block
                size="large"
                type="primary"
                htmlType="submit"
              >
                Change Password
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
}

export default FirstLogin;
