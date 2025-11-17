import * as React from 'react';

const UpdatableComponent = ({ children, update }) => {
    return children;
};

export const Updatable = React.memo(UpdatableComponent, (prevProps, nextProps) => {
    return !nextProps.update;
});
