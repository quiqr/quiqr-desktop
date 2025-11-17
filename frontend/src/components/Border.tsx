import React from "react";

interface BorderProps {
  style: React.CSSProperties;
  children: React.ReactElement;
}

const Border = ({ style, children }: BorderProps) => {
  return <div style={Object.assign({ border: "solid 1px #e8e8e8", borderRadius: "7px" }, style)}>{children}</div>;
};

export default Border;
