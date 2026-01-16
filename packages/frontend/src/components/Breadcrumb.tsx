import * as React from "react";

import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";

export const FormBreadcrumb = ({ items, onNodeSelected }) => {
  return (
    <Breadcrumbs
      aria-label='breadcrumb'
      style={{
        margin: "12px 0 0 12px",
      }}>
      {items.map((item, index) => {
        if (item.node != null) {
          return (
            <Link color='inherit' key={"link" + index} onClick={() => onNodeSelected(item.node)}>
              {item.label || "Untitled"}
            </Link>
          );
        } else {
          return (
            <Typography color='textPrimary' key={index}>
              {item.label || "Untitled"}
            </Typography>
          );
        }
      })}
    </Breadcrumbs>
  );
};
