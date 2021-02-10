const configurationDataProvider = require('./configuration-data-provider')
const SiteService = require('./services/site/site-service')
const WorkspaceService = require('./services/workspace/workspace-service')
const siteSourceBuilderFactory = require('./site-sources/builders/site-source-builder-factory');
const hugoDownloader = require('./hugo/hugo-downloader')
const fs = require('fs-extra');
const {dirname} = require('path');
const {shell} = require('electron');
const menuManager = require('./menu-manager');
const PoppyGoAppConfig = require('./poppygo-app-config');

const pogozipper = require('./pogozipper');
const PogoPublisher = require('./publishers/pogo-publisher');

let api = {};
let pogoconf = PoppyGoAppConfig();

function bindResponseToContext(promise/*: Promise<any>*/, context/*: any*/){
    promise.then((result)=>{
        context.resolve(result);
    }, (error)=>{
        context.reject(error);
    })
}

function getSiteService(siteKey/*: string*/, callback/*: CallbackTyped<SiteService>*/){
    return getSiteServicePromise(siteKey).then((data)=>{
        callback(null, data);
    },(e)=>{
        callback(e, (null/*: any*/));
    })
}


function getSiteServicePromise(siteKey/*: string*/)/*: Promise<SiteService>*/{
    return new Promise((resolve, reject)=>{
        configurationDataProvider.get(function(err, configurations){

            if(configurations.empty===true) throw new Error('Configurations is empty.');

            if(err) { reject(err); return; }

            let siteData = configurations.sites.find((x)=>x.key===siteKey);

            if(siteData==null) throw new Error('Could not find site is empty.');

            let siteService = new SiteService(siteData);
            resolve(siteService);
        });
    });
}

function getWorkspaceService(siteKey/*: string*/,
    workspaceKey/*: string*/,
    callback/*: CallbackTyped<{siteService: SiteService, workspaceService: WorkspaceService}>*/){
    return getWorkspaceServicePromise(siteKey, workspaceKey).then((data)=>{
        callback(null, data);
    },(e)=>{
        callback(e, (null/*: any*/));
    })
}

async function getWorkspaceServicePromise(siteKey, workspaceKey){
    let siteService/*: SiteService*/ = await getSiteServicePromise(siteKey);
    let workspaceHead = await siteService.getWorkspaceHead(workspaceKey);
    if(workspaceHead==null){
        return Promise.reject(new Error('Could not find workspace.'));
    }
    else{
        let workspaceService = new WorkspaceService(workspaceHead.path, workspaceHead.key, siteKey);
        return { siteService, workspaceService };
    }
}

api.getConfigurations = function(options/*: any*/, context/*: any*/){
    configurationDataProvider.get(function(err, data){
        if(err)
            context.reject(err);
        else
            context.resolve(data);
    }, options);
}

api.openFileExplorer = function({path}/*: any*/, context/*: any*/){
    try{
        let lstat = fs.lstatSync(path);
        if(lstat.isDirectory()){
            shell.openItem(path);
        }
        else{
            shell.openItem(dirname(path));
        }
    }
    catch(e){
    }
}

api.listWorkspaces = async function({siteKey}/*: any*/, context/*: any*/){
    let service = await getSiteServicePromise(siteKey);
    let workspaces = await service.listWorkspaces();
    context.resolve(workspaces);

}

api.getCreatorMessage = async function({siteKey, workspaceKey}, context){
    let siteService/*: SiteService*/ = await getSiteServicePromise(siteKey);
    siteService.getCreatorMessage().then(function(message){
        context.resolve(message);
    });
}

api.getWorkspaceDetails = async function({siteKey, workspaceKey}, context){
    const { workspaceService } = await getWorkspaceServicePromise(siteKey, workspaceKey);
    let configuration /*: any */;
    try{
        configuration = await workspaceService.getConfigurationsData();
        global.currentSiteKey = siteKey;
        global.currentWorkspaceKey = workspaceKey;
        global.currentSitePath = configuration.path;

        pogoconf.setLastOpenedSite(siteKey, workspaceKey, currentSitePath);
        pogoconf.saveState();

    }
    catch(e){
        context.resolve({error: `Could not load workspace configuration (website: ${siteKey}, workspace: ${workspaceKey}). ${e.message}`});
        return;
    }
    try{
        hugoDownloader.downloader.download(configuration.hugover);
    }
    catch(e){
        // warn about HugoDownloader error?
    }
    context.resolve(configuration);

}


