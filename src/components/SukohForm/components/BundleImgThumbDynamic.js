import React from 'react';
import IconBroken from 'material-ui-02/svg-icons/image/broken-image';
import type {ComponentProps} from '../../HoForm';
import { BaseDynamic } from '../../HoForm';
import Spinner from '../../Spinner';
import service from '../../../services/service';
import MovieIcon from '@material-ui/icons/Movie';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';

type BundleImgThumbDynamicField = {
  key: string,
  compositeKey: string,
  type: string,
  src: ?string
}

type BundleImgThumbDynamicState = {
  src: ?string
}

class BundleImgThumbDynamic extends BaseDynamic<BundleImgThumbDynamicField, BundleImgThumbDynamicState> {

  constructor(props: ComponentProps<BundleImgThumbDynamicField>){
    super(props);
    if(props){
      this.state = { src: undefined };
    }

  }

  renderComponent(){
    let {node} = this.props.context;

    let {field, state} = node;
    service.api.logToConsole(state);
    if(this.isImage(state[field.src||'src'])){
      return (
        <div className="checkered" style={{ width:'auto', height:'100%', marginBottom:'0px', overflow:'hidden', backgroundColor: '#ccc'}}>
          {
            this.state.src === undefined ? (<Spinner size={32} margin={16} color={ 'RGBA(255,255,255,.3)' } />)
            : this.state.src === 'NOT_FOUND'? (<IconBroken className="fadeIn animated" style={{width:32, height:32, margin:16, color:'#e84b92'}} />)
            : (<img src={this.state.src} alt="" className="fadeIn animated" style={{width:'100%'}} /> )
          }
            </div>);

    }
    else if(this.isVideo(state[field.src||'src'])){
      return (
        <div style={{ width:'auto', height:'100%', marginBottom:'0px', overflow:'hidden',}}>
          <MovieIcon style={{ fontSize: 120 }} color="disabled"/>
        </div>
      );
    }
    else if(this.isPDF(state[field.src||'src'])){
      return (
        <div style={{ width:'auto', height:'100%', marginBottom:'0px', overflow:'hidden',}}>
          <PictureAsPdfIcon style={{ fontSize: 120 }} color="disabled"/>
        </div>
      );
    }
    else {
      return (
        <div style={{ width:'auto', height:'100%', marginBottom:'0px', overflow:'hidden',}}>
          <InsertDriveFileIcon style={{ fontSize: 120 }} color="disabled"/>
        </div>
      );
    }
  }

  getExt(file){
    return file.split('.').pop().toLowerCase();
  }

  isPDF(file){
    const extname = this.getExt(file);
    if(extname==='pdf'
    ){
      return true;
    }

    return false;
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

  isVideo(file){
    const extname = this.getExt(file);
    if(extname ==='mov' ||
      extname === 'mpg' ||
      extname === 'mpeg' ||
      extname === 'mp4'
    ){
      return true;
    }

    return false;
  }

  componentDidMount(){
    let {node, form} = this.props.context;
    let {field, state} = node;

    //service.api.logToConsole(field);

    if(this.isImage(state[field.src||'src'])){
      form.props.plugins.getBundleThumbnailSrc(state[field.src||'src'])
        .then((src)=>{

          //service.api.logToConsole(src)
          this.setState({src});
        });
    }
  }

  getType(){
    return 'bundle-image-thumbnail';
  }
}

export default BundleImgThumbDynamic;
