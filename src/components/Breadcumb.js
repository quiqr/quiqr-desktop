import * as React from 'react';

import Typography from '@material-ui/core/Typography';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Link from '@material-ui/core/Link';

export class FormBreadcumb extends React.Component{

  render() {
    return (
    <Breadcrumbs aria-label="breadcrumb" style={{
      margin: '12px 0 0 12px'

    }}>
      {
        this.props.items.map((item,index)=>{
          if(item.node!=null){
            return <Link color="inherit" key={"link"+index} onClick={()=>this.props.onNodeSelected(item.node)} >{item.label||'Untitled'}</Link>
          }
          else{
            return <Typography color="textPrimary">{item.label||'Untitled'}</Typography>
          }
        })
      }
    </Breadcrumbs>
    )
  }

}
