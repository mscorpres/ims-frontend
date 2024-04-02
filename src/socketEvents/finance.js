import socket from "../Components/socket";
import { v4 } from "uuid";

export const downloadGSTReport = async (reportType, date) => {
  const payload = {
    notificationId: v4(),
    date,
  };
  let socketName;
  switch (reportType) {
    case "1":
      socketName = "gstrReport";
      break;
    case "2":
      socketName = "gstr3b";
      break;
  }

  socket.emit(socketName, JSON.stringify(payload));
};
