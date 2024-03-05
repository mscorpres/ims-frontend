import {
  ConfigProvider,
  Empty,
  List,
  Progress,
  Skeleton,
  Typography,
} from "antd";
import React from "react";
import { Link } from "react-router-dom";
import { CommonIcons } from "./TableActions.jsx/TableActions";
import { socketLink as axiosLink } from "../axiosInterceptor";
import { useEffect } from "react";

export default function Notifications({
  notifications,
  deleteNotification,
  source,
}) {
  const EmptyList = () => (
    <Empty
      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
      imageStyle={{
        height: 60,
      }}
      description={
        source == "messages" ? (
          <span>No new Messages</span>
        ) : (
          <span>No Notifications</span>
        )
      }
    ></Empty>
  );
  return (
    <ConfigProvider renderEmpty={EmptyList}>
      {window.innerWidth > 800 && (
        <div style={{ background: "white" }} className="notifications">
          <List
            bordered
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <span>
                    {item.type == "file" &&
                      (item.loading ||
                      (item.status == "pending" && item.total) ? (
                        <Progress
                          width={32}
                          type="circle"
                          percent={item.total}
                        />
                      ) : (
                        <a
                          href={
                            axiosLink.split(":")[1] +
                            "/" +
                            item.file?.substring(2)
                          }
                          download
                        >
                          <CommonIcons
                            loading={item.loading || item.status == "pending"}
                            action="downloadButton"
                            size="small"
                          />
                        </a>
                      ))}
                    {item.type == "msg" && (
                      <span>{JSON.parse(item?.other_data)?.message}</span>
                    )}
                  </span>,
                  // <CommonIcons
                  //   loading={item.loading}
                  //   action="closeButton"
                  //   size="small"
                  //   onClick={() => deleteNotification(item.ID)}
                  // />,
                ]}
              >
                {/* <Skeleton
                  paragraph={false}
                  style={{ marginTop: 15, width: 200 }}
                  wid
                  rows={2}
                  loading={item.loading}
                  active
                /> */}
                {/* {!item.loading && ( */}
                <>
                  {item.type == "message" ? (
                    <Link
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                      to="/messenger"
                    >
                      {!item.loading && (
                        <Typography.Text
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            fontWeight: "500",
                          }}
                        >
                          From: {item.title}
                        </Typography.Text>
                      )}
                      <br />
                      {!item.loading && (
                        <Typography.Text
                          style={{ margin: 0, fontSize: "0.7rem" }}
                        >
                          {item.message}
                        </Typography.Text>
                      )}
                    </Link>
                  ) : (
                    <div
                      style={{
                        flexDirection: "column",
                        alignItems: "flex-start",
                      }}
                    >
                      {/* {item.loading ? (
                        <Skeleton
                          paragraph={false}
                          style={{ marginTop: 15, width: 200 }}
                          wid
                          rows={2}
                          loading={item.loading}
                          active
                        />
                      ) : ( */}
                      <>
                        {" "}
                        <Typography.Text
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            fontWeight: "500",
                          }}
                        >
                          {item.title}
                        </Typography.Text>
                        <br />
                        <Typography.Text
                          style={{ margin: 0, fontSize: "0.7rem" }}
                        >
                          {item.details}
                        </Typography.Text>
                      </>
                      {/* )} */}
                    </div>
                  )}
                </>
                {/* // )} */}
              </List.Item>
            )}
          />
        </div>
      )}
    </ConfigProvider>
  );
}
