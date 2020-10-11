import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import App from './App';
import service from './services/service';

service.getConfigurations().then((c) => {
    require('./themes/' + c.global.appTheme + '/css/index.css');
    require('./themes/' + c.global.appTheme + '/css/bootstrap-grid.css');
})

const isDev = window.require('electron-is-dev');
if(isDev){
    console.log('Running in development');
}
else{
    console.log('Running in production');
}

ReactDOM.render(
  <BrowserRouter>
    <App />
   </BrowserRouter>,
  document.getElementById('root')
);
