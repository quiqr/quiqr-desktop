import { Link } from 'react-router-dom';
import { Component } from 'react';
import service from './../../../services/service';
import Spinner from './../../../components/Spinner';
import MarkdownIt from 'markdown-it'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';

const md = new MarkdownIt({html:true});

const styles = {
  creatorMessage: {
    borderBottom: 'solid 1px transparent',
    padding: '0 20px ',
    fontSize: '90%'
  }
}

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

interface HomeState {
  blockingOperation: string | null;
  currentSiteKey: string | null;
  currentWorkspaceKey?: string;
  buttonPressed: string;
  contentItemCardsSections: CardSection[];
  siteCreatorMessage: string | null;
  configurations: unknown;
  selectedSite: { key: string } | null;
  basePath: string;
  error: unknown;
  showSpinner?: boolean;
}

class Home extends Component<HomeProps, HomeState> {
  _ismounted: boolean = false;

  constructor(props: HomeProps) {
    super(props);
    this.state = {
      blockingOperation: null,
      currentSiteKey: null,
      buttonPressed: "",
      contentItemCardsSections: [],
      siteCreatorMessage: null,
      configurations: null,
      selectedSite: null,
      basePath: "",
      error: null
    };
  }

  componentDidUpdate(preProps: HomeProps) {
    if (this._ismounted && preProps.siteKey !== this.props.siteKey) {
      this.checkSiteInProps();
    }
  }

  componentDidMount() {
    this.checkSiteInProps();
    this._ismounted = true;
  }

  componentWillUnmount() {
    this._ismounted = false;
  }

  checkSiteInProps() {
    const { siteKey, workspaceKey } = this.props;

    if (siteKey && workspaceKey) {
      if (this.state.currentSiteKey !== siteKey) {
        service.api.readConfKey('devDisableAutoHugoServe').then((devDisableAutoHugoServe) => {
          if (!devDisableAutoHugoServe) {
            service.api.serveWorkspace(siteKey, workspaceKey, "Start Hugo from Home");
          }
        });
      }

      this.setState({ currentSiteKey: siteKey });
      this.setState({ currentWorkspaceKey: workspaceKey });

      service.getSiteCreatorMessage(siteKey, workspaceKey).then((message) => {
        const siteCreatorMessage = md.render(message);
        this.setState({ siteCreatorMessage });
      });

      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle) => {
        const stateUpdate: Partial<HomeState> = {};
        stateUpdate.configurations = bundle.configurations;
        stateUpdate.selectedSite = bundle.site as { key: string };
        stateUpdate.basePath = `/sites/${(bundle.site as { key: string }).key}/workspaces/${(bundle.workspace as { key: string }).key}`;

        this.setState(stateUpdate as HomeState);
      }).catch((e) => {
        this.setState({ selectedSite: null, error: e });
      });
    } else {
      service.getConfigurations(true).then((c) => {
        this.setState({ configurations: c });
      });
    }
  }

  renderCard(contentItem: ContentCard) {
    const { title, type, description, key } = contentItem;

    return (
      <Card style={{ width: "250px" }} elevation={3}>
        <CardContent style={{ height: "110px" }}>
          <Typography variant="body2">
            {type}
          </Typography>
          <Typography variant="h5" component="div" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body1">
            {description}
          </Typography>
        </CardContent>
        <CardActions>
          {type === 'collection' ? null : (
            <Button
              size="small"
              color="primary"
              component={Link}
              to={`${this.state.basePath}/singles/${encodeURIComponent(key)}`}
            >
              Open
            </Button>
          )}
          {type === 'collection' ? (
            <Button
              size="small"
              color="primary"
              component={Link}
              to={`${this.state.basePath}/collections/${encodeURIComponent(key)}`}
            >
              List
            </Button>
          ) : null}
        </CardActions>
      </Card>
    );
  }

  render() {
    const { configurations, contentItemCardsSections } = this.state;

    const sections = contentItemCardsSections.map((section, index) => {
      return (
        <Grid container spacing={3} key={"section" + index}>
          {section.cards.map((card, cardIndex) => {
            return (
              <Grid key={"siteCardA" + cardIndex}>
                <Typography>
                  {cardIndex === 0 ? section.title : <span>&nbsp;</span>}
                </Typography>
                {this.renderCard(card)}
              </Grid>
            );
          })}
        </Grid>
      );
    });

    if (this.state.error) {
      return null;
    } else if (this.state.showSpinner || configurations == null || this.state.selectedSite == null) {
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
          dangerouslySetInnerHTML={{ __html: this.state.siteCreatorMessage || '' }}
        />
      </div>
    );
  }
}

export default Home;
