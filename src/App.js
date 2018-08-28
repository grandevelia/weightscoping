import React, { Component } from 'react';
import {Route, Switch, BrowserRouter} from 'react-router-dom';

import { Provider, connect } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import {auth} from "./actions";
import weightScoping from './reducers';

import Intro from './components/Intro';
import NotFound from './components/NotFound';
import UserDashboard from './components/UserDashboard';
import UserSettings from './components/UserSettings';

let store = createStore(weightScoping, applyMiddleware(thunk))

class RootContainerComponent extends Component {
  componentDidMount(){
    this.props.loadUser();
  }
  render(){
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/UserDashboard" component={ UserDashboard } />
                <Route path="/UserSettings" component={ UserSettings } />
                <Route path="/" render={ () => 
                  <Intro auth={ this.props.auth } />} 
                />
                <Route component={ NotFound } />
            </Switch>
        </BrowserRouter>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.auth,
  }
}
const mapDispatchToProps = dispatch => {
  return {
    loadUser: () => {
      return dispatch(auth.loadUser());
    }
  }
}
let RootContainer = connect(mapStateToProps, mapDispatchToProps)(RootContainerComponent);

export default class App extends Component {
  render(){
    return (
      <Provider store={store}>
        <RootContainer {...this.props.auth} />
      </Provider>
    )
  }
}
