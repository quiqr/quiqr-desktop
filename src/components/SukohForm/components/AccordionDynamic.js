import React                        from 'react';
import { List, ListItem }           from 'material-ui-02/List';
import RaisedButton                 from 'material-ui-02/RaisedButton';
import IconAdd                      from 'material-ui-02/svg-icons/content/add';
import IconRemove                   from 'material-ui-02/svg-icons/content/clear';
import IconSort                     from 'material-ui-02/svg-icons/editor/drag-handle';
import IconChevronRight             from 'material-ui-02/svg-icons/navigation/chevron-right';
import IconFileFolder               from 'material-ui-02/svg-icons/file/folder';
import { FlatButton }               from 'material-ui-02';
import { Accordion, AccordionItem } from '../../Accordion'
import DangerButton                 from '../../DangerButton';
import dynamicComponentUtils        from './shared/dynamic-component-utils'
import service                      from '../../../services/service';

import type { DynamicFormNode, ComponentProps, FieldBase } from '../../HoForm';

import { BaseDynamic, FieldsExtender, FormStateBuilder } from '../../HoForm';

const Fragment = React.Fragment;

type AccordionDynamicField = {
  title:string,
  fields:Array<any>
} & FieldBase;

type AccordionDynamicState = {
  index: ?number,
  dragFromIndex: ?number,
  dragToIndex: ?number
}

class AccordionDynamic extends BaseDynamic<AccordionDynamicField, AccordionDynamicState> {

  documentMouseUpListener: ()=>void;

  constructor(props: ComponentProps<AccordionDynamicField>){
    super(props);

    this.orgNode = null;
    this.state = {
      index: null,
      dragFromIndex: null,
      dragToIndex: null,
      dynFields: {},
      dynFieldsEmpty: []
    };
  }

  extendField(field: AccordionDynamicField, fieldExtender: FieldsExtender){
    fieldExtender.extendFields(field.fields);
  }

  getType(){
    return 'accordion';
  }

  normalizeState({state, field, stateBuilder} : { state: any, field: AccordionDynamicField, stateBuilder: FormStateBuilder }){
    dynamicComponentUtils.normalizeStateForArrayOfObject(state, field, stateBuilder);
  }

  buildBreadcumbFragment(currentNode: DynamicFormNode<AccordionDynamicField>, items: Array<{label: string, node:?DynamicFormNode<FieldBase>}>): void{
    if(items.length>0){ //has a previous item
      var previousItem = items[items.length-1];
      if(previousItem.node==null||previousItem.node.uiState==null){
        throw new Error('Unexpected state');
      }
      items.push({label: '' + previousItem.node.uiState.childIndex, node: null});
    }
    items.push({label: currentNode.field.title, node:(currentNode/*: any*/)});
  }

  buildPathFragment(node: any, nodeLevel: any, nodes: any){
    if(nodeLevel > 0)
      return node.field.key + '/' + nodes[nodeLevel-1].uiState.childIndex;
    return node.field.key;
  }

  onAddClickHandler(){
    let context = this.props.context;
    let copy = context.value.slice(0);
    let newData = {};
    context.setLevelState(newData, context.node.field.fields);
    copy.push(newData);
    context.setValue(copy);
  };

  removeItemAtIndex(i: number){
    let context = this.props.context;
    let copy = context.value.slice(0);
    copy.splice(i, 1);
    context.setValue(copy);
  }

  swapItems({index, otherIndex}: {index: number, otherIndex: number}){
    if(index===otherIndex){
      return;
    }
    let context = this.props.context;

    //REMOVE ADDED LAZY ELEMENTS, WERE GOING TO ADD THEM AGAIN
    context.node.field.fields.forEach(function(fld,idx){
      if(fld.lazy === true){
        //service.api.logToConsole(fld.compositeKey,"comp to remove");
        delete context.node.field.fields[idx];
      }
    });

    let copy = context.value.slice(0);
    let temp = copy[index];
    copy[index] = copy[otherIndex];
    copy[otherIndex] = temp;
    context.setValue(copy);

    this.procDynamicFields();
  }

  //DRAG EVENTS
  getDocumentMouseUpListener(){
    this.documentMouseUpListener = function(e: any){
      if(this.state.dragFromIndex!=null&&this.state.dragToIndex!=null){
        this.swapItems({index:this.state.dragFromIndex, otherIndex:this.state.dragToIndex});
        this.setState({ dragFromIndex: null, dragToIndex:null });
      }
      document.removeEventListener('mouseup', this.documentMouseUpListener);
    }.bind(this)
    return this.documentMouseUpListener;
  }

