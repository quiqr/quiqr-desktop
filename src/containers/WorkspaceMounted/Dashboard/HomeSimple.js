import { Route }               from 'react-router-dom';
import React                   from 'react';
import service                 from './../../../services/service';
import Spinner                 from './../../../components/Spinner';
import muiThemeable            from 'material-ui-02/styles/muiThemeable';
import MarkdownIt              from 'markdown-it'
import Button                 from '@material-ui/core/Button';
import Typography                 from '@material-ui/core/Typography';
import Box                 from '@material-ui/core/Box';
import Grid                 from '@material-ui/core/Grid';
import Card                 from '@material-ui/core/Card';
import CardContent                 from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';

const md = new MarkdownIt({html:true});

const styles = {

  /*

  container:{
    display:'flex',
    height: '100%'
  },


  sitesCol: {
    flex: '0 0 280px',
    overflowY:'auto',
    overflowX:'hidden',
    userSelect:'none',
    borderRight: 'solid 1px #e0e0e0',
    background:'#fafafa'
  },
  selectedSiteCol: {
    flex: 'auto',
    overflow: 'auto'
  },
  siteActiveStyle: {
    fontWeight: 'bold',
    backgroundColor: 'white',
    borderBottom: 'solid 1px #e0e0e0',
    borderTop: 'solid 1px #e0e0e0',
    position: 'relative'
  },
  siteInactiveStyle: {
    borderBottom: 'solid 1px transparent',
    borderTop: 'solid 1px transparent'
  },
  */

  creatorMessage: {
    borderBottom: 'solid 1px transparent',
    padding: '0 20px ',
    fontSize: '80%'
  }
}

class Home extends React.Component{

  history: any;

  constructor(props){
    super(props);
    this.state = {
      blockingOperation: null,
      currentSiteKey: null,
      buttonPressed: "",
      contentItemCardsSections: [],
      siteCreatorMessage: null
    };
    this._ismounted = false;
  }

  componentDidUpdate(preProps){
    if(this._ismounted && preProps.siteKey !== this.props.siteKey){
      this.checkSiteInProps();
    }
  }

  componentDidMount(){
    this.checkSiteInProps();
    this._ismounted = true;
  }

  componentWillUnmount(){
    this._ismounted = false;
  }

  checkSiteInProps(){

    var { siteKey, workspaceKey } = this.props;

    if(siteKey && workspaceKey){

      if(this.state.currentSiteKey !== siteKey){
        service.api.readConfKey('devDisableAutoHugoServe').then((devDisableAutoHugoServe)=>{
          if(!devDisableAutoHugoServe){
            service.api.serveWorkspace(siteKey, workspaceKey, "Start Hugo from Home");
          }
        });
      }

      this.setState({currentSiteKey: siteKey});
      this.setState({currentWorkspaceKey: workspaceKey});

      service.getSiteCreatorMessage(siteKey, workspaceKey).then((message)=>{
        let siteCreatorMessage = md.render(message);
        this.setState({siteCreatorMessage:siteCreatorMessage});
      });

      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
        var stateUpdate  = {};
        stateUpdate.configurations = bundle.configurations;
        stateUpdate.selectedSite = bundle.site;

        //stateUpdate.selectedSiteWorkspaces = bundle.siteWorkspaces;
        //stateUpdate.selectedWorkspace = bundle.workspace;
        stateUpdate.basePath = `/sites/${bundle.site.key}/workspaces/${bundle.workspace.key}`;
        stateUpdate.contentItemCardsSections = this.prepareMenuCards(bundle.workspaceDetails);
        //service.api.logToConsole(stateUpdate.contentItemCardsSections)
        //this.prepareMenuCards(bundle.workspaceDetails);

        this.setState(stateUpdate);
      }).catch(e=>{
        this.setState({site: null, workspace: null, error: e});
      });
    }
    else{
      service.getConfigurations(true).then((c)=>{
        var stateUpdate  = {};
        stateUpdate.configurations = c;
        this.setState(stateUpdate);
      })
    }
  }

  prepareMenuCards(workspaceDetails){
    let cardsSections=[];
    if(workspaceDetails.menu && workspaceDetails.menu.length > 0 ){

      workspaceDetails.menu.forEach((menu)=>{

        if(typeof menu.matchRole === 'undefined' || this.props.applicationRole === menu.matchRole){

          let section = {
            title: menu.title,
            cards: []
          }

          menu.menuItems.forEach((item)=>{
            let workspaceItem = workspaceDetails.collections.find(x => x.key === item.key);
            let card = {};

            if(workspaceItem){
              card.type = "collection";
              card.itemTitle = workspaceItem.itemtitle;
            }
            else{
              workspaceItem = workspaceDetails.singles.find(x => x.key === item.key);
              if(workspaceItem){
                card.type = "single";
              }
            }

            if(workspaceItem){
              card.title = workspaceItem.title;
              card.key = workspaceItem.key;
              card.description = workspaceItem.description;
              section.cards.push(card);
            }


          });

          cardsSections.push(section);

        }

      });

    }

    return cardsSections;
  }

  renderCard(contentItem){

    const {title, type, description, key} = contentItem;

    return (
      <Card style={{ width: "250px" }} elevation={3}>
        <CardContent style={{ height: "110px" }}>
          <Typography color="text.secondary" variant="body2" >
            {type}
          </Typography>
          <Typography variant="h5" component="div" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body">
            {description}
          </Typography>
        </CardContent>
        <CardActions>
          {(type === 'collection' ? null : <Button size="small"
            onClick={()=>{
              service.api.redirectTo(`${this.state.basePath}/singles/${encodeURIComponent(key)}`)
            }}
          >Open</Button>)}

          {(type === 'collection' ? <Button size="small"
            onClick={()=>{
              service.api.redirectTo(`${this.state.basePath}/collections/${encodeURIComponent(key)}`)
            }}
          >List</Button> : null)}
        </CardActions>
      </Card>
    );
  }


  render(){

    let { configurations, contentItemCardsSections } = this.state;

    let sections;
    sections = contentItemCardsSections.map((section)=>{

      return (

        <React.Fragment>
          {section.cards.map((card, index)=>{

            return (
              <Grid
                key={"siteCardA"+index}
                item
              >
                <Typography  color="text.secondary">
                  {(index === 0 ? section.title : <span>&nbsp; </span> )}
                </Typography>
                {this.renderCard(card)}
              </Grid>
            )
          })}
        </React.Fragment>
      )

    })

    if(this.state.error){
      return null

    }
    else if( this.state.showSpinner || configurations == null || this.state.selectedSite == null ){
      return <Spinner />
    }

    return (
      <Route render={({history}) => {
        this.history = history;

        return (
          <div style={ styles.container }>

            <Box m={3}>

              <Grid container spacing={3} >
                {sections}
              </Grid>
            </Box>

            <div className="markdown" style={ styles.creatorMessage } dangerouslySetInnerHTML={{__html:this.state.siteCreatorMessage}} />

          </div>
        )
      }}/>

    );
  }

}

export default muiThemeable()(Home);
