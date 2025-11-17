import React from 'react';

type DefaultWrapperProps = {
  style?: React.CSSProperties;
  children: React.ReactNode;
};

const DefaultWrapper = ({ style, children }: DefaultWrapperProps) => {
  return <div
  style={Object.assign({position : 'relative', paddingBottom: '8px', width:'100%'}, style)}>
  {children}
  </div>;
};

export default DefaultWrapper;
