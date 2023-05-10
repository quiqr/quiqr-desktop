import React              from 'react';
import { List, ListItem } from 'material-ui-02/List';
import IconChevronRight   from '@material-ui/icons/ChevronRight';
import IconFileFolder     from '@material-ui/icons/Folder';
import { BaseDynamic }    from '../../HoForm';

class NestDynamic extends BaseDynamic {

  allocateStateLevel(field, parentState, rootState){
    if(field.groupdata==null||field.groupdata===true){
      if(parentState[field.key]===undefined)
        parentState[field.key]={};
      return parentState[field.key];
    }
    return parentState;
  }

  normalizeState({state, field, stateBuilder}){
    stateBuilder.setLevelState(state, field.fields);
  }


  extendField(field, fieldExtender){
    fieldExtender.extendFields(field.fields);
  }

  getType(){
    return 'nest';
  }

  buildBreadcumbFragment(node, buttons){
    buttons.push({label: node.field.title, node});
  }

  buildPathFragment(node : any){
    return node.field.key;
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath, nodePath, parentPath} = context;
    let {field} = node;

    if(currentPath===parentPath){
      let childLabels = field.fields.map((x) => x.title).join(', ');
      childLabels = `(${childLabels})`;
      return (<List style={{marginBottom:16, padding: 0}}><ListItem
      style={{ border: 'solid 1px #e8e8e8', borderRadius:'7px'}}
      onClick={function(){ context.setPath(node) } }
      leftIcon={<IconFileFolder color="disabled"/>}
      rightIcon={<IconChevronRight />}
      primaryText={field.title}
      secondaryText={childLabels}
    /></List>
      );
    }

    if(currentPath.startsWith(nodePath)){
      var state = node.state;
      return context.renderLevel({ field, state, parent: node });
    }

    return (null);
  }
}

export default NestDynamic;
