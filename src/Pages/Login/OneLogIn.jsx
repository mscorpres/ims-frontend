import {
  Card,
  Col,
  Drawer,
  Flex,
  Form,
  Input,
  Row,
  Space,
  Typography,
} from "antd";
import React from "react";
// import Laptop from "./../../../src/Images/laptop.png";
// import Notebook from "./../../../src/Images/notebook.jpg";
// import Phone from "./../../../src/Images/phone.jpg";
// import Tablet from "./../../../src/Images/tablet.png";
// import LogoPage from "./../../../src/Images/LogoPage.png";
import "./index.css";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
const OneLogIn = () => {
  document.addEventListener("DOMContentLoaded", function () {
    var myForm = document.getElementById("form");
    myForm.classList.add("visible");
  });

  // return (
  //   // <>
  //   //   {/* <div
  //   //     className="Box"
  //   //     style={{
  //   //       display: "inline-flex",
  //   //       height: "90%",
  //   //       width: "100vw",
  //   //       position: "relative",
  //   //     }}
  //   //   > */}
  //   //   <Row style={{ padding: "0px 10px", height: "100%" }}>
  //   //     {/* <Col> */}
  //   //     <div
  //   //       className="container"
  //   //       style={{ height: "100vh", width: "85vw", position: "relative" }}
  //   //     >
  //   //       <div>
  //   //         <img className="laptopsvg" src={Laptop} alt="React Logo" />
  //   //       </div>
  //   //       <div>
  //   //         <img className="Notebooksvg" src={Notebook} alt="React Logo" />
  //   //       </div>
  //   //       <div>
  //   //         <img className="Phonesvg" src={Phone} alt="React Logo" />
  //   //       </div>
  //   //       <div>
  //   //         <img className="Tabletsvg" src={Tablet} alt="React Logo" />
  //   //       </div>
  //   //     </div>
  //   //     {/* </Col>l */}
  //   //     {/* <Col span={16}></Col> */}
  //   //     <Space
  //   //       direction="vertical"
  //   //       size={24}
  //   //       style={{
  //   //         marginLeft: "51rem",
  //   //         position: "fixed",
  //   //         backgroundColor: "#fff",
  //   //       }}
  //   //       className="form"
  //   //     >
  //   //       {/* <Card
  //   //         // extra={<a href="#">More</a>}
  //   //         style={{
  //   //           width: 680,
  //   //           height: 600,
  //   //           backgroundColor: "#fff",
  //   //         }} */}
  //   //       {/* > */}
  //   //       <Col span={24} style={{ margin: "4rem 13rem" }}>
  //   //         <img src={LogoPage} alt="React Logo" />
  //   //       </Col>
  //   //       <Row
  //   //         justify="center"
  //   //         style={{ width: "100%", height: "100%" }}
  //   //         align="middle"
  //   //       >
  //   //         <Col span={24}>
  //   //           <div justify="center">
  //   //             <Flex justify="center" gap={5}>
  //   //               <Typography.Text>Sign In</Typography.Text>
  //   //             </Flex>
  //   //             <Form
  //   //               name="basic"
  //   //               layout="vertical"
  //   //               autoComplete="off"
  //   //               style={{ padding: "2rem", marginLeft: "8rem" }}
  //   //             >
  //   //               <Form.Item name=''>
  //   //                 <Col span={20}>
  //   //                   <Input
  //   //                     placeholder="Enter your username"
  //   //                     prefix={
  //   //                       <UserOutlined className="site-form-item-icon" />
  //   //                     }
  //   //                   />
  //   //                 </Col>
  //   //               </Form.Item>
  //   //               <Form.Item>
  //   //                 <Col span={20} style={{ marginTop: "2rem" }}>
  //   //                   <Input
  //   //                     placeholder="Enter your username"
  //   //                     prefix={
  //   //                       <LockOutlined className="site-form-item-icon" />
  //   //                     }
  //   //                   />
  //   //                 </Col>
  //   //               </Form.Item>
  //   //             </Form>
  //   //           </div>
  //   //         </Col>
  //   //       </Row>
  //   //       {/* </Card> */}
  //   //     </Space>
  //   //   </Row>
  //   //   {/* </div> */}
  //   // </>
  // );
};

export default OneLogIn;