api.createKeyPair = async function({},context){
    let pogopubl = new PogoPublisher({});
    pubkey = await pogopubl.keygen();
    context.resolve(pubkey);
}

api.convert07 = async function({},context){
    let pogopubl = new PogoPublisher({});
    await pogopubl.conf07pogoprofile()
    context.resolve(true);
}

api.createPogoProfile = async function(profile,context){
    let pogopubl = new PogoPublisher({});
    await pogopubl.writeProfile(profile.obj)
    context.resolve(true);
}

api.getPoppyGoProfile = async function({},context){
    let pogopubl = new PogoPublisher({});
    profile = await pogopubl.readProfile();
    fingerprint = await pogopubl.getKeyFingerprint();
    if(profile && fingerprint) context.resolve({profile,fingerprint})
}
api.createPogoDomainConf = async function({path,domain},context){
    let pogopubl = new PogoPublisher({});
    await pogopubl.writeDomainInfo(path,domain)
    context.resolve(path);
}
api.getCurrentSiteKey = async function(){
    return await global.currentSiteKey;
}

//TODO USE KEY
api.getPogoConf = async function(key){
    //if(key==='skipWelcomeScreen'){
        return pogoconf.skipWelcomeScreen;
    //}
}




api.mountWorkspace = async function({siteKey, workspaceKey}/*: any*/, context/*: any*/){
    let siteService = await getSiteServicePromise(siteKey);
    bindResponseToContext(
        siteService.mountWorkspace(workspaceKey),
        context
    );

    mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.setTitle(siteKey.toUpperCase() + " - PoppyGo");
    menuManager.updateMenu(siteKey);
    global.currentSiteKey = siteKey;
    global.currentWorkspaceKey = workspaceKey;
    menuManager.createMainMenu();
}

api.parentMountWorkspace = async function({siteKey, workspaceKey}/*: any*/, context/*: any*/){
    mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("redirectMountSite",`/sites/${decodeURIComponent(siteKey)}/workspaces/${decodeURIComponent(workspaceKey)}`)
}

api.parentCloseMobilePreview = function(context){
    mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("disableMobilePreview")
}

api.parentTempHideMobilePreview = function(context){
    mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("tempHideMobilePreview")
}

api.parentTempUnHideMobilePreview = function(context){
    mainWindow = global.mainWM.getCurrentInstanceOrNew();
    mainWindow.webContents.send("tempUnHideMobilePreview")
}

api.openMobilePreview = function(context){
    return new Promise((resolve, reject)=>{
        global.mainWM.openMobilePreview();
    });
}
api.closeMobilePreview = function(context){
    return new Promise((resolve, reject)=>{
        global.mainWM.closeMobilePreview();
    });
}

api.updateMobilePreviewUrl = function({url}, context){
    return new Promise((resolve, reject)=>{
        global.mainWM.setMobilePreviewUrl(url);
    });
}
api.logToConsole = function({message}, context){
    console.log(message);
}

api.importSiteAction = function(context){
    return new Promise((resolve, reject)=>{
        pogozipper.importSite()
    });
}
api.serveWorkspace = function({siteKey, workspaceKey, serveKey}/*: any*/, context/*: any*/){

    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){

        if(err){ context.reject(err); return; }

        if(!workspaceService){ return; }

        console.log("serve:"+serveKey);
        workspaceService.serve(serveKey).then(()=>{
            context.resolve();
        }, ()=>{
            context.reject(err); return
        })
        .catch((error)=>{
            context.reject(error);
        });
    });

    return new Promise((resolve, reject)=>{
        global.mainWM.closeMobilePreview();
    });
}

