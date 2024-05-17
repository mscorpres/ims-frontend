import { useEffect, useState } from "react";
import { ModalType } from "@/types/general";
import { Button, Card, Flex, Form, Input, Modal } from "antd";
import useApi from "@/hooks/useApi";
import { sendOtp, verifyOtp, updatePassword } from "@/api/auth.js";

interface PropTypes extends ModalType {}

let defaultTimer = 60;
const ForgotPassword = (props: PropTypes) => {
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [timer, setTimer] = useState(defaultTimer);
  const [form] = Form.useForm();
  const { executeFun, loading } = useApi();

  const handleSubmit = async () => {
    if (stage === 0) {
      const values = await form.validateFields(["email"]);
      const response = await executeFun(() => sendOtp(values.email), "submit");
      console.log(response);
      if (response.success) {
        setStage(1);
        startTimer();
      }
    } else if (stage === 1) {
      const values = await form.validateFields(["email", "otp"]);
      const response = await verifyOtp(values.email, values.otp);
      if (response.success) {
        setTimer(0);
        setStage(2);
      }
    } else if (stage === 2) {
      const values = await form.validateFields([
        "email",
        "password",
        "password2",
      ]);
      const response = await executeFun(
        () => updatePassword(values.email, values.password),
        "submit"
      );
      if (response.success) {
        props.hide();
      }
    }
  };

  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((count) => {
        if (count > 0) {
          return (count = count - 1);
        } else {
          return 0;
        }
      });
    }, 1000);
    setTimeout(() => {
      clearInterval(interval);
    }, defaultTimer * 1000);
  };

  return (
    <Modal
      title="Forgot Password"
      width={350}
      open={props.show}
      onOk={handleSubmit}
      confirmLoading={loading("submit")}
      okText={
        stage === 0
          ? "Send OTP"
          : stage === 1
          ? "Verify OTP"
          : "Update Password"
      }
      onCancel={props.hide}
    >
      <Form form={form} layout="vertical">
        <Flex style={{ width: "100%" }} vertical align="center">
          <Form.Item name="email" label="Email" style={{ width: "100%" }}>
            <Input disabled={stage > 0} style={{ width: "100%" }} />
          </Form.Item>

          {stage === 1 && (
            <Form.Item name="otp" label="Enter OTP">
              <Input.OTP size="large" length={6} />
            </Form.Item>
          )}
          <br />
          {stage === 2 && (
            <Flex vertical style={{ width: "100%" }}>
              <Form.Item
                rules={[
                  {
                    required: true,
                    message: "Password is required",
                  },
                ]}
                name="password"
                label="Password"
              >
                <Input type="password" />
              </Form.Item>
              <Form.Item
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
                name="password2"
                label="Confirm Password"
              >
                <Input type="password" />
              </Form.Item>
              <Button disabled={timer > 0} type="link">
                Resend
                {timer > 0 && (
                  <span style={{ marginLeft: 5 }}>
                    00:
                    {+Number(timer).toFixed(0).toString().padStart(2, "0")}
                  </span>
                )}
              </Button>
            </Flex>
          )}
        </Flex>
      </Form>
    </Modal>
  );
};

export default ForgotPassword;
