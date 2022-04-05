import React from 'react';
import type {FormStateBuilder } from '../../HoForm';
import { BaseDynamic } from '../../HoForm';
//import FormItemWrapper from './shared/FormItemWrapper';
import FontPicker from "font-picker-react";
import Tip from '../../Tip';

type FontPickerDynamicField = {
  key: string,
  compositeKey: string,
  type: string,

  default: ?string,
  tip: ?string,
  title: ?string,

  families: ?Array<string>,
  variants: ?Array<string>,
  categories: ?Array<string>,
  limit: ?number,
}

type FontPickerDynamicState = {

}

class FontPickerDynamic extends BaseDynamic<FontPickerDynamicField,FontPickerDynamicState> {

  getType(){
    return 'font-picker';
  }

  normalizeState({state, field} : { state: any, field: FontPickerDynamicField, stateBuilder: FormStateBuilder }){

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
      <div>
        <FontPicker
        //pickerId={field.key}
        apiKey="AIzaSyDb0hRL7w_7AAb4L8MFQNmi9pNpMC85oDU"
        activeFontFamily={context.value}

        limit={field.limit}
        families={field.families}
        variants={field.variants}
        categories={field.categories}

        onChange={(nextFont) =>
            this.props.context.setValue(nextFont.family)
        }
        />
        <p className="apply-font">the quick brown fox jumps over the lazy dog.</p>
        <p className="apply-font">THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG.</p>
      </div>
    );
  }
}

export default FontPickerDynamic;
