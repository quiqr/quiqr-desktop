import React           from 'react';
import FormItemWrapper from './shared/FormItemWrapper';
import Tip             from '../../Tip';
import { BaseDynamic } from '../../HoForm';
import IconClear       from 'material-ui-02/svg-icons/content/clear';
import IconButton      from 'material-ui-02/IconButton';
import IconBroken      from 'material-ui-02/svg-icons/image/broken-image';
import Spinner         from '../../Spinner';
import service         from '../../../services/service';
import path            from 'path';
import Button          from '@material-ui/core/Button';
import { makeStyles }       from '@material-ui/core/styles';
//import SharedMaterialStyles from '../../../shared-material-styles';
import { withStyles } from '@material-ui/core/styles';
import SelectImagesDialog from '../../SelectImagesDialog'

const localStyles = {
  container:{
    padding: '20px',
    height: '100%'
  },
}
//const useStyles = makeStyles({...SharedMaterialStyles, ...localStyles})
const useStyles = theme => ({

  container:{
    padding: '20px',
    height: '100%'
  },

  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },

  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '50ch',
  },

});



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
      selectImagesDialogConf: {
        title: '',
        message: '',
        percent: 0,
        visible: false,
      },
      srcFile: undefined,
      src: undefined };

  }

  normalizeState({state, field}: {state: any, field: ImageSelectDynamicField}){
    let key = field.key;
    if(state[key]===undefined){
      state[key] = field.default || undefined;
    }
  }

  getType(){
    return 'image-select';
  }

  /*
  componentDidUpdate(preProps: HomeProps){
    this.checkThumbs();
  }
  */
  getExt(file){
    return file.split('.').pop().toLowerCase();
  }

  isImage(file){
    const extname = this.getExt(file);
    if(extname ==='gif' ||
      extname === 'png' ||
      extname === 'svg' ||
      extname === 'jpg' ||
      extname === 'jpeg'
    ){
      return true;
    }

    return false;
  }

  checkThumbs(){
    let {node, form} = this.props.context;
    let {field, state} = node;

    if(this.props.context.value !== this.state.srcFile){

      service.api.logToConsole(this.props.context.value);
      if(this.isImage(this.props.context.value)){


        let thumbPath = this.props.context.value;
        this.setState({srcFile: this.props.context.value });

        if(field.path){
          thumbPath = path.join(field.path, this.props.context.value);
        }

        form.props.plugins.getBundleThumbnailSrc(thumbPath)
          .then((src)=>{
            //service.api.logToConsole(src);
            this.setState({src});
          });
      }
    }
  }


  componentDidMount(){


    this.checkThumbs();
  }

  renderImage(){
    if(this.isImage(this.props.context.value)){
      return (
        <div className="checkered" style={{ maxWidth:'300px', height:'100%', marginBottom:'0px', overflow:'hidden', backgroundColor: '#ccc'}}>
          {
            this.state.src === undefined ? (<Spinner size={32} margin={16} color={ 'RGBA(255,255,255,.3)' } />)
            : this.state.src === 'NOT_FOUND'? (<IconBroken className="fadeIn animated" style={{width:32, height:32, margin:16, color:'#e84b92'}} />)
            : (<img src={this.state.src} alt="" className="fadeIn animated" style={{width:'100%'}} /> )
          }
            </div>);
    }
  }


  renderComponent(){

    let {context} = this.props;
    let {node, currentPath} = context;
    let {field} = node;
    const classes = this.props.classes;

    if(currentPath!==context.parentPath){
      return (null);
    }

    let iconButtons = [];
    if(field.tip) iconButtons.push(<Tip markdown={field.tip} />)

    return (

      <div>
        <SelectImagesDialog
        conf={this.state.selectImagesDialogConf}
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

        <div style={{paddingBottom:"20px;"}}>
          {this.renderImage()}

          <Button variant="contained" color="primary" onClick={()=>{
            let conf = this.state.selectImagesDialogConf;
            conf.visible = true;

            this.setState({selectImagesDialogConf:conf})
          }}>
            Select File
          </Button>
        </div>

        </div>
    );
  }
}

export default ImageSelectDynamic;
//export default withStyles(useStyles)(ImageSelectDynamic);
/*
export default () => {
    const classes = useStyles();
    return (
        <ImageSelectDynamicField classes={classes} />
    )
}
*/
