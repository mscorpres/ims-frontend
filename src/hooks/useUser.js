import { useDispatch, useSelector } from "react-redux";
import { setUser as reduxSetUser } from "../Features/loginSlice/loginSlice";

const useUser = () => {
  const { user } = useSelector((state) => state.login);
  const dispatch = useDispatch();
  const setUser = (values) => {
    const obj = {
      email: values.email,
      phone: values.phone,
      userName: values.userName,
      token: values.token,
      //   favPages: JSON.parse(values.fav_pages),
      type: values.userType,
      mobileConfirmed: values.other?.mobileConfirmed ?? "C",
      emailConfirmed: values.other?.emailConfirmed ?? "C",
      passwordChanged: values.other?.passwordChanged ?? "C",
      company_branch:
        JSON.parse(localStorage.getItem("otherData"))?.company_branch ??
        "BRMSC012",
      //   currentLink: JSON.parse(localStorage.getItem("otherData"))?.currentLink,
      id: values.userId,
      showlegal: values.department === "legal" ? true : false,
      session: "24-25",
    };

    dispatch(reduxSetUser(obj));
  };

  return { user, setUser };
};

export default useUser;
