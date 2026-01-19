import React, { MouseEventHandler } from "react";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Grid, { GridProps } from "@mui/material/Grid";
import { useSnackbar } from "../contexts/SnackbarContext";
import { copyToClipboard } from "../utils/platform";

//import service         from '../services/service';

interface BundleManagerHeaderProps {
  active: boolean;
  forceActive?: boolean;
  headerLeftItems: React.ReactNode[];
  headerRightItems: React.ReactNode[];
  label: string;
  onClick: MouseEventHandler<HTMLDivElement>;
  style?: React.CSSProperties;
}

interface BundleManagerItemProps {
  active: boolean;
  forceActive?: boolean;
  body: React.ReactNode;
  label: string;
  path: string;
  onHeadClick: MouseEventHandler<HTMLDivElement>;
  headerRightItems?: React.ReactNode[];
  headerLeftItems?: React.ReactNode[];
  headStyle?: React.CSSProperties;
  bundleStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  wrapperProps?: GridProps
}

interface BundleManagerProps {
  style?: React.CSSProperties;
  children: React.ReactElement<BundleManagerItemProps>[];
  forceActive?: boolean;
  index?: number;
  onChange?: (index: number) => void;
}

const BundleManagerHeader = React.memo(
  ({ active, headerLeftItems, headerRightItems, label: originalLabel, onClick, style, forceActive }: BundleManagerHeaderProps) => {
    const { addSnackMessage } = useSnackbar();
    let label = originalLabel;
    if (label.substr(0, 7) === "/static") {
      label = label.substr(7, label.length - 7);
    }
    let filename = label;
    const fExtention = filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
    const fBase = filename.slice(0, filename.lastIndexOf("."));

    if (fBase.length > 15) {
      filename = fBase.substr(0, 7) + "..." + fBase.substr(-5) + "." + fExtention;
    }

    return (
      <div style={style} onClick={onClick}>
        <span style={{ display: "inline-block", margin: "-10px 0px -10px -5px" }}>
          {headerLeftItems.map((item, index) => {
            return (
              <span key={index} style={{ display: "inline-block", margin: "0 5px" }}>
                {item}
              </span>
            );
          })}
        </span>
        <span style={{ position: "absolute", top: "0px", right: "-5px" }}>
          <IconButton
            size='small'
            aria-label='Expand'
            onClick={async () => {
              await copyToClipboard(encodeURI(originalLabel));
              addSnackMessage("File path copied to clipboard", {severity: 'success'});
            }}>
            <FileCopyIcon />
          </IconButton>
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
        <Tooltip title={originalLabel}>
          <span>{filename}</span>
        </Tooltip>
      </div>
    );
  }
);

const BundleManagerItem = ({
  active,
  body,
  label,
  onHeadClick,
  headerRightItems = [],
  headerLeftItems = [],
  headStyle,
  bundleStyle,
  bodyStyle,
  style,
  wrapperProps,
  forceActive,
}: BundleManagerItemProps) => {
  const _style: React.CSSProperties = {
    minWidth: "250px",
    ...style,
  };

  const _headStyle: React.CSSProperties = {
    border: "solid 0px #e8e8e8",
    padding: "12px 0px 12px 8px",
    display: "block",
    cursor: "pointer",
    position: "relative",
    fontSize: 12,
    //color: 'rgba(0, 0, 0, 0.47)'
    ...headStyle,
  };

  const _bodyStyle: React.CSSProperties = {
    display: active ? "block" : "none",
    padding: "8px 0",
    border: "solid 0px #e8e8e8",
    borderTopWidth: 0,
    width: "100%",
    ...bodyStyle,
  };

  const _bundleStyle: React.CSSProperties = {
    margin: "8px",
    padding: "8px",
    border: "solid 0px #e8e8e8",
    boxShadow: "1px 1px 4px RGBA(0,0,0,.2)",
    ...bundleStyle,
  };

  return (
    <Grid size={{ xl: 2, lg: 4, xs: 6 }} style={_style} className='BundleManager-item' {...wrapperProps}>
      <div style={_bundleStyle}>
        <BundleManagerHeader
          style={_headStyle}
          onClick={onHeadClick}
          headerLeftItems={headerLeftItems}
          headerRightItems={headerRightItems}
          forceActive={forceActive}
          active={active}
          label={label}
        />
        <div style={_bodyStyle}>{active ? body : null}</div>
      </div>
    </Grid>
  );
};

const BundleManager = ({ style, children, forceActive, index, onChange }: BundleManagerProps) => {
  const [internalIndex, setInternalIndex] = React.useState(-1);

  const openedIndex = index !== undefined ? index : internalIndex;

  const getHandleChange = React.useCallback(
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
    <Grid container spacing={2} className='BundleManager' style={style}>
      {children.map((item, idx) => {
        const active = forceActive || idx === openedIndex;

        //SPLITPATH ugly hack to prevent displaying files from subdirs TODO REMOVE
        const splitPath = item.props.path.split("/");
        if (splitPath.length < 99) {
          return React.cloneElement(item, {
            key: idx,
            active,
            onHeadClick: getHandleChange(idx),
          });
        }
        return null;
      })}
    </Grid>
  );
};

export { BundleManager, BundleManagerItem };
