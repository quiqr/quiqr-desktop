import React           from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import Tip             from '../../Tip';
import { BaseDynamic } from '../../HoForm';
import IconBroken      from 'material-ui-02/svg-icons/image/broken-image';
import Spinner         from '../../Spinner';
import service         from '../../../services/service';
import path            from 'path';
import Button          from '@material-ui/core/Button';
import SelectImagesDialog from '../../SelectImagesDialog'

const regExtractExt = /[.]([^.]+)$/
const extractExt = (file) => {
  return file.replace(regExtractExt,'$1');
}

type ImageSelectDynamicField = {
  type: string,
  key: string,
  compositeKey: string,
  default: ?string,
  tip: ?string,
  title: ?string
}

type ImageSelectDynamicState = {

}

class ImageSelectDynamic extends BaseDynamic<ImageSelectDynamicField, ImageSelectDynamicState> {

  constructor(props){
    super(props);

    this.state = {
      absFiles: [],
      selectImagesDialogConf: {
        title: '',
        message: '',
        percent: 0,
        visible: false,
      },
      srcFile: undefined,
      src: undefined };

  }


  componentDidMount(){
    this.checkRootPathFiles();
    this.checkThumbs();
  }

  /*
  componentDidUpdate(preProps: HomeProps){
    this.checkRootPathFiles();
  }
  */
  /*
  componentDidUpdate(preProps: HomeProps){
    this.checkThumbs();
  }
  */

  checkRootPathFiles(){
    let {context} = this.props;
    let {field} = context.node;
    if(!Array.isArray(context.node.state['resources'])){
      context.node.state['resources'] = [];
    }

    service.api.logToConsole(field.path)

    if(field.path.charAt(0) === "/" || field.path.charAt(0) === "\\"){
      service.api.getFilesFromAbsolutePath(field.path).then((_files)=>{

        if(this.state.absFiles.length === 0){
          let files = _files.map(item => {
            item.filename = item.src;
            item.src = path.join(field.path, item.src);
            return item;
          })
          this.setState({absFiles: files});
        }
      });
    }
  }

  normalizeState({state, field, stateBuilder} : {state:any, field:ImageSelectDynamicField, stateBuilder: any}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || undefined;
    }

    if (typeof field.buttonTitle !== 'string' || !field.buttonTitle instanceof String){
      field.buttonTitle="Select Image";
    }

    if(!Array.isArray(state['resources'])){
      state['resources'] = [];
    }
    for(let r = 0; r < state['resources'].length; r++){
      let resource = state['resources'][r];

      if(!field.extensions){
        field.extensions= [];
      }
      if(resource.src.startsWith(field.path) && ( field.extensions || field.extensions.indexOf(extractExt(resource.src.src))!==-1)){
        stateBuilder.setLevelState(resource, field.fields);
      }
    }

  }

  getType(){
    return 'image-select';
  }

  getExt(file){
    if (typeof file === 'string'){
      return file.split('.').pop().toLowerCase();
    }
  }

  isImage(file){
    if(file){
      const extname = this.getExt(file);
      if(extname ==='gif' ||
        extname === 'png' ||
        extname === 'svg' ||
        extname === 'jpg' ||
        extname === 'jpeg'
      ){
        return true;
      }
    }

    return false;
  }

  checkThumbs(){
    let {node, form} = this.props.context;
    let {field} = node;

    if(this.props.context.value !== this.state.srcFile){

      if(this.isImage(this.props.context.value)){


        let thumbPath = this.props.context.value;
        this.setState({srcFile: this.props.context.value });

        if(field.path){
          thumbPath = path.join(field.path, this.props.context.value);
        }
            service.api.logToConsole(thumbPath);

        form.props.plugins.getBundleThumbnailSrc(thumbPath)
          .then((src)=>{
            //service.api.logToConsole(src);
            this.setState({src});
          });
      }
    }
  }

  handleCloseDialog(){
    let conf = this.state.selectImagesDialogConf;
    conf.visible = false;
    this.setState({selectImagesDialogConf:conf})
  }

  renderImage(){
    if(this.isImage(this.props.context.value)){
      return (
        <div className="checkered" style={{ maxWidth:'200px', height:'100%', marginBottom:'0px', overflow:'hidden', backgroundColor: '#ccc'}}>
          {
            this.state.src === undefined ? (<Spinner size={32} margin={16} color={ 'RGBA(255,255,255,.3)' } />)
            : this.state.src === 'NOT_FOUND'? (<IconBroken className="fadeIn animated" style={{width:32, height:32, margin:16, color:'#e84b92'}} />)
            : (<img src={this.state.src} alt="" className="fadeIn animated" style={{width:'100%', marginBottom:'-4px'}} /> )
          }
        </div>);
    }
  }

  renderComponent(){

    let {context} = this.props;
    let {form, node, currentPath} = context;
    let {field} = node;

    if(currentPath!==context.parentPath){
      return (null);
    }

    let iconButtons = [];
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />)

    return (

      <div>
        <SelectImagesDialog
        conf={this.state.selectImagesDialogConf}
        imageItems={this.state.absFiles}
        getBundleThumbnailSrc={form.props.plugins.getBundleThumbnailSrc}
        handleSelect={(selected)=>{
          context.setValue(selected);
          this.checkThumbs();
          this.handleCloseDialog();
        }}
        handleClose={()=>{
          this.handleCloseDialog();
        }}
      />

        <FormItemWrapper
        control={

            <label style={{
              alignSelf: 'stretch',
              display:'block',
              lineHeight: '22px',
              fontSize:12,
              pointerEvents: 'none',
              userSelect: 'none',
              color: 'rgba(0, 0, 0, 0.3)' }}>{field.title}
          </label>

        }
        iconButtons={iconButtons}
      />

        <div style={{paddingBottom:"10px"}}>
          {this.renderImage()}

          <Button style={{marginTop:'5px'}} variant="contained" color="primary" onClick={()=>{
            let conf = this.state.selectImagesDialogConf;
            conf.visible = true;

            this.setState({selectImagesDialogConf:conf})
          }}>
           {field.buttonTitle}
          </Button>
        </div>

        </div>
    );
  }
}

export default ImageSelectDynamic;
