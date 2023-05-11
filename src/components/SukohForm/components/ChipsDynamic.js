import React from 'react';
import DefaultWrapper from './shared/DefaultWrapper';
import Chips from '../../Chips';
import Tip from '../../Tip';
import { BaseDynamic } from '../../HoForm';

class ChipsDynamic extends BaseDynamic {

  normalizeState({state, field, stateBuilder}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || [];
    }
  }

  getType(){
    return 'chips';
  }

  deepEqual(array, otherArray){
    if(array.length !== otherArray.length)
      return false;

    for(let i = 0; i < array.length; i++){
      if(array[i] !== otherArray[i])
        return false;
    }

    return true;
  }

  handlePushItem(val){
    let context = this.props.context;
    let copy = context.value.slice(0);
    copy.push(val);
    context.setValue(copy);
  }

  handleSwap(e: Event, {index, otherIndex}: {index: number, otherIndex: number}){
    let context = this.props.context;
    let val = context.value.slice(0);
    let temp = val[otherIndex];
    val[otherIndex] = val[index];
    val[index] = temp;
    context.setValue(val);
  }

  handleRequestDelete(index: number){
    let context = this.props.context;
    let copy = context.value.slice(0);
    copy.splice(index,1);
    context.setValue(copy);
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath} = context;
    let {field} = node;

    if(currentPath!==context.parentPath){
      return (null);
    }

    let iconButtons = [];
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />);

    return (
      <DefaultWrapper>
        <Chips
          items={context.value}
          sortable={true}
          fullWidth={true}
          field={field}
          onRequestDelete={this.handleRequestDelete.bind(this)}
          onPushItem={this.handlePushItem.bind(this)}
          onSwap={this.handleSwap.bind(this)}
        />
      </DefaultWrapper>);
  }
}

export default ChipsDynamic;
