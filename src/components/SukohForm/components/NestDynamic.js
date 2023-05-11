import React            from 'react';
import List             from '@material-ui/core/List';
import ListItem         from '@material-ui/core/ListItem';
import ListItemIcon     from '@material-ui/core/ListItemIcon';
import ListItemText     from '@material-ui/core/ListItemText';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import FolderIcon       from '@material-ui/icons/Folder';
import { BaseDynamic }  from '../../HoForm';

class NestDynamic extends BaseDynamic {
  constructor(props){
    super(props);
    this.state = {
      childLabels: ''
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

  buildBreadcumbFragment(node, buttons){
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

          <ListItem
            style={{ padding: '20px 16px', border: 'solid 1px #d8d8d8', borderRadius:'7px'}}
            role={undefined}  button
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
          </ListItem>

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
