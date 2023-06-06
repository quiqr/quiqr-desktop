import React           from 'react';
import { BaseDynamic } from '../../HoForm';
import FormItemWrapper from './shared/FormItemWrapper';
import FontPicker      from "font-picker-react";
import Tip             from '../../Tip';

class FontPickerDynamic extends BaseDynamic {

  getType(){
    return 'font-picker';
  }

  normalizeState({state, field}){

    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || '';
    }

    if(!Number.isInteger(field.limit)){
      field.limit=10;
    }
    if(!Array.isArray(field.families)){
      field.families=[];
    }

    if(!Array.isArray(field.categories)){
      field.categories=[];
    }
    if(!Array.isArray(field.variants)){
      field.variants=[];
    }

    field.pickerId = Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);

  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath, parentPath} = context;
    let {field} = node;

    if(currentPath!==parentPath){
      return (null);
    }

    let iconButtons = [];
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />);

    return (
      <FormItemWrapper
        control={

          <div>
            <label style={{
              alignSelf: 'stretch',
              display:'block',
              lineHeight: '22px',
              fontSize:12,
              pointerEvents: 'none',
              userSelect: 'none',
              }}>{field.title}</label>


            <FontPicker
              pickerId={field.pickerId}
              apiKey="AIzaSyDb0hRL7w_7AAb4L8MFQNmi9pNpMC85oDU"
              activeFontFamily={context.value}

              limit={field.limit}
              families={field.families}
              variants={field.variants}
              categories={field.categories}

              onChange={(nextFont) => {
                this.props.context.setValue(nextFont.family)
                if(field.autoSave === true){
                  context.saveFormHandler();
                }
              }}
            />
            <div>
              <p className={"apply-font-"+field.pickerId}>
                the quick brown fox jumps over the lazy dog.<br/>
                THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.
              </p>
            </div>

          </div>

        }
        iconButtons={iconButtons}
      />);


  }
}

export default FontPickerDynamic;
