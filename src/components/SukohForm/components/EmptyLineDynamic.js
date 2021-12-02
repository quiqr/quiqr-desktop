import React from 'react';
import { BaseDynamic } from '../../HoForm';

type EmptyLineDynamicField = {
  key: string,
  compositeKey: string,
  type: string,
  amount: ?number
}

type EmptyLineDynamicState = {

}

class EmptyLineDynamic extends BaseDynamic<EmptyLineDynamicField, EmptyLineDynamicState> {

  getType(){
    return 'empty-line';
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath, parentPath} = context;
    let {field} = node;

    if(currentPath!==parentPath){ return (null); }
    let amount = field.amount||1;
    let lines = [];
    let idx;
    for (idx = 0; idx < amount; idx++) {
      lines.push(<br key={idx}/>)
    }

    return (<div>
      {lines}

      </div>);
  }
}

export default EmptyLineDynamic;
