import React           from 'react';
import IconButton      from '@material-ui/core/IconButton';
import RemoveIcon      from '@material-ui/icons/Remove';
import AddIcon         from '@material-ui/icons/Add';
import Button          from '@material-ui/core/Button';
import DefaultWrapper  from './shared/DefaultWrapper';
import IconButtonGroup from '../../IconButtonGroup';
import { BaseDynamic } from '../../HoForm';

class TextFieldLabelMock extends React.Component{
  render(){
    return <label style={{
      display:'block', lineHeight: '22px', fontSize:12, pointerEvents: 'none', userSelect: 'none',  }}>{this.props.children}</label>;
  }
}

class LeafArrayDynamic extends BaseDynamic {

  normalizeState({state, field}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || [];
    }
  }

  getType(){
    return 'leaf-array';
  }

  deepEqual(array: Array<any>, otherArray: Array<any>) : bool{
    if(array.length !== otherArray.length)
      return false;

    for(let i = 0; i < array.length; i++){
      if(array[i] !== otherArray[i])
        return false;
    }

    return true;
  }

  pushEmptyValue(){
    let context = this.props.context;
    let childField = Object.assign({}, Object.assign({}, this.props.context.node.field.field));
    childField.key = context.value.length;
    let childComponentProplessInstance = context.form.props.componentRegistry.getProplessInstance(childField.type);
    let valueCopy = context.value.slice(0);
    childComponentProplessInstance.normalizeState({state:valueCopy, field:childField});
    context.setValue(valueCopy);
  }

  getOnRequestDeleteHandler(index) {
    return () => {
      let context = this.props.context;
      let copy = context.value.slice(0);
      copy.splice(index,1);
      context.setValue(copy);
    };
  }

  getOnItemChange(index){
    return (value : any) => {
      let context = this.props.context;
      let copy = context.value.slice(0);
      copy[index] = value;
      context.setValue(copy);
    };
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath} = context;
    let {field} = node;

    if(currentPath!==context.parentPath){
      return (null);
    }

    let arrayData = context.value;
    return (
      <DefaultWrapper>
        <TextFieldLabelMock>{field.title}</TextFieldLabelMock>
        {arrayData.map((item, index)=>{
          let childNode = {
            state: context.value,
            field: Object.assign({}, field.field, { key:index }),
            parent: context.node.parent
          };
          return (
            <div key={field.key + '-item-'+index} style={{ display:'flex', width:'100%' }}>
              { context.renderField(childNode, this.getOnItemChange(index)) }
              <IconButtonGroup
                style={{flex: '0 0 auto', alignSelf: 'flex-end', position:'relative', top:'-20px'}}
                iconButtons={[
                  <IconButton aria-label="clear"  onClick={this.getOnRequestDeleteHandler(index)}> <RemoveIcon /> </IconButton>
                ]
                } />
            </div>
          );
        })}

        <Button style={{marginTop:10}} endIcon={<AddIcon />} variant="contained" onClick={()=>{this.pushEmptyValue()}}>Add</Button>
      </DefaultWrapper>);
  }
}

export default LeafArrayDynamic;
