import { useEffect, useState, useRef } from "react";
import {
  Avatar,
  Button,
  Col,
  ConfigProvider,
  Empty,
  Input,
  List,
  Row,
  Skeleton,
  Space,
  Typography,
} from "antd";
import Message from "./Message";
import { SendOutlined } from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux/es/exports";
import socket from "../../Components/socket";
import { toast } from "react-toastify";
import { removeNotification } from "../../Features/loginSlice/loginSlice";
import { imsAxios } from "../../axiosInterceptor";

export default function Messenger() {
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
  const dispatch = useDispatch();

  let lastMessageRef = useRef();
  useEffect(() => {
    if (user) {
      // socket = io("http://localhost:3001", {
      //   extraHeaders: {
      //     token: user.token,
      //   },
      // });
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
    socket.emit("socket_join_room", {
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
        socket.emit("send_chat_msg", {
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
          },
        ]);
        setConversations(arr);
        setNewMessage("");
      } else {
        toast.error(data.message.msg);
      }
    }
  };
  const searchUsers = async (search) => {
    const { data } = await imsAxios.post("backend/fetchAllUser", {
      search: search,
    });
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
      console.log(conversations);
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
        // console.log(arr);
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
  return (
    <div
      style={{
        height: "100vh",
        // overflowY: "hidden",
        // paddingTop: currentConversation && "5vh",
      }}
    >
      <Row style={{ height: "100%" }}>
        {/* conversations area */}
        <Col span={4} style={{ boxShadow: "2px 0px 4px 0px gray" }}>
          <Row style={{ padding: 15 }}>
            <Col span={24}>
              <Input
                allowClear
                style={{ borderBottom: "1px solid #245181", borderRadius: 0 }}
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
                dataSource={userSearchList}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => handleSearchedUserClick(item)}
                    className="messenger-user"
                  >
                    <List.Item.Meta
                      avatar={<Avatar />}
                      title={
                        <span style={{ fontSize: "0.9rem" }}>{item.fname}</span>
                      }
                      // description={
                      //   <span style={{ fontSize: "0.7rem" }}>
                      //     {/* {item.lastMessage} */}
                      //     last message
                      //   </span>
                      // }
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
                      background:
                        item.conversationId ==
                          currentConversation?.conversationId && "#D3D3D3",
                    }}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          style={{ background: "#808080", marginRight: -8 }}
                        >{`${item.receiver?.name[0]}${
                          item.receiver?.name?.split(" ")[1][0]
                        }`}</Avatar>
                      }
                      title={
                        <Typography.Title
                          level={5}
                          ellipsis={true}
                          style={{
                            fontSize: "0.9rem",
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
                          {/* {item.lastMessage} */}
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
        {currentConversation && (
          <Col span={20} style={{ height: "100%" }}>
            <div align="top" style={{ height: "100%", width: "100%" }}>
              {/* user header row */}
              <Col
                span={24}
                style={{
                  height: "7%",
                  // background: "red",
                  boxShadow: "2px 0px 4px 0px gray",
                  padding: "0 10px",
                }}
              >
                <Space align="center" style={{ height: "100%" }}>
                  <Avatar style={{ background: "#808080" }}>{`${
                    currentConversation?.receiver?.name[0]
                  }${
                    currentConversation?.receiver?.name.split(" ")[1][0]
                  }`}</Avatar>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    {currentConversation?.receiver?.name}
                  </Typography.Title>
                </Space>
              </Col>
              <Col
                span={24}
                style={{
                  height: "80%",
                  // maxHeight: "50%",
                  // maxHeight: "80vh",
                  overflowY: "scroll",
                  width: "100%",
                  padding: "5px 10px",
                }}
              >
                <Skeleton active loading={getMessagesLoading} />
                <Skeleton active loading={getMessagesLoading} />
                <Skeleton active loading={getMessagesLoading} />
                <Skeleton active loading={getMessagesLoading} />
                <Skeleton active loading={getMessagesLoading} />
                {!getMessagesLoading &&
                  messages?.map((message) => (
                    <Message
                      currentConversation={currentConversation}
                      key={message?.id}
                      message={message}
                      user={user}
                    />
                  ))}
                <p style={{ height: 0 }} ref={lastMessageRef}></p>
              </Col>
              <Col
                span={24}
                style={{
                  height: "8%",
                  display: "flex",
                  alignItems: "cener",
                  boxShadow: "2px 0px 5px 0px gray",
                  // background: "#245181",
                }}
              >
                <Row
                  align="middle"
                  gutter={16}
                  style={{ padding: "0px 20px", width: "100%" }}
                >
                  <Col span={23} style={{ paddingBottom: 0 }}>
                    <Input
                      bordered={false}
                      placeholder="Type a message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      style={{ borderBottom: "2px solid #245181" }}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          if (e.target.value.length > 0) {
                            sendMessage();
                          }
                        }
                      }}
                    />
                  </Col>
                  <Col span={1}>
                    <Button
                      shape="circle"
                      size="large"
                      type="primary"
                      loading={sendMessageLoading}
                      onClick={sendMessage}
                      icon={<SendOutlined />}
                    />
                  </Col>
                </Row>
              </Col>
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
}
