import { useEffect, useState } from "react";

const useLoading = () => {
  const [loading, setLoading] = useState({});

  const handleLoading = (name, status) => {
    setLoading((curr) => ({
      ...curr,
      [name]: status,
    }));
  };

  const getLoading = (name) => {
    return loading[name];
  };
  useEffect(() => {
    if (loading) {
      setTimeout(() => {
        setLoading({});
      }, 30000);
    }
  }, [loading]);
  return [getLoading, handleLoading];
};

export default useLoading;
