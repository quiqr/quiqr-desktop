import React from 'react';
import { Breadcumb, BreadcumbItem } from './Breadcumb';
import Divider from 'material-ui-02/Divider'
import {List, ListItem} from 'material-ui-02/List'
import FileFolderIcon from 'material-ui-02/svg-icons/file/folder';
import FileIcon from 'material-ui-02/svg-icons/editor/insert-drive-file';

const Fragment = React.Fragment;

class ResourceManager extends React.Component{

    getHandleItemClick(type, fileName){
        return () =>{
            let path = ['.', ...this.props.currentPath];
            if(this.props.handleItemClick)
                this.props.handleItemClick({type, path, fileName});
        }
    }

    getHandleBreadcumbItemClick(path){
        return () =>{
            if(this.props.handleBreadcumbItemClick)
                this.props.handleBreadcumbItemClick({path});
        }
    }

    isAncestorOrSame(branchPath, currentPath){
        if(branchPath.length>currentPath.length)
            return -1;//none
        for(let i = 0; i < branchPath.length; i++){
            if(branchPath[i]!==currentPath[i])
                return false;
        }
        return branchPath.length === currentPath.length ? 1 : 0;
    }

    renderBranch(fileTreeBranch){
        return fileTreeBranch
            .sort((a, b) => {
                let aIsFolder = a.files!==undefined;
                let bIsFolder = b.files!==undefined;
                if(aIsFolder!=bIsFolder){
                    return bIsFolder - aIsFolder;
                }
                return b.name < a.name;
            })
            .map((file, i) => {
                let isLast = i === fileTreeBranch.length-1;
                if(file.files===undefined){
                    return <Fragment>
                        <ListItem
                            primaryText={file.name}
                            onClick={this.getHandleItemClick('file', file.name)}
                            leftIcon={<FileIcon />} />
                        { isLast ? undefined : <Divider />}
                    </Fragment>
                }
                else{
                    return <Fragment>
                        <ListItem
                            primaryText={file.name}
                            onClick={this.getHandleItemClick('folder', file.name)}
                            leftIcon={<FileFolderIcon />} />
                        { isLast ? undefined : <Divider />}
                    </Fragment>
                }
            });
    }

    crawlLevel(fileTreeBranch, branchPath){
        let isAncestorOrSame = this.isAncestorOrSame(branchPath, this.props.currentPath);
        if(isAncestorOrSame===1){ //we'll render the current branch
            return this.renderBranch(fileTreeBranch);
        }
        else if(isAncestorOrSame===0){ //ancestor
            //lets keep crawling
            for(let i = 0; i < fileTreeBranch.length; i++){
                let file = fileTreeBranch[i];
                if(file.files!==undefined){
                    branchPath.push(file.name);
                    let crawlReturn = this.crawlLevel(file.files, branchPath);
                    if(crawlReturn!==null)
                        return crawlReturn;
                }
            }
        }
        return undefined;
    }

    render(){
        let { fileTree, currentPath = [] } = this.props;
        let items = this.crawlLevel(fileTree, []);

        let pathWithRoot = ['.'].concat(currentPath);

        let tempPath = [];
        return (<React.Fragment>
            <Breadcumb
                items={ pathWithRoot.map((pathFragment,i)=>{
                    tempPath.push(pathFragment);
                    let itemPath = tempPath.slice(0);
                    let isLast = i===pathWithRoot.length-1;
                    return (<BreadcumbItem
                        label={pathFragment}
                        onClick={this.getHandleBreadcumbItemClick(itemPath)}
                        disabled={isLast}
                    />);
                })}
            />
            <List>
                { items===undefined?<ListItem primaryText="The current folder does not exist" disabled={true} />:items }
            </List>
        </React.Fragment>);

    }
}

export default ResourceManager;
