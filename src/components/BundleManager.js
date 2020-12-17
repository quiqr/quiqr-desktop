import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import IconNavigationExpandLess from 'material-ui/svg-icons/navigation/expand-less';
import IconNavigationExpandMore from 'material-ui/svg-icons/navigation/expand-more';


class BundleManagerHeader extends React.PureComponent<AccordionHeaderProps,void>{

    render(){
        let { active, headerLeftItems, headerRightItems, label, onClick, style } = this.props;
        return (<div style={style} onClick={onClick}>
            <span style={{ display:'inline-block', margin: '-10px 0px -10px -5px'}}>
                { headerLeftItems.map((item, index) => { return  (
                    <span key={index}  style={{ display: 'inline-block', margin:'0 5px' }}>{item}</span>
                )})}
            </span>
            <span style={{ position:'absolute', top:'0px', right: '-5px'}}>
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

class BundleManagerItem extends React.Component{
    render(){
        let {active, body, label, onHeadClick, headerRightItems=[], headerLeftItems=[], headStyle, bundleStyle, bodyStyle, style, wrapperProps } = this.props;

        let _headStyle = Object.assign({
            border: 'solid 0px #e8e8e8',
            padding: '12px 0px 12px 8px',
            display:'block',
            cursor:'pointer',
            position:'relative',
            fontSize: 12,
            color: 'rgba(0, 0, 0, 0.47)'
        }, headStyle);

        let _bodyStyle = Object.assign({
            display:active?'block':'none',
            padding:'8px 0',
            border: 'solid 0px #e8e8e8',
            borderTopWidth: 0,
            width: '100%',
        },bodyStyle);

        let _bundleStyle = Object.assign({
            margin: '8px',
            padding:'8px',
            border: 'solid 0px #e8e8e8',
            boxShadow: '1px 1px 4px RGBA(0,0,0,.2)'
        },bundleStyle);

        return <div style={style} className="BundleManager-item col-xl-3 col-lg-4 col-6" {...wrapperProps} >
              <div style={_bundleStyle}>
                <BundleManagerHeader
                    style={_headStyle}
                    onClick={onHeadClick}
                    headerLeftItems={headerLeftItems}
                    headerRightItems={headerRightItems}
                    forceActive={this.props.forceActive}
                    active={active}
                    label={label}
                />
                  <div  style={_bodyStyle}>
                      { active? body : ( null ) }
                  </div>
                </div>
              </div>
    }
}

class BundleManager extends React.Component{

    constructor(props){
        super(props);
        this.state = { index : -1 };
    }

    getOpenedIndex(){
        if(this.props.index!==undefined){
            return this.props.index;
        }
        else{
            return this.state.index;
        }
    }

    getHandleChange(i){
        return function(e){
            if(this.props.index!==undefined){
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
        return <div className="BundleManager row" style={this.props.style}>
            { this.props.children.map(function(item, index){
                let active = this.props.forceActive || index === openedIndex;
                let splitPath = (item.props.path).split("/");
                if (splitPath.length < 3 ){
                  return React.cloneElement(item, {
                      active,
                      onHeadClick: this.getHandleChange(index),
                  });
                }
            }.bind(this)) }
        </div>
    }
}

export { BundleManager, BundleManagerItem };
