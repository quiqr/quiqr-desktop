import React, { useState, useEffect, useRef } from "react";

const Spinner = ({ time = 3000, spins = 3, color = "rgba(0, 0, 0, 0.2)", margin = "40em", size = 48 }) => {
  const [rotated, setRotated] = useState(false);
  const timeoutRef = useRef();

  const spin = () => {
    timeoutRef.current = setTimeout(() => {
      setRotated((prev) => !prev);

      timeoutRef.current = setTimeout(() => {
        spin();
      }, time);
    }, 300);
  };

  useEffect(() => {
    spin();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const borderWidth = Math.max(1, parseInt(size / 10, 10));
  const borderStyle = `${borderWidth}em solid ${color}`;
  const style = {
    margin: margin,
    fontSize: "1px",
    position: "relative",
    borderTop: borderStyle,
    borderRight: borderStyle,
    borderBottom: borderStyle,
    borderLeft: `${borderWidth}em solid transparent`,
    borderRadius: "50%",
    width: size || "80em",
    height: size || "80em",
    transition: "transform ease-in-out " + time + "ms",
    transform: "rotate(" + (rotated ? 360 * spins : 0) + "deg)",
  };

  return (
    <div>
      <div style={style}></div>
    </div>
  );
};

export default Spinner;
