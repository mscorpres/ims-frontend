const errorToast = (message) => {
  let msg = "";
  Object.values(message).forEach((val) => {
    if (val[0].length == 1) {
      msg = val;
    } else {
      msg = val[0];
    }
  });
  return msg;
};

export default errorToast;
