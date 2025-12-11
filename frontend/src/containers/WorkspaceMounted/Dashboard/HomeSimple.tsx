import { Link } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import service from './../../../services/service';
import Spinner from './../../../components/Spinner';
import MarkdownIt from 'markdown-it';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

const md = new MarkdownIt({ html: true });

const styles = {
  creatorMessage: {
    borderBottom: 'solid 1px transparent',
    padding: '0 20px ',
    fontSize: '90%',
  },
};

interface HomeProps {
  siteKey: string;
  workspaceKey: string;
  applicationRole?: string;
}

interface ContentCard {
  type: string;
  title: string;
  key: string;
  description?: string;
  itemTitle?: string;
}

interface CardSection {
  title: string;
  cards: ContentCard[];
}

function Home({ siteKey, workspaceKey }: HomeProps) {
  const [contentItemCardsSections, setContentItemCardsSections] = useState<CardSection[]>([]);
  const [siteCreatorMessage, setSiteCreatorMessage] = useState<string | null>(null);
  const [configurations, setConfigurations] = useState<unknown>(null);
  const [selectedSite, setSelectedSite] = useState<{ key: string } | null>(null);
  const [basePath, setBasePath] = useState('');
  const [error, setError] = useState<unknown>(null);
  const previousSiteKeyRef = useRef<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (siteKey && workspaceKey) {
        if (previousSiteKeyRef.current !== siteKey) {
          const devDisableAutoHugoServe = await service.api.readConfKey('devDisableAutoHugoServe');
          if (!devDisableAutoHugoServe) {
            service.api.serveWorkspace(siteKey, workspaceKey, 'Start Hugo from Home');
          }
        }

        previousSiteKeyRef.current = siteKey;

        const message = await service.getSiteCreatorMessage(siteKey, workspaceKey);
        if (isMountedRef.current) {
          setSiteCreatorMessage(md.render(message));
        }

        try {
          const bundle = await service.getSiteAndWorkspaceData(siteKey, workspaceKey);
          if (isMountedRef.current) {
            setConfigurations(bundle.configurations);
            setSelectedSite(bundle.site as { key: string });
            setBasePath(`/sites/${(bundle.site as { key: string }).key}/workspaces/${(bundle.workspace as { key: string }).key}`);
          }
        } catch (e) {
          if (isMountedRef.current) {
            setSelectedSite(null);
            setError(e);
          }
        }
      } else {
        const c = await service.getConfigurations(true);
        if (isMountedRef.current) {
          setConfigurations(c);
        }
      }
    };

    loadData();
  }, [siteKey, workspaceKey]);

  const renderCard = (contentItem: ContentCard) => {
    const { title, type, description, key } = contentItem;

    return (
      <Card style={{ width: '250px' }} elevation={3}>
        <CardContent style={{ height: '110px' }}>
          <Typography variant="body2">{type}</Typography>
          <Typography variant="h5" component="div" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1">{description}</Typography>
        </CardContent>
        <CardActions>
          {type === 'collection' ? null : (
            <Button size="small" color="primary" component={Link} to={`${basePath}/singles/${encodeURIComponent(key)}`}>
              Open
            </Button>
          )}
          {type === 'collection' ? (
            <Button size="small" color="primary" component={Link} to={`${basePath}/collections/${encodeURIComponent(key)}`}>
              List
            </Button>
          ) : null}
        </CardActions>
      </Card>
    );
  };

  const sections = contentItemCardsSections.map((section, index) => {
    return (
      <Grid container spacing={3} key={'section' + index}>
        {section.cards.map((card, cardIndex) => {
          return (
            <Grid key={'siteCardA' + cardIndex}>
              <Typography>{cardIndex === 0 ? section.title : <span>&nbsp;</span>}</Typography>
              {renderCard(card)}
            </Grid>
          );
        })}
      </Grid>
    );
  });

  if (error) {
    return null;
  } else if (configurations == null || selectedSite == null) {
    return <Spinner />;
  }

  return (
    <div>
      <Box m={3}>
        <Grid container spacing={3}>
          {sections}
        </Grid>
      </Box>
      <div
        className="markdown site-home-text"
        style={styles.creatorMessage}
        dangerouslySetInnerHTML={{ __html: siteCreatorMessage || '' }}
      />
    </div>
  );
}

export default Home;
