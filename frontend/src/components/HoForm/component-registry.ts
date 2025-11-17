import * as React from 'react';
import type {FieldBase} from './types';
import BaseDynamic, { BaseDynamicProps } from './BaseDynamic';

// Type for class constructors that extend BaseDynamic
// TODO: we probably don't need this once we refactor to functional components
type BaseDynamicConstructor = new () => BaseDynamic;

export class ComponentRegistry{

    dynamicComponents: {
        [key: string] : {
            classType: React.ComponentType<BaseDynamicProps<FieldBase>>,
            proplessInstance: BaseDynamic
        }
    };

    constructor(componentTypes: Array<React.ComponentType<BaseDynamicProps<FieldBase>>>){
        this.dynamicComponents = {};
        for(let i = 0; i < componentTypes.length; i++){
            this.register(componentTypes[i]);
        }
    }

    register(classType: React.ComponentType<BaseDynamicProps<FieldBase>>){
        //$FlowFixMe
        let proplessInstance = new (classType as BaseDynamicConstructor)();
        //$FlowFixMe
        this.dynamicComponents[proplessInstance.getType()] = {
            classType,
            proplessInstance
        };
    }

    getProplessInstance(typeName: string){
        let c = this.dynamicComponents[typeName];
        if(c==null)
            throw new Error(`Could not find component for type '${typeName}'.`);
        return c.proplessInstance;
    }

    getClassType(typeName: string){
        let c = this.dynamicComponents[typeName];
        if(c==null)
            throw new Error(`Could not find component for type '${typeName}'.`);
        return c.classType;
    }

    get(typeName: string){
        let c = this.dynamicComponents[typeName];
        if(c==null)
            throw new Error(`Could not find component for type '${typeName}'.`);
        return c;
    }
}
