import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded';
import { Link as RouterLink } from 'react-router';
import useBreadcrumbs from './useBreadcrumbs';

/**
 * Breadcrumb navigation component.
 * Displays the current page hierarchy with clickable links.
 * The last breadcrumb (current page) is not clickable.
 */
function AppBreadcrumbs() {
  const breadcrumbs = useBreadcrumbs();

  // Don't render if no breadcrumbs
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumbs
      separator={<NavigateNextRoundedIcon fontSize="small" />}
      aria-label="breadcrumb"
      sx={{
        py: 1.5,
        px: 2,
        '& .MuiBreadcrumbs-separator': {
          color: 'text.secondary',
        },
      }}
    >
      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        // Last breadcrumb or breadcrumb without path → render as text
        if (isLast || !crumb.path) {
          return (
            <Typography
              key={index}
              color="text.primary"
              fontSize="0.875rem"
              fontWeight={isLast ? 500 : 400}
            >
              {crumb.label}
            </Typography>
          );
        }

        // Render as link
        return (
          <Link
            key={index}
            component={RouterLink}
            to={crumb.path}
            color="text.secondary"
            underline="hover"
            fontSize="0.875rem"
            sx={{
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            {crumb.label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
}

export default AppBreadcrumbs;
