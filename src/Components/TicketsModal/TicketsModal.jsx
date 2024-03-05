import { useEffect, useState } from "react";
import { Button, Card, Col, Drawer, Modal, Row, Typography } from "antd";
import { useSelector } from "react-redux";
import { imsAxios } from "../../axiosInterceptor";
import { toast } from "react-toastify";
import ToolTipEllipses from "../ToolTipEllipses";
import { Link } from "react-router-dom";
import Loading from "../Loading";
const axiosLink = "https://support.mscorpres.online";

export default function TicketsModal({ open, handleClose }) {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const { user } = useSelector((state) => state.login);

  // getting tickets list
  const getTickets = async () => {
    setLoading("fetching");
    const response = await imsAxios.post(`/chat/get-pendingTicket`, {
      email: user.email,
    });
    setLoading(false);
    const { data } = response;
    if (data) {
      if (data.code === 200) {
        setTickets(data.data);
      } else {
        toast.error(data.message.msg);
      }
    }
  };

  useEffect(() => {
    if (open) {
      getTickets();
    } else {
      setTickets([]);
    }
  }, [open]);
  return (
    <Drawer
      title="Your Tickets"
      placement="right"
      onClose={handleClose}
      open={open}
      width={800}
      bodyStyle={{ padding: 5 }}
      extra={
        <Button href={`${axiosLink}/open.php`} target="_blank" type="link">
          Open a new Ticket
        </Button>
      }
    >
      {loading && <Loading />}
      {tickets.map((ticket) => (
        <Card size="small">
          <Row gutter={(6, 4)}>
            <Col span={8}>
              <Typography.Text strong>Date: </Typography.Text>
              <Typography.Text>{ticket.date}</Typography.Text>
            </Col>
            <Col span={8}>
              <Typography.Text strong>Priority: </Typography.Text>
              <Typography.Text>{ticket.priority}</Typography.Text>
            </Col>
            <Col span={8}>
              <Typography.Text strong>Ticket No.: </Typography.Text>
              <Typography.Text strong>
                <a
                  target="_blank"
                  href={`${axiosLink}/view.php?e=${user.email}&t=${ticket.ticket}`}
                >
                  <Typography.Text style={{ color: "blue" }} copyable={true}>
                    {ticket.ticket}
                  </Typography.Text>
                </a>
              </Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text strong>Subject: </Typography.Text>
              <Typography.Text>{ticket.subject}</Typography.Text>
            </Col>
            <Col span={24}>
              <Typography.Text strong>Status</Typography.Text>
              <Typography.Text>
                {ticket.status === "O"
                  ? "Open"
                  : ticket.status === "A"
                  ? "Archived"
                  : ticket.status === "C"
                  ? "Closed"
                  : ticket.status === "R"
                  ? "Resolved"
                  : ticket.status === "D" && "Deleted"}
              </Typography.Text>
            </Col>
          </Row>
        </Card>
      ))}
    </Drawer>
  );
}
