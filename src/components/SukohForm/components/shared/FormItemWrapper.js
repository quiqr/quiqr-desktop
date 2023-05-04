import React from 'react';
import DefaultWrapper from './DefaultWrapper';
import IconButtonGroup from '../../../IconButtonGroup';

class FormItemWrapper extends React.Component{

  render(){

    let { control, iconButtons } = this.props;

    let controlClone= React.cloneElement(control, { style:{transition:'none', boxSizing:'border-box', flex:1}});

    return (<DefaultWrapper style={Object.assign({display:'flex'}, this.props.style)}>
      { controlClone }
      {<IconButtonGroup iconButtons={iconButtons} style={{flex: '0 0 auto', alignSelf: 'flex-end', position:'relative', top:'-4px'}} />}
      </DefaultWrapper>);
  }

}

export default FormItemWrapper;
