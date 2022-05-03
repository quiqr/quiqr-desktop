import React from 'react';

class DefaultWrapper extends React.Component{
  render() {
    return <div
    style={Object.assign({position : 'relative', paddingBottom: '8px', width:'100%'}, this.props.style)}>
    {this.props.children}
    </div>;
  }
}

export default DefaultWrapper;
