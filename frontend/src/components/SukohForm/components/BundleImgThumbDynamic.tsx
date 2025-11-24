import React                 from 'react';
import IconBroken            from '@mui/icons-material/BrokenImage';
import MovieIcon             from '@mui/icons-material/Movie';
import PictureAsPdfIcon      from '@mui/icons-material/PictureAsPdf';
import InsertDriveFileIcon   from '@mui/icons-material/InsertDriveFile';
import { BaseDynamic, BaseDynamicProps, BaseDynamicState, FieldBase }       from '../../HoForm';
import Spinner               from '../../Spinner';

export interface BundleImgThumbDynamicField extends FieldBase {
  src?: string;
}

type BundleImgThumbDynamicProps = BaseDynamicProps<BundleImgThumbDynamicField>;

type BundleImgThumbDynamicState = BaseDynamicState & {
  srcFile: string | undefined;
  src: string | undefined;
};

class BundleImgThumbDynamic extends BaseDynamic<BundleImgThumbDynamicProps, BundleImgThumbDynamicState> {

  constructor(props: BundleImgThumbDynamicProps){
    super(props);
    if(props){
      this.state = {
        srcFile: undefined,
        src: undefined,
        error_msg: null
      };
    }
  }

  renderComponent(){
    let {node} = this.props.context;

    let {field, state} = node;
    if(this.isImage(state[field.src||'src'])){
      return (
        <div className="checkered" style={{ width:'auto', height:'100%', marginBottom:'0px', overflow:'hidden', backgroundColor: '#ccc'}}>
          {
            this.state.src === undefined ? (<Spinner size={32} margin={"16px"} color={ 'RGBA(255,255,255,.3)' } />)
            : this.state.src === 'NOT_FOUND'? (<IconBroken className="fadeIn animated" style={{width:32, height:32, margin:16, color:'#e84b92'}} />)
            : (<img src={this.state.src} alt="" className="fadeIn animated" style={{width:'100%', marginBottom:'-4px'}} /> )
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

  getExt(file: string){
    return file.split('.').pop()?.toLowerCase() || '';
  }

  isPDF(file: string){
    const extname = this.getExt(file);
    if(extname==='pdf'
    ){
      return true;
    }

    return false;
  }
  isImage(file: string){
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

  isVideo(file: string){
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

  componentDidUpdate(preProps: BundleImgThumbDynamicProps){
    this.checkThumbs();
  }

  checkThumbs(){
    let {node, form} = this.props.context;
    let {field, state} = node;

    if(state[field.src||'src'] !== this.state.srcFile){

      if(this.isImage(state[field.src||'src'])){

        this.setState({srcFile: state[field.src||'src'] });
        form.props.plugins.getBundleThumbnailSrc(state[field.src||'src'])
          .then((src: string)=>{

            this.setState({src});
          });
      }
    }

  }


  componentDidMount(){
    this.checkThumbs();
  }

  getType(){
    return 'bundle-image-thumbnail';
  }
}

export default BundleImgThumbDynamic;
