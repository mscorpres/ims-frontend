import React, { useEffect, useState } from "react";
import "../../../Master/Modal/modal.css";
import { Button, Row, Col, Input, Drawer, Skeleton, Form, Space } from "antd";
import { toast } from "react-toastify";
import errorToast from "../../../../Components/errorToast";
import MyAsyncSelect from "../../../../Components/MyAsyncSelect";
import { imsAxios } from "../../../../axiosInterceptor";

const { TextArea } = Input;

const BillingDetails = ({ openBranch, setOpenBranch, id, clientcode,getclientDetials }) => {
    const [submitLoading, setSubmitLoading] = useState(false);
    const [selectLoading, setSelectLoading] = useState(false);
    const [asyncOptions, setAsyncOptions] = useState([]);
    const [billingForm] = Form.useForm();
    const [addtype, setAddType] = useState()
    const [cCode, setcCode] = useState()


    const getFetchState = async (e) => {
        if (e.length > 1) {
            setSelectLoading(true);
            const { data } = await imsAxios.post("/backend/stateList", {
                search: e,
            });
            setSelectLoading(false);
            let arr = [];
            arr = data.map((d) => {
                return { text: d.text, value: d.id };
            });
            setAsyncOptions(arr);
        }
    };
    useEffect(() => {
        setAddType(id.current.id)
        setcCode(clientcode)
    }, [openBranch])



    
    const reset = () => {
        billingForm.resetFields()
    };

    const createAdress = async () => {
        const values = await billingForm.validateFields()
        console.log(values)
        const submitdata = {
            "clientCode": cCode,
            "label": values.label,
            "pan": values.pan,
            "gstin": values.gst,
            "state": values.state,
            "address": values.address
        }

        try {
            setSubmitLoading(true);
            const { data } = await imsAxios.post(addtype === "Billing" ? 'client/addbillingaddress' : 'client/addshippingaddress', submitdata)
            console.log(data)
            if(data.code === 200){
            toast.success(data.message);
            setOpenBranch(false)
            toast.error(data.message.msg)
            billingForm.resetFields()
            setOpenBranch(false)
            getclientDetials(clientcode,data.message)
            }
        } catch (error) {
            toast.error(error)
        } finally {
            setSubmitLoading(false);
        }



    }



    return (
        <Drawer
            title={`Add ${addtype} Details`}
            centered
            confirmLoading={submitLoading}
            open={openBranch}
            onClose={() => setOpenBranch(false)}
            width="50vw"
        >
            <Form
                style={{ marginTop: -10, height: "95%", overflowY: "auto" }}
                layout="vertical"
                size="small"
                form={billingForm}
            >
                <Row style={{ width: "100%" }}>
                    <>
                        {/* <Col span={12} style={{ padding: 3 }}>
              <Form.Item label="Branch Name">
                  size="default "
                  // placeholder="Branch Name"
                  value={addBilling.branch.branchname}
                  onChange={(e) => inputHandler("branchname", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col> */}

                        <Col span={12} style={{ padding: "3px" }}>
                            <Form.Item label="State" name='state' rules={[{ required: true, message: 'Please select State!' }]}>
                                <MyAsyncSelect
                                    selectLoading={selectLoading}
                                    optionsState={asyncOptions}
                                    onBlur={() => setAsyncOptions([])}
                                    loadOptions={getFetchState}
                                    onChange={(e) => billingForm.setFieldValue('state', e.value)}
                                    labelInValue
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12} style={{ padding: "3px" }}>
                            <Form.Item label="Label" name="label" rules={[{ required: true, message: 'Please Input label!' }]}>
                                <Input
                                    size="default "
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12} style={{ padding: "3px" }}>
                            <Form.Item label="GST Number" name='gst' rules={[{ required: true, message: 'Please Input GST Number!' }]}>
                                <Input
                                    size="default "
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12} style={{ padding: "3px" }}>
                            <Form.Item label="Pan" name='pan' rules={[{ required: true, message: 'Please Input Pan' }]}>
                                <Input
                                    size="default "
                                />
                            </Form.Item>
                        </Col>
                        {/* <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="Email">
                <Input
                  size="default "
                  // placeholder="Email"
                  value={addBilling.branch.email}
                  onChange={(e) => inputHandler("email", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col> */}
                        {/* <Col span={12} style={{ padding: "3px" }}>
                            <Form.Item label="Mobile" name="mob" rules={[{ required: true, message: 'Please Input Mobile Number!' }]}>
                                <Input
                                    size="default "
                                />
                            </Form.Item>
                        </Col> */}
                        {/* <Col span={12} style={{ padding: "3px" }}>
              <Form.Item label="Fax Number">
                <Input
                  size="default "
                  // placeholder="Fax No"
                  value={addBilling.branch.fax}
                  onChange={(e) => inputHandler("fax", e.target.value)}
                  // prefix={<UserOutlined />}
                />
              </Form.Item>
            </Col> */}
                        <Col span={24} style={{ padding: "3px" }}>
                            <Form.Item label="Complete Address" name="address" rules={[{ required: true, message: 'Please input Complete Address' }]}>
                                <TextArea
                                    rows={4}
                                    maxLength={200}
                                />
                            </Form.Item>
                        </Col>
                    </>
                </Row>
            </Form>
            <Row justify="end">
                <Space>
                    <Button onClick={reset} size="default">
                        Reset
                    </Button>
                    <Button
                        size="default"
                        type="primary"
                        loading={submitLoading}
                        onClick={createAdress}
                    >
                        Submit
                    </Button>
                </Space>
            </Row>
        </Drawer>
    );
};

export default BillingDetails;
