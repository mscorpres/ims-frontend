import { useState, useEffect, useRef } from "react";
import { Button, Col, Input, Modal, Row, Typography } from "antd";
import "../../index.css";
import validateResponse from "../../Components/validateResponse";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";

function OtpVerify({
  showOTPVerifyModal,
  setShowOTPVerifyModal,
  updateUserState,
}) {
  const [timer, setTimer] = useState(60);
  const [numberCompleted, setNumberCompleted] = useState(false);
  const [OTPSent, setOTPSent] = useState(false);
  const [userNumber, setUserNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [eneteredOtp, setEnteredOtp] = useState([
    { value: "", index: 1 },
    { value: "", index: 2 },
    { value: "", index: 3 },
    { value: "", index: 4 },
    { value: "", index: 5 },
    { value: "", index: 6 },
    { value: "", index: 7 },
    { value: "", index: 8 },
  ]);
  const submitRef = useRef();
  const refs = {
    ref1: useRef(),
    ref2: useRef(),
    ref3: useRef(),
    ref4: useRef(),
    ref5: useRef(),
    ref6: useRef(),
    ref7: useRef(),
    ref8: useRef(),
  };
  const mobileRefs = {
    ref2: useRef(),
    ref5: useRef(),
    ref6: useRef(),
    ref7: useRef(),
    ref8: useRef(),
  };
  const inputHandler = (value, current, event, mobile) => {
    if (!mobile) {
      let enteredArr = eneteredOtp;
      enteredArr = enteredArr.map((row) => {
        if (row.index === current) {
          return {
            value: value,
            index: row.index,
          };
        } else {
          return row;
        }
      });
      setEnteredOtp(enteredArr);
      if (value.length == 1) {
        let num = current;
        let val = "ref" + num;
        for (const property in refs) {
          if (property == val) console.log(refs[val].current.value == value);
        }
      }
      if (value.length >= 1) {
        let num = current + 1;
        let val = "ref" + num;
        for (const property in refs) {
          if (property == val) console.log(refs[val].current.focus());
        }
        if (current == 6) {
          submitRef.current.focus();
        }
      }
      if (event.key === "Backspace" && current > 1) {
        console.log(current);
        let num = current - 1;
        let val = "ref" + num;
        for (const property in refs) {
          if (property == val) refs[val].current.focus();
        }
      }
      if (event.key === "Backspace" && current == 1) {
        console.log(current);
        let num = current;
        let val = "ref" + num;
        for (const property in refs) {
          if (property == val) refs[val].current.focus();
        }
      }
      let arr = [];
      for (const property in refs) {
        arr.push(refs[property].current.value);
      }
      arr.map((row) => {
        if (row == "") {
          setNumberCompleted(false);
        } else {
          setNumberCompleted(true);
        }
      });
    } else {
      if (value.length == 1) {
        let num = current;
        let val = "ref" + num;
      }
      if (value.length >= 1) {
        let add = 0;
        console.log(current);
        if (+current.split(["ref"])[1] == 2) {
          add = 3;
        } else if (
          +current.split(["ref"])[1] == 5 ||
          +current.split(["ref"])[1] == 6 ||
          +current.split(["ref"])[1] == 7
        ) {
          add = 1;
        }
        let num = +current.split(["ref"])[1] + add;
        let val = "ref" + num;
        for (const property in mobileRefs) {
          if (property == val) mobileRefs[val].current.focus();
        }
        if (current == 8) {
          submitRef.current.focus();
        }
      }
      if (event.key === "Backspace" && +current.split(["ref"])[1] > 1) {
        let add = 0;
        if (+current.split(["ref"])[1] == 5) {
          add = 3;
        } else if (
          +current.split(["ref"])[1] == 6 ||
          +current.split(["ref"])[1] == 7 ||
          +current.split(["ref"])[1] == 8
        ) {
          add = 1;
        }
        let num = +current.split(["ref"])[1] - add;
        let val = "ref" + num;
        for (const property in mobileRefs) {
          if (property == val) mobileRefs[val].current.focus();
        }
      }
      if (event.key === "Backspace" && current == 1) {
        console.log(current);
        let num = current;
        let val = "ref" + num;
        for (const property in mobileRefs) {
          if (property == val) mobileRefs[val].current.focus();
        }
      }
      let arr = [];
      for (const property in mobileRefs) {
        arr.push(mobileRefs[property].current.value);
      }
      arr.map((row) => {
        if (row == "") {
          setNumberCompleted(false);
        } else {
          setNumberCompleted(true);
        }
      });
    }
  };
  const sendOTP = async () => {
    if (numberCompleted) {
      // timer from here
      const timeOut = setInterval(() => {
        setTimer((timer) => timer > 0 && timer - 1);
      }, 1000);
      setTimeout(() => {
        clearTimeout(timeOut);
        setTimer(60);
        setOTPSent(false);
      }, 60000);
      let arr = [];
      for (const property in mobileRefs) {
        arr.push(mobileRefs[property].current.value);
      }
      setLoading("submit");
      const response = await imsAxios.post("/profile/getMobileOTP", {
        mobile: arr.toString().replaceAll(",", ""),
      });
      setLoading(false);
      const { data } = response;
      if (data) {
        if (data.code === 200) {
          toast.success(data.message);
          setOTPSent(true);
        } else {
          toast.error(data.message.msg);
        }
      }
    }
  };
  const checkMobile = async () => {
    setLoading("submit");
    const { data } = await imsAxios.get("/profile/checkMobile");
    setLoading(false);
    validateResponse(data);
    setUserNumber(
      `${data.data.mobile[0]}*${data.data.mobile[1]}${data.data.mobile[2]}****${data.data.mobile[3]}${data.data.mobile[4]}`
    );
    return data.code;
  };
  const inputBox = (current, ref) => {
    console.log(mobileRefs[current]);
    return (
      <input
        placeholder="*"
        className="otp-input"
        onKeyUp={(e) => inputHandler(e.target.value, current, e, "mobile")}
        ref={mobileRefs[current]}
      />
    );
  };
  const confirmOTP = async () => {
    let arr = [];
    arr = eneteredOtp.map((row) => row.value);
    let otp = arr.join("");
    setLoading("submit");
    const response = await imsAxios.post("/profile/checkMobileOTP", {
      otp: otp,
    });
    setLoading(false);
    const { data } = response;
    if (data.code === 200) {
      toast.success(data.message);
      setShowOTPVerifyModal(false);
      updateUserState("mobileConfirmed");
    } else {
      toast.error(data.message.msg);
    }
  };
  useEffect(() => {
    if (showOTPVerifyModal) {
      checkMobile();
    }
  }, [showOTPVerifyModal]);

  return (
    <Modal
      title="Verify OTP"
      open={showOTPVerifyModal}
      onCancel={() => setShowOTPVerifyModal(false)}
      footer={[
        // <Button disabled={timer > 0 || !OTPSent} onClick={sendOTP}>
        //   Resend OTP: {timer}
        // </Button>,
        <Button
          onClick={() => {
            if (!OTPSent) {
              sendOTP();
            } else if (OTPSent) {
              confirmOTP();
            }
          }}
          loading={loading === "submit"}
          ref={submitRef}
          key="submit"
          type="primary"
        >
          {OTPSent ? "Confirm OTP" : "Get OTP"}
        </Button>,
      ]}
    >
      {!OTPSent && (
        <Row gutter={6} justify="center">
          {[...userNumber].map((char, index) => {
            if (char === "*") {
              let num = index + 1;
              return <Col>{inputBox("ref" + num)}</Col>;
            } else {
              // console.log(char);
              return (
                <Col>
                  <Typography.Text>{char}</Typography.Text>
                </Col>
              );
            }
          })}
        </Row>
      )}
      {OTPSent && (
        <>
          <Row justify="center" style={{ marginBottom: 15 }}>
            <Typography.Text>OTP sent to Mobile {userNumber}</Typography.Text>
          </Row>
          <Row justify="center" gutter={4}>
            <Col>
              <input
                placeholder="*"
                className="otp-input"
                onKeyDown={(e) => inputHandler(e.target.value, 1, e)}
                ref={refs.ref1}
              />
            </Col>
            <Col>
              <input
                placeholder="*"
                className="otp-input"
                onKeyUp={(e) => inputHandler(e.target.value, 2, e)}
                ref={refs.ref2}
              />
            </Col>
            <Col>
              <input
                placeholder="*"
                className="otp-input"
                onKeyUp={(e) => inputHandler(e.target.value, 3, e)}
                ref={refs.ref3}
              />
            </Col>
            <Col>
              <input
                placeholder="*"
                className="otp-input"
                onKeyUp={(e) => inputHandler(e.target.value, 4, e)}
                ref={refs.ref4}
              />
            </Col>
            <Col>
              <input
                placeholder="*"
                className="otp-input"
                onKeyUp={(e) => inputHandler(e.target.value, 5, e)}
                ref={refs.ref5}
              />
            </Col>
            <Col>
              <input
                placeholder="*"
                className="otp-input"
                onKeyUp={(e) => inputHandler(e.target.value, 6, e)}
                ref={refs.ref6}
              />
            </Col>
            {/* <Col>
              <input
                placeholder="*"
                className="otp-input"
                onKeyUp={(e) => inputHandler(e.target.value, 7, e)}
                ref={refs.ref7}
              />
            </Col>
            <Col>
              <input
                placeholder="*"
                className="otp-input"
                onKeyUp={(e) => inputHandler(e.target.value, 8, e)}
                ref={refs.ref8}
              />
            </Col> */}
          </Row>
        </>
      )}
      <Row style={{ marginTop: 15 }} justify="center">
        <Typography.Text style={{ color: OTPSent ? "black" : "gray" }}>
          Resend OTP in : {timer}
        </Typography.Text>
      </Row>
    </Modal>
  );
}

export default OtpVerify;