  getOnItemDragHandleMouseDown(index: number){
    return function(e: any){
      if(true){
        this.setState({ dragFromIndex: index, dragToIndex: index, index:-1 });
        document.addEventListener('mouseup', this.getDocumentMouseUpListener());
      }
    }.bind(this)
  }

  getOnItemMouseEnter(index: number){
    return function(e: any){
      if(this.state.dragFromIndex!=null){
        this.setState({dragToIndex: index});
      }
    }.bind(this)
  }

  componentDidMount(){
    this.procDynamicFields();
  }

  procDynamicFields(){

    let {context} = this.props;
    let {node} = context;
    let {field} = node;

    let dynFields = {}
    let dynFieldsEmpty = field.fields;


    if(!Array.isArray(context.value)){
      context.value = [];
    }

    context.value.map( async (item: any, childIndex: number)=>{
      let componentKey = `item-${childIndex}`;

      if("dynFormSearchKey" in field){
        let dynFormObjectFile = "base"; //search in model/base by default
        let dynFormObjectRoot = "dynamics"; //search in sukoh by default

        if("dynFormObjectRoot" in field){
          dynFormObjectRoot = field.dynFormObjectRoot;
        }
        if("dynFormObjectFile" in field){
          dynFormObjectFile = field.dynFormObjectFile;
        }

        let searchKey = field["dynFormSearchKey"];
        let searchVal = item[searchKey];
        let dynSearchKeyVal = { key: searchKey, val: searchVal }

        await service.api.getDynFormFields( dynFormObjectFile, dynFormObjectRoot, dynSearchKeyVal).then((extraFields)=>{
          if (typeof extraFields !== 'undefined') {

            extraFields.fields.forEach(function(extrField){
              extrField.compositeKey = field.compositeKey + "." + extrField.key;
              extrField.lazy = true;

              //TODO make recursive
              if("fields" in extrField){
                extrField.fields.forEach(function(efld2nd){
                  efld2nd.compositeKey = extrField.compositeKey + "." + efld2nd.key;
                });
              }
            });

            let cleanedFieldFields = field.fields.filter(function( obj ) {
              let found = extraFields.fields.find((x)=>x.key===obj.key);
              if (typeof found === 'undefined') {
                return true;
              }
              return false; // TODO TESTEN
            });

            let newFields = cleanedFieldFields.concat(extraFields.fields);
            dynFields[componentKey] = newFields;
            //this.setState({["dyn-"+componentKey]: newFields});
          }
        });
      }

    });
    this.setState({ dynFieldsEmpty: dynFieldsEmpty});
    this.setState({ dynFields: dynFields });
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath} = context;
    let {field} = node;

    node.field.fields.forEach(function(fld,idx){
      if(fld.lazyTemp === true){
        //service.api.logToConsole(fld.compositeKey,"comp to remove");
        delete node.field.fields[idx];
      }
    });

    if(!Array.isArray(context.value)){
      context.value = [];
    }

