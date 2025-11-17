import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';

const DangerButton = ({ onClick, loadedButton, button, loadedProps }) => {
  const [clicked, setClicked] = useState(false);
  const timeoutRef = useRef(null);

  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimeoutRef();
    };
  }, [clearTimeoutRef]);

  const onButtonClick = useCallback((e) => {
    if (onClick) {
      onClick(e, clicked);
    }

    if (clicked) {
      setClicked(false);
      clearTimeoutRef();
    } else {
      setClicked(true);

      timeoutRef.current = setTimeout(() => {
        setClicked(false);
      }, 3000);
    }
  }, [onClick, clicked, clearTimeoutRef]);

  if (loadedButton) {
    return React.cloneElement(
      (clicked ? loadedButton : button),
      { onClick: onButtonClick }
    );
  } else {
    const _props = Object.assign(
      {},
      (clicked ? loadedProps : undefined),
      { onClick: onButtonClick }
    );
    return React.cloneElement(button, _props);
  }
};

export default DangerButton;
