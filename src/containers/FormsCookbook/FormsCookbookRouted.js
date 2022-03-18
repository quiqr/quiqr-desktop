import * as React from 'react';
import { Route } from 'react-router-dom';
import { FormsCookbook } from './FormsCookbook';

export class FormsCookbookRouted extends React.Component {

    render(){
        return (<Route
            path={'/forms-cookbook/:sampleKey'}
            render={({history,match})=>{
                return (<FormsCookbook
                    sampleKey={match.params.sampleKey}
                />);
            }}
        />);
    }
}