    if(currentPath === context.parentPath){
      //service.api.logToConsole(field.title,"renderUnOpened" );
      return this.renderUnOpened(field.title, context, node);

    } else if(currentPath===context.nodePath){

      return this.renderAccordion(field, context, currentPath, node);

    } else if(currentPath.startsWith(context.nodePath)){

      let matchedNode = context.findPreviousNodeInCurrentNodeTree(node);

      if(matchedNode == null || matchedNode.uiState == null || matchedNode.uiState.childIndex == null){
        service.api.logToConsole(context.nodePath,"error");
        throw new Error('Unexpected state.');
      }

      let childIndex = matchedNode.uiState.childIndex;
      let newState =  context.value[childIndex]

      if(matchedNode.field.lazy === true){
        //THIS ENSURES THAT THE DATASTRUCTURE IS KNOWN IN DE node.fields-array  for LAZY elements
        let compositeKeyInFields = false;
        node.field.fields.forEach(function(fld){
          if(fld.compositeKey === matchedNode.field.compositeKey){
            compositeKeyInFields = true;
          }
        });

        if(!compositeKeyInFields){
          let newField = {...matchedNode.field};
          newField.lazyTemp = true;
          node.field.fields.push(newField);
        }
      }

      return (context.renderLevel({
        field,
        state: newState,
        uiState: {childIndex},
        parent: node
      }));

    } else {
      return (null);
    }

  }

  renderUnOpened(title, context, node){
    return (
      <List style={{marginBottom:16, padding: 0}}><ListItem
      style={{ border: 'solid 1px #d8d8d8', borderRadius:'7px'}}
      onClick={ function(){ context.setPath(node) } }
      leftIcon={<IconFileFolder />}
      rightIcon={<IconChevronRight />}
      primaryText={title}
      secondaryText={context.value.length +' items'}
    /></List>
    );
  }

  renderAccordion(field, context, currentPath, node){

    let { dragToIndex, dragFromIndex } = this.state;

    return (
      <Fragment>

        <Accordion index={this.state.index} onChange={(index)=>{ this.setState({index:this.state.index===index?-1:index}); }}>

          {context.value.map((item: any, childIndex: number)=>{

            let componentKey = `item-${childIndex}`;

            if(childIndex===dragFromIndex){
              return this.renderAccordionItem(field, context, node, componentKey, item, childIndex, true);
            }

            if(childIndex === dragToIndex && dragFromIndex != null && dragToIndex != null){

              let movedItem = (
                <div style={{margin:'18px 0', height:'8px', background:'#00bcd4', borderRadius:3}}></div>
              )

              let beforeItem, afterItem;
              if(dragFromIndex < dragToIndex){
                afterItem = movedItem;
              }
              else {
                beforeItem = movedItem;
              }
              return (
                <Fragment key={componentKey}>
                  {beforeItem}
                  {this.renderAccordionItem(field, context, node, componentKey, item,childIndex)}
                  {afterItem}
                </Fragment>
              )
            }
            else{
              return this.renderAccordionItem(field, context, node, componentKey, item, childIndex);
            }
          })}
              </Accordion>
              <RaisedButton style={{marginTop:'16px'}} onClick={this.onAddClickHandler.bind(this)} icon={<IconAdd />} />
            </Fragment>
    );
  }

  renderAccordionItem(field, context, node, componentKey: string, item: any, childIndex: number, isDragging: bool = false){

      if(this.state.dynFieldsEmpty.length > 0){
        if(componentKey in this.state.dynFields){
          field.fields = this.state.dynFields[componentKey];
        }
        else{
          field.fields = this.state.dynFieldsEmpty;
        }
        //service.api.logToConsole(componentKey, "componentKey");
        //service.api.logToConsole(Object.keys(this.state.dynFieldsEmpty).length, "dynFieldsLength");
        //service.api.logToConsole(this.state.dynFields, "dynFields");
      }

      /*
    service.api.logToConsole("=============")
    service.api.logToConsole("START FOREACH")
    field.fields.forEach(function(fld){
      service.api.logToConsole(fld.key, "fieldtitle")

    });
       */

      let label = 'Untitled';

      let newNode = {
        field,
        state: context.value[childIndex],
        uiState:{childIndex},
        parent: node
      };

      let arrayTitle = field.fields.find((x)=>x.arrayTitle===true);
      if(arrayTitle && newNode.state[arrayTitle.key]){
        label = newNode.state[arrayTitle.key];
      }

      let headStyle = {
        backgroundColor: '#eee',
      }
      if(isDragging){
        headStyle = {
          backgroundColor: "#e2e2e2",
        };
      }

      return (
        <AccordionItem key={componentKey}
        label={label}
        headStyle={headStyle}
        bodyStyle={{padding:'16px 16px 0px 16px'}}
        body={ context.renderLevel(newNode) }
        wrapperProps={{
          onMouseEnter: this.getOnItemMouseEnter(childIndex)
        }}
        headerRightItems={[
          <FlatButton
          onClick={(e)=>{e.stopPropagation()}}
          onMouseDown={this.getOnItemDragHandleMouseDown(childIndex)}
          style={{minWidth:40, cursor: 'move'}} icon={<IconSort opacity={.3} />} />,
          <DangerButton
          onClick={(e, loaded)=>{
            e.stopPropagation();
            if(loaded){
              this.removeItemAtIndex(childIndex)
            }
          }}
          loadedButton={<FlatButton secondary={true} style={{minWidth:40}} icon={<IconRemove />} />}
          button={<FlatButton style={{minWidth:40}} icon={<IconRemove opacity={.3} />} />}
        />
        ]}
        />
      );
    };


}

export default AccordionDynamic;
