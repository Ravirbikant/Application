import React from "react";
import ReactDOM from "react-dom";
import RecordScreen from "./components/RecordScreen";

const AppLayout = () => {
  return <RecordScreen />;
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<AppLayout />);
