import React          from 'react';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FileCopyIcon   from '@material-ui/icons/FileCopy';
import Tooltip        from '@material-ui/core/Tooltip';
import IconButton     from '@material-ui/core/IconButton';
import { snackMessageService }      from './../services/ui-service';
//import service         from '../services/service';

class BundleManagerHeader extends React.PureComponent<AccordionHeaderProps,void>{

  render(){
    let { active, headerLeftItems, headerRightItems, label, onClick, style } = this.props;

    if(label.substr(0,7) === '/static'){
      label = label.substr(7,(label.length-7))
    }
    let filename = label
    let fExtention = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    let fBase = filename.slice(0,(filename.lastIndexOf(".") ));

    if(fBase.length > 15){
      filename = fBase.substr(0,7) + "..." + fBase.substr(-5) + "." +fExtention;
    }

    return (<div style={style} onClick={onClick}>
      <span style={{ display:'inline-block', margin: '-10px 0px -10px -5px'}}>
        { headerLeftItems.map((item, index) => { return  (
          <span key={index}  style={{ display: 'inline-block', margin:'0 5px' }}>{item}</span>
        )})}
      </span>
      <span style={{ position:'absolute', top:'0px', right: '-5px'}}>
        <IconButton size="small" aria-label="Expand" onClick={()=>{
          const {clipboard} = window.require('electron')
          clipboard.writeText(encodeURI(label))
          snackMessageService.addSnackMessage('File path copied to clipboard');
        }}><FileCopyIcon /></IconButton>
        { headerRightItems.map((item, index) => { return  (
          <span key={index}  style={{ display: 'inline-block', margin:'0 5px' }}>{item}</span>
        )})}
        {this.props.forceActive?undefined:
          <IconButton size="small" aria-label="Expand">{ active ? <ExpandLessIcon /> : <ExpandMoreIcon /> } </IconButton>
        }
      </span>
      <Tooltip title={label}>
        <span>
          {filename}
        </span>
      </Tooltip>
    </div>);
  }
}

class BundleManagerItem extends React.Component{
  render(){

    let {active, body, label, onHeadClick, headerRightItems=[], headerLeftItems=[], headStyle, bundleStyle, bodyStyle, style, wrapperProps } = this.props;

    let _style = Object.assign({
      minWidth: '250px'
    }, style);

    let _headStyle = Object.assign({
      border: 'solid 0px #e8e8e8',
      padding: '12px 0px 12px 8px',
      display:'block',
      cursor:'pointer',
      position:'relative',
      fontSize: 12,
      //color: 'rgba(0, 0, 0, 0.47)'
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


    return <div style={_style} className="BundleManager-item col-xl-2 col-lg-4 col-6" {...wrapperProps} >
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

        //SPLITPATH ugly hack to prevent displaying files from subdirs TODO REMOVE
        let splitPath = (item.props.path).split("/");
        if (splitPath.length < 99 ){
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
