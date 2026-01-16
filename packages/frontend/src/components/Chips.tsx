import React, { useState, useEffect, useRef, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import Chip      from '@mui/material/Chip';

const Fragment = React.Fragment;

const Chips = ({ field, fullWidth, items, onPushItem, onRequestDelete, onSwap, sortable }) => {
  const [value, setValue] = useState('');
  const [dragFromIndex, setDragFromIndex] = useState(undefined);
  const [dragToIndex, setDragToIndex] = useState(undefined);
  const documentMouseUpListenerRef = useRef(null);

  const onChangeHandler = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  const onKeyPressHandler = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onPushItem)
        onPushItem(value);
      setValue('');
    }
  }, [onPushItem, value]);

  useEffect(() => {
    return () => {
      if (documentMouseUpListenerRef.current) {
        document.removeEventListener('mouseup', documentMouseUpListenerRef.current);
      }
    };
  }, []);

  const getOnRequestDelete = useCallback((index) => {
    return function(e) {
      e.stopPropagation();
      if (onRequestDelete) {
        onRequestDelete(index);
      }
    };
  }, [onRequestDelete]);

  //DRAG EVENTS
  const getDocumentMouseUpListener = useCallback(() => {
    const listener = function(e) {
      if (onSwap) {
        onSwap(e, { index: dragFromIndex, otherIndex: dragToIndex });
      }
      setDragFromIndex(undefined);
      setDragToIndex(undefined);
      document.removeEventListener('mouseup', listener);
      documentMouseUpListenerRef.current = null;
    };
    documentMouseUpListenerRef.current = listener;
    return listener;
  }, [onSwap, dragFromIndex, dragToIndex]);

  const getOnItemMouseDown = useCallback((index) => {
    return function(e) {
      if (sortable) {
        e.stopPropagation();
        e.preventDefault();
        setDragFromIndex(index);
        setDragToIndex(index);
        document.addEventListener('mouseup', getDocumentMouseUpListener());
      }
    };
  }, [sortable, getDocumentMouseUpListener]);

  const getOnItemMouseEnter = useCallback((index) => {
    return function(e) {
      if (dragFromIndex !== undefined) {
        setDragToIndex(index);
      }
    };
  }, [dragFromIndex]);

  const renderChip = useCallback((index, label, opacity = 1) => {
    return (<Chip
      key={'chip-'+index}
      style={{opacity:opacity, margin:'2px'}}
      onDelete={ getOnRequestDelete(index) }
      onMouseDown={getOnItemMouseDown(index)}
      onMouseEnter={getOnItemMouseEnter(index)}
      label={label}
    />
    );
  }, [getOnRequestDelete, getOnItemMouseDown, getOnItemMouseEnter]);

  const renderDecoyChip = useCallback((index, label, opacity) => {
    return (<Chip
      key={'decoy-chip-'+index}
      style={{opacity:opacity, margin:'2px'}}
      onDelete={function(){}}
      label={label}
    />
    );
  }, []);

  return (
    <Fragment>
      <TextField
        value={value}
        onChange={onChangeHandler}
        fullWidth={fullWidth}
        label={field.title}
        onKeyPress={onKeyPressHandler}
        placeholder="enter chip text and confirm with enter key"
      />
      <div style={{display: 'flex',flexWrap: 'wrap'}}>
        {items.map((item, index) => {

          if(index === dragFromIndex){
            return renderChip(index, item, dragFromIndex !== dragToIndex ? 0.15 : 1);
          }

          if(index === dragToIndex){
            const movedChip = renderDecoyChip(index, items[dragFromIndex], 1);
            let beforeChip, afterChip;
            if(dragFromIndex < dragToIndex)
              afterChip = movedChip;
            else
              beforeChip = movedChip;
            return <Fragment key={'chip'+index}>
              {beforeChip}
              {renderChip(index, item)}
              {afterChip}
            </Fragment>
          }
          else{
            return renderChip(index, item);
          }
        })}
      </div>
    </Fragment>
  );
};

export default Chips;
