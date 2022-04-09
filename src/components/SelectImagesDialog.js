import * as React        from 'react';
import IconBroken        from 'material-ui-02/svg-icons/image/broken-image';
import Spinner           from './Spinner';
import Button            from '@material-ui/core/Button';
import Dialog            from '@material-ui/core/Dialog';
import DialogActions     from '@material-ui/core/DialogActions';
import DialogContent     from '@material-ui/core/DialogContent';
import DialogTitle       from '@material-ui/core/DialogTitle';
//import service from '../services/service';



class ImageThumb extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      src: null
    }
  }

  checkThumbs(){
    if(this.isImage(this.props.imagePath)){
      this.props.getBundleThumbnailSrc(this.props.imagePath)
        .then((src)=>{
          this.setState({src});
        });
    }
  }

  componentDidMount(){
    this.checkThumbs();
  }

  getExt(file){
    return file.split('.').pop().toLowerCase();
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

  render(){
    if(this.isImage(this.props.imagePath)){
      return (
        <div className="checkered" style={{ maxWidth:'200px', height:'auto', marginBottom:'0px', overflow:'hidden', backgroundColor: '#ccc'}}>
          {
            this.state.src === undefined ? (<Spinner size={32} margin={16} color={ 'RGBA(255,255,255,.3)' } />)
            : this.state.src === 'NOT_FOUND'? (<IconBroken className="fadeIn animated" style={{width:32, height:32, margin:16, color:'#e84b92'}} />)
            :
            (
              <img src={this.state.src} alt="" className="fadeIn animated" style={{cursor: "pointer", width:'100%', marginBottom:'-7px'}} />
            )
          }
        </div>);
    }
  }
}



export default class SelectImagesDialog extends React.Component{

  render(){

    return (
      <Dialog
      open={this.props.conf.visible}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      fullWidth={true}
      maxWidth={"lg"}
    >
        <DialogTitle id="alert-dialog-title">{this.props.conf.title}</DialogTitle>
        <DialogContent>

            <div className="BundleManager row" style={this.props.style}>
              {
                this.props.imageItems.map((item, index)=>{
                  return (
                    <div className="BundleManager-item col-xl-2 col-lg-4 col-6" key={"imageitem-"+index}>
                      <Button  onClick={()=>{this.props.handleSelect(item.filename)}} color="primary">
                        {item.filename}
                      </Button>
                      <Button  onClick={()=>{this.props.handleSelect(item.filename)}}>
                      <ImageThumb
                      onClick={()=>{this.props.handleSelect(item.filename)}}
                      getBundleThumbnailSrc={this.props.getBundleThumbnailSrc}
                      imagePath={item.src} />
                      </Button>

                   </div>
                  )
                })
              }
            </div>




        </DialogContent>
        <DialogActions>
          <Button onClick={()=>{this.props.handleClose()}} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
