import io from "socket.io-client";
import { socketLink } from "../axiosInterceptor";
const userToken = JSON.parse(localStorage.getItem("loggedInUser"))?.token;
const companyBranch = JSON.parse(
  localStorage.getItem("otherData")
)?.company_branch;

export default io(socketLink, {
  extraHeaders: {
    token: userToken,
  },
  auth: {
    token: userToken,
    companyBranch: companyBranch,
  },
  transports: ["websocket"],
});
