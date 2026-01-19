import React from "react";
import DefaultWrapper from "./DefaultWrapper";
import IconButtonGroup from "../../../IconButtonGroup";

interface FormItemWrapperProps {
  control: React.ReactElement<{ style?: React.CSSProperties }>;
  iconButtons: React.ReactElement[];
  style?: React.CSSProperties;
}

const FormItemWrapper = ({ control, iconButtons, style }: FormItemWrapperProps) => {
  const controlClone = React.cloneElement(control, {
    style: { transition: "none", boxSizing: "border-box", flex: 1 },
  });

  return (
    <DefaultWrapper style={Object.assign({ margin: "16px 0", display: "flex" }, style)}>
      {controlClone}
      <IconButtonGroup iconButtons={iconButtons} style={{ flex: "0 0 auto", alignSelf: "flex-end", position: "relative", top: "-4px" }} />
    </DefaultWrapper>
  );
};

export default FormItemWrapper;