api.buildWorkspace = function({siteKey, workspaceKey, buildKey}/*: any*/, context/*: any*/){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.build(buildKey).then(()=>{
            context.resolve();
        }, ()=>{
            context.reject(err); return
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.getSingle = function({siteKey, workspaceKey, singleKey}/*: any*/, context/*: any*/) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.getSingle(singleKey).then(r=>{
            context.resolve(r);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.openSingleInEditor = function({siteKey, workspaceKey, singleKey}, context) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.openSingleInEditor(singleKey).then(r=>{
            context.resolve(r);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}
api.updateSingle = function({siteKey, workspaceKey, singleKey, document}/*: any*/, context/*: any*/) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.updateSingle(singleKey, document).then(r=>{
            context.resolve(r);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.listCollectionItems = function({siteKey, workspaceKey, collectionKey}/*: any*/, context/*: any*/){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.listCollectionItems(collectionKey)
        .then((result)=>{
            context.resolve(result)
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.getCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}/*: any*/, context/*: any*/){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.getCollectionItem(collectionKey, collectionItemKey)
        .then((result)=>{
            context.resolve(result);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.createCollectionItemKey = function({siteKey, workspaceKey, collectionKey, collectionItemKey, itemTitle}, context) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.createCollectionItemKey(collectionKey, collectionItemKey, itemTitle)
        .then((result)=>{
            context.resolve(result);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.openFileDialogForCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}, context) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.openCollectionItemInEditor(collectionKey, collectionItemKey)
        .then((result)=>{
            context.resolve(result);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.updateCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey, document}/*: any*/, context/*: any*/) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.updateCollectionItem(collectionKey, collectionItemKey, document)
        .then((result)=>{
            context.resolve(result);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}
api.copyFilesIntoCollectionItem = function ({siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath, files }/*: any*/, context/*: any*/){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.copyFilesIntoCollectionItem(collectionKey, collectionItemKey, targetPath, files)
        .then((result)=>{
            context.resolve(result);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.deleteCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}/*: any*/, context/*: any*/) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.deleteCollectionItem(collectionKey, collectionItemKey)
        .then((result)=>{
            context.resolve({deleted:result});
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.makePageBundleCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey}/*: any*/, context/*: any*/) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.makePageBundleCollectionItem(collectionKey, collectionItemKey)
        .then((result)=>{
            context.resolve({deleted:result});
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}
api.renameCollectionItem = function({siteKey, workspaceKey, collectionKey, collectionItemKey, collectionItemNewKey}/*: any*/, context/*: any*/) {
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ context.reject(err); return; }
        workspaceService.renameCollectionItem(collectionKey, collectionItemKey, collectionItemNewKey)
        .then((result)=>{
            context.resolve(result);
        })
        .catch((error)=>{
            context.reject(error);
        });
    });
}

api.getThumbnailForCollectionItemImage = function({siteKey, workspaceKey, collectionKey, collectionItemKey, targetPath}/*: any*/, promise/*: any*/){
    getWorkspaceService(siteKey, workspaceKey, function(err, {workspaceService}){
        if(err){ promise.reject(err); return; }
        workspaceService.getThumbnailForCollectionItemImage(collectionKey, collectionItemKey, targetPath)
        .then((result)=>{
            promise.resolve(result);
        })
        .catch((error)=>{
            promise.reject(error);
        });
    });
}

api.createSite = function(config/*: any*/, context/*: any*/){
    siteSourceBuilderFactory.get(config.sourceType).build(config).then(() =>{
        configurationDataProvider.invalidateCache();
        context.resolve();
    }, (err)=>{
        context.reject(err);
    });
}

api.setPublishStatus = async function({status}/*: any*/, context/*: any*/){
    let pogopubl = new PogoPublisher({});
    await pogopubl.writePublishStatus(status)
    context.resolve(true);
}

api.publishSite = function({siteKey, publishKey}/*: any*/, context/*: any*/){
    getSiteService(siteKey, function(err, siteService){
        if(err){ context.reject(err); return; }
        siteService.publish(publishKey).then(()=>{
            context.resolve();
        }, ()=>{
            context.reject(err);
        });
    });
}

module.exports = api;
