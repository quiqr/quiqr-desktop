import * as React        from 'react';
import IconBroken         from '@mui/icons-material/BrokenImage';
import FolderOpen        from '@mui/icons-material/FolderOpen';
import Button            from '@mui/material/Button';
import Dialog            from '@mui/material/Dialog';
import DialogActions     from '@mui/material/DialogActions';
import DialogContent     from '@mui/material/DialogContent';
import DialogTitle       from '@mui/material/DialogTitle';
import Grid              from '@mui/material/Grid';
import Spinner           from './Spinner';
import service           from '../services/service';

const extensions = [ 'gif' , 'png' , 'svg' , 'jpg' , 'jpeg' ];

type ImageThumbProps = {
  getBundleThumbnailSrc: (imagePath: string) => Promise<string>;
  imagePath: string;
  onClick?: () => void;
};

type ImageThumbState = {
  src: string | null | 'NOT_FOUND' | undefined;
};

class ImageThumb extends React.Component<ImageThumbProps, ImageThumbState>{

  constructor(props: ImageThumbProps){
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
          this.state.src === undefined ? (<Spinner size={32} margin={'16px'} color={ 'RGBA(255,255,255,.3)' } />)
          : this.state.src === 'NOT_FOUND'? (<IconBroken className="fadeIn animated" style={{width:32, height:32, margin:16, color:'#e84b92'}} />)
          :
            (
              <img src={this.state.src} alt="" className="fadeIn animated" style={{cursor: "pointer", width:'100%', marginBottom:'-7px'}} />
            )
        }
      </div>);
  }
}

interface DialogConf {
  visible: boolean;
  title: string;
}

interface FormProps {
  siteKey: string;
  workspaceKey: string;
  collectionKey?: string;
  collectionItemKey?: string;
}

interface ImageItem {
  filename: string;
  src: string;
}

type SelectImagesDialogProps = {
  conf: DialogConf;
  formProps: FormProps;
  uploadPath: string;
  reload: () => void;
  style?: React.CSSProperties;
  imageItems: ImageItem[];
  getBundleThumbnailSrc: (imagePath: string) => Promise<string>;
  handleSelect: (filename: string) => void;
  handleClose: () => void;
};

export default class SelectImagesDialog extends React.Component<SelectImagesDialogProps>{
  getExt(file: string){
    return file.split('.').pop()?.toLowerCase() || '';
  }

  isImage(file: string){
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

            <Grid container spacing={2} className="BundleManager" style={this.props.style}>
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
                      <Grid item xl={2} lg={4} xs={6} className="BundleManager-item" key={"imageitem-"+index}>
                        <Button title={fBase} onClick={()=>{this.props.handleSelect(item.filename)}} color="primary">
                          {filename}
                        </Button>
                        <Button  onClick={()=>{this.props.handleSelect(item.filename)}}>
                          <ImageThumb
                            onClick={()=>{this.props.handleSelect(item.filename)}}
                            getBundleThumbnailSrc={this.props.getBundleThumbnailSrc}
                            imagePath={item.src} />
                        </Button>

                      </Grid>
                    )
                  }
                  else{
                    return null
                  }
                })
              }
            </Grid>

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
