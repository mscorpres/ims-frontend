import { useState } from "react";

const useLoading = () => {
  const [loading, setLoading] = useState([]);

  const updateLoading = (name, value) => {
    setLoading((curr) => {
      if (value) {
        if (!curr.includes(name)) {
          curr = [...curr, name];
        }
      } else {
        curr = curr.filter((row) => row !== name);
      }
      return curr;
    });
  };
  const getLoading = (name) => {
    return loading.includes(name);
  };

  return { loading: getLoading, setLoading: updateLoading };
};

export default useLoading;
