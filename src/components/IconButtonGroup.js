import React from 'react';

class IconButtonGroup extends React.Component{

    render(){
        let {iconButtons, style} = this.props;
        if(iconButtons===undefined||iconButtons.length===0)
            return null;

        let iconButtonsClones = iconButtons.map((b, key)=>{
            let element = React.cloneElement(b, { key, fontSize:"small"});
            if(this.props.vertical===true)
                return <div key={key}>{element}</div>;
            return element;
        });

        return <div style={style}>
           { iconButtonsClones }
        </div>
    }
}

export default IconButtonGroup;
