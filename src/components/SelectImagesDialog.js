import * as React        from 'react';
import IconBroken         from '@material-ui/icons/BrokenImage';
import FolderOpen        from '@material-ui/icons/FolderOpen';
import Button            from '@material-ui/core/Button';
import Dialog            from '@material-ui/core/Dialog';
import DialogActions     from '@material-ui/core/DialogActions';
import DialogContent     from '@material-ui/core/DialogContent';
import DialogTitle       from '@material-ui/core/DialogTitle';
import Spinner           from './Spinner';
import service           from '../services/service';

const extensions = [ 'gif' , 'png' , 'svg' , 'jpg' , 'jpeg' ];

class ImageThumb extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      src: null
    }
  }

  checkThumbs(){
    this.props.getBundleThumbnailSrc(this.props.imagePath)
      .then((src)=>{
        this.setState({src});
      });
  }

  componentDidMount(){
    this.checkThumbs();
  }

  render(){
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



export default class SelectImagesDialog extends React.Component{
  getExt(file){
    return file.split('.').pop().toLowerCase();
  }

  isImage(file){
    if(file){
      if( extensions.includes(this.getExt(file)) ){
        return true;
      }
    }

    return false;
  }

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

          <Button startIcon={<FolderOpen />} variant="contained"  onClick={()=>{

            let {formProps} = this.props;

            service.api.openFileDialogForSingleAndCollectionItem(
              formProps.siteKey,
              formProps.workspaceKey,
              formProps.collectionKey,
              formProps.collectionItemKey,
              this.props.uploadPath,
              { title: "Select File to add" , extensions: extensions})
              .then(()=>{ this.props.reload();
              });

            }}>
            Add File
          </Button>

            <div className="BundleManager row" style={this.props.style}>
              {
                this.props.imageItems.map((item, index)=>{

                  let filename = item.filename;
                  let fExtention = filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
                  let fBase = filename.slice(0,(filename.lastIndexOf(".") ));

                  if(fBase.length > 15){
                    filename = fBase.substr(0,7) + "..." + fBase.substr(-5) + "." +fExtention;
                  }


                  if(this.isImage(item.filename)){
                    return (
                      <div className="BundleManager-item col-xl-2 col-lg-4 col-6" key={"imageitem-"+index}>
                        <Button title={fBase} onClick={()=>{this.props.handleSelect(item.filename)}} color="primary">
                          {filename}
                        </Button>
                        <Button  onClick={()=>{this.props.handleSelect(item.filename)}}>
                          <ImageThumb
                            onClick={()=>{this.props.handleSelect(item.filename)}}
                            getBundleThumbnailSrc={this.props.getBundleThumbnailSrc}
                            imagePath={item.src} />
                        </Button>

                      </div>
                    )
                  }
                  else{
                    return null
                  }
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
