import axios from "axios";
import { imsAxios } from "../axiosInterceptor";

export const verifyToken = async (token) => {
  console.log("setting header auth otken", token);
  const response = await imsAxios.get(
    "/auth/isValid",

    {
      headers: {
        "x-csrf-token": token.replaceAll(" ", "+"),
      },
    }
  );

  return response;
};

export const getDetails = async () => {
  const response = await imsAxios.get("/profile/userDetails");
  console.log("getDetails response", response);
  if (response.data.code === 200) {
    const values = response.data.data;
    response.data = {
      success: true,
      data: {
        email: values.email,
        lastEmailChange: values.lastemail_change,
        lastMobileChange: values.lastmobile_change,
        lastNameChange: values.lastname_change,
        lastPasswordChange: values.lastpassword_change,
        name: values.name,
        phone: values.phone,
        userType: values.type,
        userName: values.name,
      },
      message: null,
      error: false,
    };
    return response.data;
  }
  return response;
};
