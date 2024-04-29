import { Route }    from 'react-router-dom';
import React        from 'react';
import service      from './../../../services/service';
import Spinner      from './../../../components/Spinner';
import MarkdownIt   from 'markdown-it'
import Button       from '@material-ui/core/Button';
import Typography   from '@material-ui/core/Typography';
import Box          from '@material-ui/core/Box';
import Grid         from '@material-ui/core/Grid';
import Card         from '@material-ui/core/Card';
import CardContent  from '@material-ui/core/CardContent';
import CardActions  from '@material-ui/core/CardActions';

const md = new MarkdownIt({html:true});

const styles = {
  creatorMessage: {
    borderBottom: 'solid 1px transparent',
    padding: '0 20px ',
    fontSize: '90%'
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

      /* FIXME TODO Temp disable content cards */ /* make this optional */
      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
        var stateUpdate  = {};
        stateUpdate.configurations = bundle.configurations;
        stateUpdate.selectedSite = bundle.site;
        stateUpdate.basePath = `/sites/${bundle.site.key}/workspaces/${bundle.workspace.key}`;
        //stateUpdate.contentItemCardsSections = this.prepareMenuCards(bundle.workspaceDetails);

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

        if(typeof menu.matchRole === 'undefined' || menu.matchRole === 'all' || this.props.applicationRole === menu.matchRole){

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
          <Typography variant="body2" >
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
          {(type === 'collection' ? null : <Button size="small" color="primary"
            onClick={()=>{
              service.api.redirectTo(`${this.state.basePath}/singles/${encodeURIComponent(key)}`)
            }}
          >Open</Button>)}

          {(type === 'collection' ? <Button size="small" color="primary"

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
    sections = contentItemCardsSections.map((section,index)=>{

      return (

        <React.Fragment key={"section"+index}>
          {section.cards.map((card, index)=>{

            return (
              <Grid
                key={"siteCardA"+index}
                item
              >
                <Typography>
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

            <div className="markdown site-home-text" style={ styles.creatorMessage } dangerouslySetInnerHTML={{__html:this.state.siteCreatorMessage}} />

          </div>
        )
      }}/>

    );
  }

}

export default Home;
