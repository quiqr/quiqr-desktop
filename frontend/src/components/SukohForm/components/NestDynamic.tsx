import React            from 'react';
import List             from '@mui/material/List';
import ListItemButton   from '@mui/material/ListItemButton';
import ListItemIcon     from '@mui/material/ListItemIcon';
import ListItemText     from '@mui/material/ListItemText';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FolderIcon       from '@mui/icons-material/Folder';
import { BaseDynamic, BaseDynamicProps, BaseDynamicState, FieldBase }  from '../../HoForm';

// Define field interface with all properties used by nest field type
export interface NestDynamicField extends FieldBase {
  title?: string;
  fields: any[]; // Array of nested field definitions
  groupdata?: boolean; // Controls whether child values nest under parent key (default: true)
}

// Define props type using the field interface
type NestDynamicProps = BaseDynamicProps<NestDynamicField>;

// Define state type with component-specific properties
type NestDynamicState = BaseDynamicState & {
  childLabels: string;
};

class NestDynamic extends BaseDynamic<NestDynamicProps, NestDynamicState> {
  constructor(props: NestDynamicProps){
    super(props);
    this.state = {
      childLabels: '',
      error_msg: ''
    };
  }

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

  buildBreadcrumbFragment(node, buttons){
    buttons.push({label: node.field.title, node});
  }

  buildPathFragment(node : any){
    return node.field.key;
  }

  componentDidMount(){
    let {context} = this.props;
    let {node, currentPath, parentPath} = context;
    let {field} = node;
    if(currentPath===parentPath){
      let childLabels = field.fields.map((x) => {
        return x.title || x.key
      }).join(', ');
      this.setState({childLabels: `(${childLabels})` })
    }
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath, nodePath, parentPath} = context;
    let {field} = node;

    if(currentPath===parentPath){
      return (
        <List style={{marginBottom:16, padding: 0}}>

          <ListItemButton
            style={{ padding: '20px 16px', border: 'solid 1px #d8d8d8', borderRadius:'7px'}}
            onClick={function(){ context.setPath(node) } }
          >
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>

            <ListItemText
              id={field.title}
              primary={`${field.title}`}
              secondary={this.state.childLabels}
            />
            <ChevronRightIcon />
          </ListItemButton>

        </List>
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
