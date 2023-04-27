import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import App from './App';
import service from './services/service';

service.api.readConfKey('prefs').then((value)=>{
  let appUiStyle = 'quiqr10';
  if(value.interfaceStyle){
    appUiStyle = value.interfaceStyle
  }

  require('./app-ui-styles/' + appUiStyle + '/css/index.css');
  require('./app-ui-styles/' + appUiStyle + '/css/bootstrap-grid.css');
});

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);
