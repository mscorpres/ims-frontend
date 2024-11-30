import axios from "axios";
import { imsAxios } from "../axiosInterceptor";

export const verifyToken = async (token) => {
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

export const sendOtp = async (email) => {
  const response = await imsAxios.get(`/auth/sendOtp?email=${email}`);
  return response;
};

export const verifyOtp = async (email, otp) => {
  const response = await imsAxios.get(
    `/auth/verifyOtp?email=${email}&otp=${otp}`
  );
  return response;
};

export const updatePassword = async (email, password) => {
  const response = await imsAxios.patch(`/auth/updatePassword`, {
    email,
    password,
  });

  return response;
};
