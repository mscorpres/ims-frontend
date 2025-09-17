import { LinearProgress } from "@mui/material";
import React from "react";

const Loader: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center w-full h-full bg-white">
      <div className="absolute top-0 left-0 right-0 w-full h-full opacity-50">
        <LinearProgress />
      </div>
      <img src="/assets/images/ms.png" alt="lMscorpres Logo" className="w-[500px] opacity-50" />
    </div>
  );
};

export default Loader;
