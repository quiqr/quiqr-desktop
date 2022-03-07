import * as React from 'react';
import { Dialog, FlatButton } from 'material-ui-02';
import type { SiteConfig, WorkspaceHeader, WorkspaceConfig } from './../../../types';

type PublishSiteDialogProps = {
    site: SiteConfig,
    workspace: WorkspaceConfig,
    workspaceHeader: WorkspaceHeader,
    open: bool,
    onCancelClick: ()=>void,
    onBuildAndPublishClick: ({siteKey: string, workspaceKey:string, build:string, publish:string})=>void
}

type PublishSiteDialogState = {
    build: string,
    publish: string
}

export default class PublishSiteDialog extends React.Component<PublishSiteDialogProps,PublishSiteDialogState>{

    constructor(props: PublishSiteDialogProps){
        super(props);
        this.state = {
            build: '',
            publish: ''
        }
    }

    handleCancelClick = () => {
        this.props.onCancelClick();
    }

    handleBuildAndPublishClick = () => {
        this.props.onBuildAndPublishClick({
            siteKey:this.props.site.key,
            workspaceKey: this.props.workspaceHeader.key,
            build: this.state.build,
            publish: this.state.publish
        });
    }

    handlePublishChange = (e: any, index: number) => {
        this.setState({publish: this.props.site.publish[index].key});
    }

    handleBuildChange = (e: any, index: number) => {
        this.setState({build: this.props.workspace.build[index].key});
    }

    validate(){
        return this.state.build!==''&&this.state.publish!=='';
    }
    render(){

        let { open, workspace, site } = this.props;
        let { build, publish } = this.state;

        if(build==="" && workspace.build.length > 0){
            this.setState({build: this.props.workspace.build[0].key});
        }

        if(publish==="" && site.publish.length > 0){
            this.setState({publish: this.props.site.publish[0].key});
        }

        let valid = this.validate();

        const actions = [
            <FlatButton
                label="Cancel"
                primary={false}
                onClick={this.handleCancelClick.bind(this)}
            />,
            <FlatButton
                disabled={!valid}
                label="Build and Publish"
                primary={true}
                onClick={this.handleBuildAndPublishClick}
            />,
        ];

        let title = "Publish "+this.props.site.name + " to Quiqr Cloud"
        let text = "Publish changes to the Quiqr Webservers.";

        return (
            <Dialog
            title={title}
            open={open}
            actions={actions}>
            <div>
                {text}
            </div>
        </Dialog>
        );
    }

}
