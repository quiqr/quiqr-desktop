import React from 'react';
import DefaultWrapper from './DefaultWrapper';
import IconButtonGroup from '../../../IconButtonGroup';

class FormItemWrapper extends React.Component{

  render(){

    let controlClone = React.cloneElement(this.props.control, { style:{transition:'none', boxSizing:'border-box', flex:1}});

    return (
      <DefaultWrapper style={Object.assign({margin:'16px 0', display:'flex'}, this.props.style)}>
        { controlClone }
        {<IconButtonGroup iconButtons={this.props.iconButtons} style={{flex: '0 0 auto', alignSelf: 'flex-end', position:'relative', top:'-4px'}} />}
      </DefaultWrapper>
    );
  }

}

export default FormItemWrapper;
