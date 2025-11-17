import React             from 'react';
import ReactDOM          from 'react-dom';
import { BrowserRouter } from 'react-router-dom'
import App               from './App';
import service           from './services/service';
import SnackbarManager   from './components/SnackbarManager';

service.api.readConfKey('prefs').then((value)=>{

  let appUiStyle = 'quiqr10';

  require('./app-ui-styles/' + appUiStyle + '/css/index.css');
  require('./app-ui-styles/' + appUiStyle + '/css/bootstrap-grid.css');

  /* STYLES FOR OTHER THEN MUI COMPONENTS */
  require('./app-ui-styles/components.css');
});

console.log("CONSOLE!")

ReactDOM.render(
  <BrowserRouter>
    <div>
      <SnackbarManager />
      <App />
    </div>
  </BrowserRouter>,
  document.getElementById('root')
);
