import React                   from 'react';
import TextField               from '@material-ui/core/TextField';
import MarkdownIt              from 'markdown-it'
import FormItemWrapper         from './shared/FormItemWrapper';
import { BaseDynamic }         from '../../HoForm';
import Tip                     from '../../Tip';
import AiAssist        from '../../AiAssist';
import service                      from '../../../services/service';

const md = new MarkdownIt({html:true});
const imgIcon = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 129 129" enable-background="new 0 0 129 129" width="32px" height="32px"><g><g><circle cx="76" cy="42.4" r="6.6" fill="#933EC5"/><path d="m6.4,119.5c0,0 0,0.1 0,0 0,0.1 0,0.1 0.1,0.1 0.1,0.2 0.2,0.5 0.3,0.7 0,0.1 0.1,0.1 0.1,0.2 0,0.1 0.1,0.1 0.1,0.2 0,0 0.1,0.1 0.1,0.1 0.1,0.2 0.3,0.3 0.4,0.5 0,0 0.1,0.1 0.1,0.1 0.1,0.1 0.1,0.1 0.2,0.2 0.1,0 0.1,0.1 0.1,0.1 0.1,0.1 0.2,0.1 0.3,0.2 0,0 0.1,0.1 0.1,0.1 0,0 0.1,0 0.1,0.1 0.1,0.1 0.3,0.1 0.4,0.2 0.1,0 0.1,0 0.2,0.1 0.1,0 0.2,0.1 0.2,0.1 0.3,0.1 0.6,0.1 0.9,0.1h108.2c2.3,0 4.1-1.8 4.1-4.1v-27-80.9c0-2.3-1.8-4.1-4.1-4.1h-107.9c-2.3,0-4.1,1.8-4.1,4.1v80.7 27c0,0.3 0.1,0.7 0.1,1 0,0.1 0,0.2 0,0.2zm108.1-5.2h-90.4l66.8-43.7 23.6,22.5v21.2zm-100-99.6h100v67.1l-20.3-19.4c-1.4-1.3-3.5-1.5-5.1-0.5l-19.1,12.6-13.3-13.4c-1.4-1.4-3.5-1.6-5.1-0.6l-37.1,23.4v-69.2zm0,78.9l38.7-24.4 9.8,9.9-48.5,31.7v-17.2z" fill="#933EC5"/></g></g></svg>'

function debounce(fn, delay) {
  var timer: ?TimeoutID = null;
  return function () {
    let context = this;

    let args = arguments;
    if(timer){
      clearTimeout(timer);
    }
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

const imgMatcher = /<img.+?>/gi;
const shortcodeMatcher = /({{<.+?>}}|{{%.+?%}})/gi;
const linkHrefMatcher = /<a.+?>/gi;

class MarkdownDynamic extends BaseDynamic {

  constructor(props){
    super(props);
    let val = this.props ? this.props.context.value : '';
    let preview = md.render(val||'');
    preview = this.applyTransformation(preview);
    this.state = {
      value:val,
      enableAiAssist: false,
      preview,
      maxHeight: null
    };

    this.updatePreviewStateDebounced = debounce(this.updatePreviewState.bind(this),250);


  }

  applyTransformation(preview){
    preview = preview.replace(imgMatcher,imgIcon);
    preview = preview.replace(shortcodeMatcher,'<span style="color: #933ec5!important">$1</span>');
    preview = preview.replace(linkHrefMatcher,'<a color="#933ec5!important" click="function(){ return false }" href="#">');
    return preview;
  }

  updatePreviewState(){
    let preview = md.render(this.state.value||'');
    //highlight shortcodes
    //replace images

    preview = this.applyTransformation(preview);

    // while(reg.exec(preview)){

    // }
    this.setState({ preview: preview });
    this.props.context.setValue(this.state.value, 250);
    this.fixHeight();
  }

  normalizeState({state, field}:{state: any, field: MarkdownDynamicField }){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || '';
    }
  }

  getType(){
    return 'markdown';
  }

  componentDidMount(){
    setTimeout(()=>{
      this.fixHeight();

    });

    service.api.readConfKey('prefs').then((value)=>{
      this.setState({prefs: value });

      if(value.openAiApiKey){
        this.setState({enableAiAssist: true }, ()=>{this.forceUpdate()});
      }
      else{
        this.setState({enableAiAssist: false },()=>{this.forceUpdate()});
      }

    });

  }

  shouldComponentUpdate(nextProps, nextState){
   return (
      this.props.context.value !== nextProps.context.value
      || this.props.context.currentPath !== nextProps.context.currentPath
      || this.state.preview !== nextState.preview
      || this.state.value !== nextState.value
      || this.state.maxHeight !== nextState.maxHeight
    );
  }

  onChange(e){
    this.setState({value: e.target.value});
    this.updatePreviewStateDebounced();
  }

  fixHeight(){
    if(this.inputWrapper){
      let textArea = this.inputWrapper.querySelector('textarea[id]');
      if(textArea){
        let maxHeight = textArea.clientHeight + 48;
        this.setState({maxHeight});
      }
    }
  }

  renderComponent(){

    let {context} = this.props;
    let {node, currentPath} = context;
    let {field} = node;

    if(currentPath!==context.parentPath){
      return (null);
    }

    let paddingRight = 0;
    let iconButtons = [];
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />);

    if(this.state.enableAiAssist) iconButtons.push(<AiAssist handleSetAiText={(text)=>{ this.setState({value:text})}} inField={field} inValue={context.value} pageUrl={context.pageUrl} />);

    return (
      <div
      ref={(div) => { this.inputWrapper = div; }}
      style={{ width:'100%' }}
    >

      <FormItemWrapper
      control={<TextField
      onChange={this.onChange.bind(this)}
      value={this.state.value}
      multiline={true}
      fullWidth={true}
      minRows={6}
      maxRows={24}
      style={{paddingRight, transition:'none', boxSizing:'border-box'}}
      label={field.title} />
      }
      iconButtons={iconButtons}
    />

    </div>
    );
  }
}

export default MarkdownDynamic;
