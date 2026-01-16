import React from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";

interface AccordionHeaderProps {
  active: boolean;
  headerLeftItems: React.ReactNode[];
  headerRightItems: React.ReactNode[];
  label: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  style?: React.CSSProperties;
  forceActive?: boolean;
}

interface AccordionItemProps {
  active: boolean;
  body: React.ReactNode;
  label: React.ReactNode;
  onHeadClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  headerRightItems?: React.ReactNode[];
  headerLeftItems?: React.ReactNode[];
  headStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  wrapperProps?: React.HTMLProps<HTMLDivElement>;
  forceActive?: boolean;
}

const AccordionHeader: React.FC<AccordionHeaderProps> = React.memo(({ active, headerLeftItems, headerRightItems, label, onClick, style, forceActive }) => {
  return (
    <Box style={style} onClick={onClick}>
      <span style={{ display: "inline-block", margin: "-10px 0px -10px -5px" }}>
        {headerLeftItems.map((item, index) => {
          return (
            <span key={index} style={{ display: "inline-block", margin: "0 5px" }}>
              {item}
            </span>
          );
        })}
      </span>
      <span style={{ position: "absolute", top: "8px", right: "5px" }}>
        {headerRightItems.map((item, index) => {
          return (
            <span key={index} style={{ display: "inline-block", margin: "0 5px" }}>
              {item}
            </span>
          );
        })}
        {forceActive ? undefined : (
          <IconButton size='small' aria-label='Expand'>
            {active ? <ExpandLessIcon /> : <ExpandMoreIcon />}{" "}
          </IconButton>
        )}
      </span>
      {label}
    </Box>
  );
});

const AccordionItem: React.FC<AccordionItemProps> = ({
  active,
  body,
  label,
  onHeadClick,
  headerRightItems = [],
  headerLeftItems = [],
  headStyle,
  bodyStyle,
  style,
  wrapperProps,
  forceActive,
}) => {
  const _headStyle: React.CSSProperties = {
    border: "solid 1px #d8d8d8",
    padding: "16px",
    display: "block",
    cursor: "pointer",
    marginTop: 8,
    position: "relative",
    ...headStyle,
  };

  const _bodyStyle: React.CSSProperties = {
    display: active ? "block" : "none",
    padding: "16px 0",
    border: "solid 1px #d8d8d8",
    borderTopWidth: 0,
    ...bodyStyle,
  };

  return (
    <div style={style} className='accordion-item' {...wrapperProps}>
      <AccordionHeader
        style={_headStyle}
        onClick={onHeadClick}
        headerLeftItems={headerLeftItems}
        headerRightItems={headerRightItems}
        forceActive={forceActive}
        active={active}
        label={label}
      />
      <Box style={_bodyStyle}>{active ? body : null}</Box>
    </div>
  );
};

interface AccordionProps {
  index?: number;
  onChange?: (index: number) => void;
  style?: React.CSSProperties;
  forceActive?: boolean;
  children: React.ReactElement<AccordionItemProps>[];
}

const Accordion: React.FC<AccordionProps> = ({ index, onChange, style, forceActive, children }) => {
  const [internalIndex, setInternalIndex] = React.useState(-1);

  const openedIndex = index !== undefined ? index : internalIndex;

  const handleChange = React.useCallback(
    (i: number) => {
      return () => {
        if (index !== undefined) {
          if (onChange) {
            onChange(i);
          }
        } else {
          const newIndex = i !== internalIndex ? i : -1;
          setInternalIndex(newIndex);
        }
      };
    },
    [index, onChange, internalIndex]
  );

  return (
    <div className='accordion' style={style}>
      {children.map((item, idx) => {
        const active = forceActive || idx === openedIndex;
        return React.cloneElement(item, {
          active,
          onHeadClick: handleChange(idx),
        });
      })}
    </div>
  );
};

export { Accordion, AccordionItem };
