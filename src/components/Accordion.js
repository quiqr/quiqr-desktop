import React                    from 'react';
import FlatButton               from 'material-ui-02/FlatButton';
import IconNavigationExpandLess from 'material-ui-02/svg-icons/navigation/expand-less';
import IconNavigationExpandMore from 'material-ui-02/svg-icons/navigation/expand-more';
//import service                  from '../services/service';

type AccordionHeaderProps = {
    active: bool, onClick: ()=>void, style: any, headerLeftItems: any, headerRightItems: any
}

class AccordionHeader extends React.PureComponent<AccordionHeaderProps,void>{

    render(){
        let { active, headerLeftItems, headerRightItems, label, onClick, style } = this.props;
        return (<div style={style} onClick={onClick}>
            <span style={{ display:'inline-block', margin: '-10px 0px -10px -5px'}}>
                { headerLeftItems.map((item, index) => { return  (
                    <span key={index}  style={{ display: 'inline-block', margin:'0 5px' }}>{item}</span>
                )})}
            </span>
            <span style={{ position:'absolute', top:'8px', right: '5px'}}>
                { headerRightItems.map((item, index) => { return  (
                    <span key={index}  style={{ display: 'inline-block', margin:'0 5px' }}>{item}</span>
                )})}
                {this.props.forceActive?undefined:
                <FlatButton
                    style={{minWidth: '40px'}}
                    icon={active?<IconNavigationExpandLess />:<IconNavigationExpandMore />}
                />
                }
            </span>
            {label}
        </div>);
    }
}

class AccordionItem extends React.Component{
    render(){
        let {active, body, label, onHeadClick, headerRightItems=[], headerLeftItems=[], headStyle, bodyStyle, style, wrapperProps } = this.props;

        let _headStyle = Object.assign({
            border: 'solid 1px #d8d8d8',
            //backgroundColor: '#e2e2e2',
            padding: '16px',
            display:'block',
            cursor:'pointer',
            marginTop:8,
            position:'relative'
        }, headStyle);

        let _bodyStyle = Object.assign({
            display:active?'block':'none',
            padding:'16px 0',
            border: 'solid 1px #d8d8d8',
            borderTopWidth: 0
        },bodyStyle);

        return <div style={style} className="accordion-item" {...wrapperProps} >
            <AccordionHeader
                style={_headStyle}
                onClick={onHeadClick}
                headerLeftItems={headerLeftItems}
                headerRightItems={headerRightItems}
                forceActive={this.props.forceActive}
                active={active}
                label={label}
            />
            <div style={_bodyStyle}>
                { active? body : ( null ) }
            </div>
        </div>;
    }
}

class Accordion extends React.Component{

  constructor(props){
    super(props);
    this.state = { index : -1 };
  }

  getOpenedIndex(){
    if(this.props.index !== undefined){
      return this.props.index;
    }
    else{
      return this.state.index;
    }
  }

  getHandleChange(i){

    return function(e){
      if(this.props.index !== undefined){
        if(this.props.onChange){
          this.props.onChange(i);
        }
      }
      else{
        let index = i !== this.state.index?i:-1;
        this.setState(Object.assign({}, this.state, {index}))

      }
    }.bind(this);
  }

  render(){
    let openedIndex = this.getOpenedIndex();
    return <div className="accordion" style={this.props.style}>
      { this.props.children.map((item, index)=>{
        let active = this.props.forceActive || index === openedIndex;
        return React.cloneElement(item, {
          active,
          onHeadClick: this.getHandleChange(index),
        });
      }) }
    </div>
  }
}

export { Accordion, AccordionItem };
