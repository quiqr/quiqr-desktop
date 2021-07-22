const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const formatProviderResolver = require('./../../format-provider-resolver');
const WorkspaceConfigValidator = require('./workspace-config-validator');
const InitialWorkspaceConfigBuilder = require('./initial-workspace-config-builder');
const pathHelper = require('./../../path-helper');
const { FileCacheToken } = require('./file-cache-token');

class WorkspaceConfigProvider{

    constructor(){
        this.cache = {};
    }

    async getConfig(workspacePath, workspaceKey){

        let filePath = this._getFilePath(workspacePath);
        let config;

        if(filePath!=null){
            const cached = this.cache[filePath];
            const token = await new FileCacheToken([filePath]).build();

            if(cached!=null){
                if(await cached.token.match(token)){ //can be reused
                    return cached.config;
                }
            }

            let config = this._loadConfigurationsData(filePath, workspaceKey);
            config.path = workspacePath;
            config.key = workspaceKey;
            this.cache[filePath] = { token, config }
            return config;

        }
        else{
            // need to build default config and update cache
            const newConfig = this._buildDefaultConfig(workspacePath);
            config = newConfig.config;
            filePath = newConfig.path;
            const token = await (new FileCacheToken([filePath])).build();
            config.path = workspacePath;
            config.key = workspaceKey;
            this.cache[filePath] = { token, config }
            return config;
        }
    }

    _getFilePath(workspacePath){
        let fileExp = path.join(workspacePath,'sukoh.{'+formatProviderResolver.allFormatsExt().join(',')+'}');
        return glob.sync(fileExp)[0];
    }

    _buildDefaultConfig(workspacePath){
        let configBuilder = new InitialWorkspaceConfigBuilder(workspacePath);
        let {data, formatProvider} = configBuilder.build();
        let filePath = path.join(workspacePath,'sukoh.'+formatProvider.defaultExt());
        fs.writeFileSync(
            filePath,
            formatProvider.dump(data)
        );
        return { config: data, path: filePath };
    }

    _loadConfigurationsData(filePath, workspaceKey){

        let strData = fs.readFileSync(filePath,'utf8');
        let formatProvider = formatProviderResolver.resolveForFilePath(filePath);
        if(formatProvider==null){
            formatProvider = formatProviderResolver.getDefaultFormat();
        }
        let returnData = formatProvider.parse(strData);

        let validator = new WorkspaceConfigValidator();
        let result = validator.validate(returnData);
        if(result)
            throw new Error(result);
        return returnData;
    }
}

module.exports = {
    WorkspaceConfigProvider
}
