import React              from 'react';
import path               from 'path';
import IconBroken         from '@material-ui/icons/BrokenImage';
import Button             from '@material-ui/core/Button';
import FormItemWrapper    from './shared/FormItemWrapper';
import Spinner            from '../../Spinner';
import Tip                from '../../Tip';
import { BaseDynamic }    from '../../HoForm';
import SelectImagesDialog from '../../SelectImagesDialog'
import service            from '../../../services/service';

class ImageSelectDynamic extends BaseDynamic {

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

  checkRootPathFiles(reload = false){
    let {context} = this.props;
    let {field} = context.node;

    let field_path = field.path

    if(field.path.charAt(0) === "/" || field.path.charAt(0) === "\\"){

      if(typeof field.real_fs_path == 'string'){
        field_path = field.real_fs_path
      }

      service.api.getFilesFromAbsolutePath(field_path).then((_files)=>{

        if(this.state.absFiles.length === 0 || reload){
          let files = _files.map(item => {
            item.filename = item.src;
            item.src = path.join(field_path, item.src);
            //service.api.logToConsole(item.src)

            return item;
          })
          this.setState({absFiles: files});
        }
      });
    }
    else{
      context.form.props.plugins.getFilesInBundle( field.extensions, field.path, field.forceFileName).then((_files)=>{

        if(this.state.absFiles.length === 0 || reload){
          let files = _files.map(item => {
            item.filename = item.src;
            item.src = path.join(item.src);
            return item;
          })
          this.setState({absFiles: files});
        }
      });
    }

  }

  normalizeState({state, field, stateBuilder}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || undefined;
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

        let field_path = field.path
        if(typeof field.real_fs_path == 'string'){
          field_path = field.real_fs_path

          let imgBaseName = this.props.context.value.split('/').reverse()[0];
          thumbPath = path.join(field_path, imgBaseName);
        }
        else{
          if(field.path && (field.path.charAt(0) === "/" || field.path.charAt(0) === "\\")){
            thumbPath = path.join(field_path, this.props.context.value);
          }
        }


        form.props.plugins.getBundleThumbnailSrc(thumbPath)
          .then((src)=>{
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

  handleReload(){
    this.setState({absFiles:[]},()=>{
      this.checkRootPathFiles(true);
      this.checkThumbs();
    });
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

  convertToRealPath(savedPath, field){

    if(typeof field.real_fs_path == 'string'){
      let imgBaseName = savedPath.split('/').reverse()[0];
      return field.real_fs_path + "/" + imgBaseName;
    }
    return savedPath;
  }

  convertToPublishPath(imageName, field){
    if(typeof field.real_fs_path == 'string'){
      let imgBaseName = imageName.split('/').reverse()[0];
//      service.api.logToConsole(field.path)
      return field.path + '/' + imgBaseName;
    }
    return imageName;
  }

  renderComponent(){

    let {context} = this.props;
    let {form, node, currentPath} = context;
    let {field} = node;

    if(currentPath!==context.parentPath){
      return (null);
    }

    if (typeof field.buttonTitle !== 'string' || !field.buttonTitle instanceof String){
      field.buttonTitle="Select Image";
    }


    let iconButtons = [];
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />)

    return (

      <div>
        <SelectImagesDialog
          conf={this.state.selectImagesDialogConf}
          imageItems={this.state.absFiles}
          uploadPath={field.path}
          reload={()=>this.handleReload()}
          formProps={form.props}
          getBundleThumbnailSrc={form.props.plugins.getBundleThumbnailSrc}
          handleSelect={(selected)=>{
            context.setValue(this.convertToPublishPath(selected,field));
            this.checkThumbs();
            this.handleCloseDialog();
            if(field.autoSave === true){
              context.saveFormHandler();
            }
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
