import React from 'react';

const IconButtonGroup = ({ iconButtons, style, vertical = false }) => {
    if (iconButtons === undefined || iconButtons.length === 0)
        return null;

    const iconButtonsClones = iconButtons.map((b, key) => {
        const element = React.cloneElement(b, { key, fontSize: "small" });
        if (vertical === true)
            return <div key={key}>{element}</div>;
        return element;
    });

    return <div style={style}>
        {iconButtonsClones}
    </div>;
};

export default IconButtonGroup;
