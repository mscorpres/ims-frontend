import { Avatar, Card, Col, Row, Space, Typography } from "antd";
import moment from "moment";
import React from "react";
import { CommonIcons } from "../../Components/TableActions.jsx/TableActions";

export default function Message({
  message,
  user,
  currentConversation,
  source,
}) {
  const chatFilePreview = (message) => (
    <Card
      bodyStyle={{ paddingRight: 75 }}
      style={{ width: "100%", marginTop: 5, marginBottom: 5 }}
      size="small"
    >
      <Row>
        <Col span={23}>
          <Typography.Text
            style={{ fontSize: "0.9rem", width: "90%" }}
            ellipsis={true}
            level={5}
          >
            {message?.fileName}
          </Typography.Text>
        </Col>
        <Col span={1}>
          <Space>
            <a href={message.filePath} target="_blank">
              <CommonIcons action="viewButton" />
            </a>
            <a href={message.filePath}>
              <CommonIcons action="downloadButton" />
            </a>
          </Space>
        </Col>
      </Row>
    </Card>
  );
  return (
    <Row
      justify={user?.id == message?.sender && "end"}
      gutter={8}
      style={{
        margin: "10px 0",
        width: "100%",

        flexDirection: user?.id == message?.sender && "row-reverse",
      }}
    >
      <Col
        span={24}
        style={{
          display: "flex",
          margin: 0,
          flexDirection: user?.id == message?.sender ? "row-reverse  " : "row",
          justifyContent: user?.id == message?.sender && "flex-start",
        }}
      >
        <Avatar
          style={{
            backgroundColor:
              user?.id == message?.sender ? "#245181" : "#808080",
            marginLeft: user?.id == message?.sender && 5,
            marginRight: user?.id != message?.sender && 5,
          }}
        >
          {user?.id == message?.sender
            ? `${user?.userName[0]}${user?.userName.split(" ")[1][0]}`
            : `${currentConversation?.receiver?.name[0]}${
                currentConversation?.receiver?.name.split(" ")[1][0]
              }`}
        </Avatar>
        <div
          style={{
            maxWidth: "70%",
            width: message?.messageType === "file" ? "85%" : "auto",
            background:
              user?.id == message?.sender
                ? message?.messageType === "text"
                  ? "#245181"
                  : "transparent"
                : message?.messageType === "text"
                ? "gray"
                : "transparent",
            color:
              user?.id == message?.sender
                ? message?.messageType === "text"
                  ? "white"
                  : "black"
                : message?.messageType === "text"
                ? "black"
                : "black",
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: user?.id == message?.sender && "end",
            padding: source == "modal" ? "5px 10px" : 10,
            fontSize: source == "modal" ? "0.9rem" : "0.85rem",
            lineHeight: 1.7,
          }}
        >
          {message?.messageType === "file" && chatFilePreview(message)}
          {message.messageType === "text" && (
            <p style={{ margin: 0 }}>{message?.text}</p>
          )}
          <br />
          <span
            style={{
              display: "block",
              width: "100%",
              textAlign: "end",
              fontSize: window.innerWidth < 1600 ? "0.8rem" : "0.8rem",
              marginTop: -17,
            }}
          >
            {moment(message.insert_dt).format("DD-MMM-YY hh:mm a")}
          </span>
        </div>
      </Col>
    </Row>
  );
}
