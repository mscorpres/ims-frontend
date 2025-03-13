import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Col,
  Input,
  List,
  Row,
  Typography,
  Skeleton,
  ConfigProvider,
  Empty,
  Drawer,
  Upload,
  Card,
} from "antd";
import { useSelector, useDispatch } from "react-redux/es/exports";
import socket from "../../Components/socket";
import { toast } from "react-toastify";
import { removeNotification } from "../../Features/loginSlice/loginSlice";
import { SendOutlined, PaperClipOutlined } from "@ant-design/icons";
import Message from "../../Pages/Messenger/Message";
import "./messageModal.css";
import ToolTipEllipses from "../ToolTipEllipses";
import TableActions, { CommonIcons } from "../TableActions.jsx/TableActions";
import { imsAxios } from "../../axiosInterceptor";
import { SiSocketdotio } from "react-icons/si";

export default function MessageModal({
  showMessageDrawer,
  setShowMessageDrawer,
}) {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [userSearchList, setUserSearchList] = useState(null);
  const [arrivedMessage, setArrivedMessage] = useState(null);
  const { user, notifications } = useSelector((state) => state.login);
  const [sendMessageLoading, setSendMessageLoading] = useState(false);
  const [getMessagesLoading, setGetMessagesLoading] = useState(false);
  const [getConversationsLoading, setGetConversationLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);

  const dispatch = useDispatch();

  let lastMessageRef = useRef();
  useEffect(() => {
    if (user) {
      getAllConverations();
    }
  }, []);

  const getAllConverations = async () => {
    setGetConversationLoading(true);
    const { data } = await imsAxios.get("/chat/get-conversations");
    setGetConversationLoading(false);
    if (data.code == 200) {
      setConversations(data.data);
    }
  };
  const getAllConverationById = async (rec) => {
    SiSocketdotio.emit("socket_join_room", {
      conversationId: rec.conversationId,
    });
    setGetMessagesLoading(true);
    const { data } = await imsAxios.post("/chat/get-conversationById", {
      conversationId: rec.conversationId,
    });
    setGetMessagesLoading(false);
    setCurrentConversation(rec);
    if (data.code == 200) {
      setMessages(data.data);
    }
    let arr = conversations.map((conv) => {
      if (conv.conversationId == rec.conversationId) {
        return {
          ...conv,
          newMessage: false,
        };
      } else {
        return conv;
      }
    });
    setConversations(arr);
  };
  const sendMessage = async () => {
    if (newMessage.length > 0) {
      setSendMessageLoading(true);

      const { data } = await imsAxios.post("/chat/save-messages", {
        text: newMessage,
        conversationId: currentConversation.conversationId,
        receiver: currentConversation.receiver.id,
        // sender: user?.id,
      });
      setSendMessageLoading(false);
      if (data.code == 200) {
        SiSocketdotio.emit("send_chat_msg", {
          // senderId: receiver.unique_id,
          receiver: data.data.receiver,
          text: data.data.text,
          conversationId: data.data.conversationId,
          senderName: user.userName,
          sender: user?.id,
        });
        let arr = conversations.map((conv) => {
          if (conv.conversationId == currentConversation.conversationId) {
            return {
              ...conv,
              lastMessage: newMessage,
            };
          } else {
            return conv;
          }
        });
        let item = arr.filter(
          (conv) => conv.conversationId == currentConversation.conversationId
        )[0];
        if (item) {
          arr = arr.filter(
            (conv) => conv.conversationId != currentConversation.conversationId
          );

          arr = [item, ...arr];
        }
        setMessages((mes) => [
          ...mes,
          {
            receiver: data.data.receiver,
            text: data.data.text,
            conversationId: data.data.conversationId,
            senderName: user.userName,
            sender: user?.id,
            messageType: "text",
          },
        ]);
        setConversations(arr);
        setNewMessage("");
      } else {
        toast.error(data.message.msg);
      }
    } else if (uploadingFile) {
      // creating the form data
      let formData = new FormData();
      let otherData = {
        receiver: currentConversation.receiver.id,
        conversationId: currentConversation.conversationId,

        messageType: "file",
      };
      formData.append("uploaded_file", uploadingFile);
      formData.append("otherData", JSON.stringify(otherData));
      // sending file and other data through api
      const { data } = await imsAxios.post(
        "/chat//save-messages-files",
        formData
      );
      if (data.code == 200) {
        SiSocketdotio.emit("send_chat_msg", {
          // senderId: receiver.unique_id,
          receiver: data.data.receiver,
          conversationId: data.data.conversationId,
          senderName: user.userName,
          sender: user?.id,
          path: data.data.filePath,
          fileName: data.data.fileName,
          messageType: "file",
        });
        let arr = conversations.map((conv) => {
          if (conv.conversationId == currentConversation.conversationId) {
            return {
              ...conv,
              lastMessage: newMessage,
            };
          } else {
            return conv;
          }
        });
        let item = arr.filter(
          (conv) => conv.conversationId == currentConversation.conversationId
        )[0];
        if (item) {
          arr = arr.filter(
            (conv) => conv.conversationId != currentConversation.conversationId
          );

          arr = [item, ...arr];
        }
        setMessages((mes) => [
          ...mes,
          {
            receiver: data.data.receiver,
            conversationId: data.data.conversationId,
            senderName: user.userName,
            sender: user?.id,
            path: data.data.filePath,
            fileName: data.data.fileName,
            messageType: "file",
          },
        ]);
        setConversations(arr);
        setUploadingFile(false);
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const searchUsers = async (search) => {
    setGetConversationLoading(true);
    const { data } = await imsAxios.post("backend/fetchAllUser", {
      search: search,
    });
    setGetConversationLoading(false);
    if (data[0].id == 0) {
      setUserSearchList([]);
    } else {
      let arr = data.map((u) => {
        return {
          ...u,
          fname: u.text,
        };
      });
      arr = arr.filter((u) => u.id != user.id);
      setUserSearchList(arr);
    }
  };
  const handleSearchedUserClick = async (searchedUser) => {
    let newObj = {
      conversationId: 0,
      lastMessage: "",
      newMessage: false,
      receiver: {
        id: searchedUser.id,
        name: searchedUser.fname,
      },
    };
    const { data } = await imsAxios.post("/chat/checkConvertation", {
      user: searchedUser.id,
    });
    if (data.code == 200) {
      setUserSearch("");

      setCurrentConversation({
        ...newObj,
        conversationId: data.data.conversationId,
      });
      newObj = { ...newObj, conversationId: data.data.conversationId };
      setMessages(data.data.messages);
      let exist = conversations.filter(
        (conv) => conv.conversationId == data.data.conversationId
      )[0];
      if (exist) {
        let arr = conversations;
        arr = arr.filter((conv) => conv.conversationId != exist.conversationId);
        arr = conversations.map((conv) => {
          if (conv.conversationId == data.data.conversationId) {
            return {
              ...conv,
              newMessage: false,
            };
          } else {
            return conv;
          }
        });
        setConversations(arr);
      } else {
        let arr = conversations;
        arr.push(newObj);
        setConversations(arr);
      }
    }
  };
  const updateConversations = async (notification) => {
    let exist = conversations.filter(
      (conv) => conv.conversationId == notification.conversationId
    )[0];
    if (!exist) {
      let newConversation = {
        conversationId: notification.conversationId,
        lastMessage: notification.text,
        newMessage: true,
        receiver: {
          id: notification.sender,
          name: notification.senderName,
        },
      };

      let arr = conversations;
      arr = [newConversation, ...arr];

      setConversations(arr);
    } else {
      let arr = conversations;
      let item = arr.filter(
        (conv) => conv.conversationId == notification.conversationId
      )[0];
      item = { ...item, newMessage: true, lastMessage: notification.text };
      if (item) {
        arr = arr.filter(
          (conv) => conv.conversationId != notification.conversationId
        );
        arr.unshift(item);
      }
      setConversations(arr);
    }
  };
  const filePreview = () => (
    <Card size="small">
      <Row>
        <Col span={23}>
          <Typography.Title level={5}>{uploadingFile?.name}</Typography.Title>
        </Col>
        <Col span={1}>
          <TableActions
            action="cancel"
            onClick={() => setUploadingFile(false)}
          />
        </Col>
      </Row>
    </Card>
  );

  useEffect(() => {
    if (userSearch.length > 0) {
      searchUsers(userSearch);
    } else {
      setUserSearchList(null);
    }
  }, [userSearch]);
  useEffect(() => {
    let arr = conversations;
    if (notifications[0]?.type == "message") {
      updateConversations(notifications[0]);
    }
    notifications.map((not) => {
      if (currentConversation && not.type == "message") {
        setArrivedMessage(not);
        arr = conversations.map((conv) => {
          if (not.type == "message") {
            if (conv?.conversationId == not?.conversationId) {
              return {
                ...conv,
                lastMessage: not.text,
                newMessage: true,
              };
            } else {
              return conv;
            }
          }
        });
      }
    });
  }, [notifications]);
  useEffect(() => {
    if (arrivedMessage?.conversationId == currentConversation?.conversationId) {
      setMessages((mes) => [...mes, arrivedMessage]);
    }
  }, [arrivedMessage]);
  useEffect(() => {
    lastMessageRef?.current?.scrollIntoView();
  }, [messages]);
  useEffect(() => {
    if (currentConversation) {
      dispatch(
        removeNotification({
          conversationId: currentConversation.conversationId,
        })
      );
    }
  }, [currentConversation]);

  const customizeRenderEmpty = (description) => (
    <div>
      <Empty
        style={{
          textAlign: "center",
        }}
        image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
        imageStyle={{
          height: 40,
        }}
        description={description}
      ></Empty>
    </div>
  );
  const props = {
    name: "file",
    action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
    headers: {
      authorization: "authorization-text",
    },
    showUploadList: false,
    beforeUpload(info) {
      setUploadingFile(info);
    },
  };
  return (
    <Drawer
      onClose={() => setShowMessageDrawer(false)}
      open={showMessageDrawer}
      width="45vw"
      bodyStyle={{ overflow: "hidden", padding: 0 }}
      className="message-modal"
      closable={false}
      destroyOnClose={true}
    >
      <Row
        style={{
          height: "100%",
          width: "100%",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* conversations area */}
        <Col
          span={6}
          style={{
            borderRight: "1px solid #D3D3D3",
            position: "sticky",
            top: 0,
            height: "100%",
          }}
        >
          <Row style={{ marginBottom: 5 }}>
            <Col className="search-user" span={24} style={{ marginTop: 14 }}>
              <Input
                allowClear
                style={{
                  borderBottom: "1px solid #D3D3D3",
                  borderRadius: 0,
                }}
                bordered={false}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search Users..."
              />
            </Col>
          </Row>

          {userSearchList && (
            <ConfigProvider
              renderEmpty={() => customizeRenderEmpty("No chat found")}
            >
              <List
                loading={getConversationsLoading}
                itemLayout="horizontal"
                style={{ overflowY: "auto", height: "100%" }}
                dataSource={userSearchList}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => handleSearchedUserClick(item)}
                    className="messenger-user"
                  >
                    <List.Item.Meta
                      title={
                        <Typography.Title
                          level={5}
                          ellipsis={true}
                          style={{
                            fontSize: "0.8rem",
                          }}
                        >
                          <ToolTipEllipses text={item.fname}>
                            {item.fname}
                          </ToolTipEllipses>
                        </Typography.Title>
                      }
                    />
                  </List.Item>
                )}
              />
            </ConfigProvider>
          )}
          {!userSearchList && (
            <ConfigProvider
              renderEmpty={() => customizeRenderEmpty("Search a user to chat")}
            >
              <List
                style={{ overflowY: "auto", height: "100%" }}
                loading={getConversationsLoading}
                itemLayout="horizontal"
                dataSource={conversations}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => getAllConverationById(item)}
                    className={`messenger-user ${
                      item.newMessage && "new-message"
                    }`}
                    style={{
                      margin: "0px 10px",
                      background:
                        item.conversationId ==
                          currentConversation?.conversationId && "#D3D3D3",
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <Typography.Title
                          level={5}
                          ellipsis={true}
                          style={{
                            fontSize: "0.8rem",
                            color: item?.newMessage && "white",
                            marginBottom: -1,
                          }}
                        >
                          {item.receiver?.name?.split(" ")[0]}
                        </Typography.Title>
                      }
                      description={
                        <Typography.Paragraph
                          ellipsis={true}
                          style={{
                            fontSize: "0.7rem",
                            color: item?.newMessage && "white",
                            marginBottom: -3,
                          }}
                        >
                          {item?.lastMessage ?? ""}
                        </Typography.Paragraph>
                      }
                    />
                  </List.Item>
                )}
              />
            </ConfigProvider>
          )}
        </Col>
        {/* chat area */}
        {currentConversation || getMessagesLoading ? (
          <Col span={18} style={{ height: "100%", paddingTop: "6%" }}>
            {/* user header row */}
            <Col
              span={24}
              style={{
                height: 45,
                display: "flex",
                alignItems: "center",
                borderBottom: "1px solid #D3D3D3",
                padding: "0 10px",
              }}
            >
              <Typography.Title
                level={5}
                style={{ margin: 0, fontSize: "0.9rem" }}
              >
                {currentConversation?.receiver?.name}
              </Typography.Title>
            </Col>
            {/* messages area col */}
            <Col
              span={24}
              style={{
                height: uploadingFile ? "89%" : "93%",
                overflowY: "scroll",
                width: "100%",
                padding: "0px 10px",
              }}
            >
              <Skeleton active loading={getMessagesLoading} />
              <Skeleton active loading={getMessagesLoading} />
              <Skeleton active loading={getMessagesLoading} />

              {!getMessagesLoading &&
                messages?.map((message) => (
                  <>
                    {/* {message && message?.messageType !== "file" && ( */}
                    <Message
                      currentConversation={currentConversation}
                      key={message?.id}
                      message={message}
                      user={user}
                      source="modal"
                    />
                    {/* // )} */}
                    {/* {message &&
                      message?.messageType === "file" &&
                      chatFilePreview(message)} */}
                  </>
                ))}

              <p style={{ height: 0 }} ref={lastMessageRef}></p>
            </Col>
            {/* file preview name before sending */}

            {uploadingFile && (
              <Col span={24} style={{ height: "5%" }}>
                {filePreview()}
              </Col>
            )}
            {/* send message  col */}
            <Col style={{ height: "7%" }}>
              <Row
                align="middle"
                gutter={16}
                style={{ width: "100%", height: "100%" }}
              >
                <Col
                  span={2}
                  style={{
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: 10,
                    paddingLeft: 25,
                    cursor: "pointer",
                    alignItems: "center",
                  }}
                >
                  <Upload {...props}>
                    <PaperClipOutlined style={{ fontSize: "1.5rem" }} />
                  </Upload>
                </Col>
                <Col
                  className="send-message"
                  span={20}
                  style={{ paddingBottom: 0 }}
                >
                  <Input
                    bordered={false}
                    placeholder="Type a message"
                    disabled={uploadingFile}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        if (e.target.value.length > 0) {
                          sendMessage();
                        }
                      }
                    }}
                    style={{ borderBottom: "2px solid #245181" }}
                  />
                </Col>
                <Col span={2}>
                  <Button
                    shape="circle"
                    size="default"
                    type="primary"
                    loading={sendMessageLoading}
                    onClick={sendMessage}
                    icon={<SendOutlined />}
                  />
                </Col>
              </Row>
            </Col>
          </Col>
        ) : (
          <Col
            span={19}
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: 30,
            }}
          >
            <Typography.Title style={{ color: "#D3D3D3" }} level={4}>
              Please select a chat
            </Typography.Title>
          </Col>
        )}
      </Row>
    </Drawer>
  );
}
