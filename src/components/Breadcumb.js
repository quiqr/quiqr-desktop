import * as React from 'react';
import FlatButton from 'material-ui-02/FlatButton';
import IconChevronRight from 'material-ui-02/svg-icons/navigation/chevron-right';

export class BreadcumbItem extends React.Component{
  render(){
    return (<FlatButton
      primary={this.props.disabled?false:true}
      style={{minWidth:'30px', borderRadius:'0px'}}
      label={this.props.label}
      onClick={this.props.onClick} />);
  }
}


export class Breadcumb extends React.Component{
  render(){

    let { items } = this.props;
    let newItems = [];

    for(let i = 0; i < items.length; i++){
      if(i > 0){
        newItems.push(<FlatButton
          key={'breadcumb-item-arrow-'+i}
          disabled={true}
          icon={<IconChevronRight />}
          style={{minWidth:'30px'}} />)
      }

      newItems.push(React.cloneElement(items[i], {key:'breadcumb-item-'+i}));
    }

    return (
      <div style={Object.assign({borderRadius:'2px'}, this.props.style)}>
        {newItems}
      </div>
    );
  }
}

export class FormBreadcumb extends React.Component{

  render(){
    return (
      <Breadcumb style={{marginBottom:16}} items={
        this.props.items.map((item)=>{
          if(item.node!=null){
            let node = item.node;
            return ( <BreadcumbItem label={item.label||'Untitled'} onClick={()=>this.props.onNodeSelected(node)} /> );
          }
          else{
            return ( <BreadcumbItem label={item.label||'Untitled'} disabled={true} /> );
          }
        })
        } />
    );
  }
}
