import * as React from 'react';
import Border from './../Border';
//import { FieldsExtender } from './fields-extender';

export class BaseDynamic extends React.Component {

    // override this to set defaults in the field configuration.
    extendField(field, extender){
        if(field.field){
            extender.extendFields([field.field]);
        }
        if(field.fields){
            extender.extendFields([field.fields]);
        }
    }

    // override this to set a initial value, a default value or a calculated value (e.g: "now" converts to a date).
    normalizeState({state, field, stateBuilder}){

    }

    shouldComponentUpdate(nextProps, nextState){
        return true;
    }

    // override if the component is a container
    // the default behavior is fine for a leaf component
    buildPathFragment(node, nodeLevel, nodes) {
        return node.field.key;
    }

    // override if the component is a container
    //leaf components don't need to build a breadcumb fragment
    //but components that nest others must do
    buildBreadcumbFragment(currentNode, items){

    }

    // overriding this you can reallocate the state level. e.g: set it to the rootState.
    // this method was primarily created to allow components that manage resources to be
    // locatted at any level of the component tree
    allocateStateLevel(field, parentState, rootState){
        return parentState;
    }

    // override these always
    renderComponent() {
        return (<p>empty</p>);
    }

    // override this with a unique key for the component
    getType() {
        return '';
    }

    // override these bellow if the component have a non default getter/setter, like the ResourceManager (which was deleted)
    getValue(context){
        let value = context.node.state[context.node.field.key];
        if(value && Array.isArray(value)) value = value.slice(0);
        return value;
    }
    setValue(context, value){
        context.node.state[context.node.field.key] = value;
    }
    clearValue(context){
        delete context.node.state[context.node.field.key];
    }

    /*
     *  Don't override the methods below!
     */

    componentDidCatch(error , info) {
        // Display fallback UI

        //$FlowFixMe
        this.setState({ hasError: true });
        console.warn(error, info);
    }

    getSomethingWentWrongMessage(){
        let context = this.props.context;
        if(context===undefined){
            return (<Border style={{marginTop:16}}>
                <p style={{margin:16}}>
                    <span>Something went wrong while processing the </span><b>{this.getType()}</b>
                </p>
            </Border>);
        }
        return (<Border style={{marginTop:16}}>
            <p style={{margin:16}}>
                <span>Something went wrong while processing the </span>
                <b>{this.getType()}</b>
                <span> of key </span>
                <b>{this.props.context.node.field.key}</b>
                <pre>
                    {JSON.stringify({
                        nodePath: context.nodePath,
                        parentPath: context.parentPath
                    }, null, '  ')}
                </pre>
            </p>
        </Border>);
    }

    render() {
        if (this.state && this.state.hasError) {
            return this.getSomethingWentWrongMessage();
        }
        return this.renderComponent();
    }
}

export default BaseDynamic;
