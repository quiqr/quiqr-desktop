import React from 'react';
import TextField from 'material-ui-02/TextField';

class PreviewButtons extends React.Component{

    constructor(props){
        super(props);
        this.state = {
            previewPath: '/'
        };
    }

    setUrl(event,url){
        let path = url.split('13131')[1];
        if(path === ''){
            path = "/";
        }

        this.setState({previewPath: path});
    }

    componentWillMount(){
        window.require('electron').ipcRenderer.on('previewButtonsShowingUrl', this.setUrl.bind(this));
    }

    componentWillUnmount(){
        window.require('electron').ipcRenderer.removeListener('previewButtonsShowingUrl', this.setUrl.bind(this));
    }

    render(){
        return (<React.Fragment>
            <div style={{padding:10 }}>
                <TextField
                value={this.state.previewPath}
                errorText="Preview"
                errorStyle={{color:"#03DAC5"}}
                disabled={false}
                floatingLabelFixed={true}
                underlineShow={true}
                fullWidth={true}
                underlineFocusStyle={{ borderColor: "#bbb" }}
                textareaStyle={{ color:"#999" }}
                inputStyle={{ color:"#999" }}

                />

            </div>
        </React.Fragment>);
    }
}

export default PreviewButtons;
