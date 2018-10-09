import React, { Component } from 'react';
import {Route, Switch, BrowserRouter} from 'react-router-dom';

import { Provider, connect } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import {auth, weights} from "./actions";
import weightScoping from './reducers';

import Intro from './components/Intro';
import Home from './components/Home';
import NotFound from './components/NotFound';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Login from './components/Login';
import Main from './components/Main';

let store = createStore(weightScoping, applyMiddleware(thunk))

class RootContainerComponent extends Component {
  componentDidMount(){
    this.props.loadUser();
    this.props.fetchWeights();
  }
  render(){
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/Home" render={() => 
                  <Home weights={this.props.weights} />
                } />
                <Route path="/Intro" render={ () => 
                  <Intro auth={ this.props.auth } />} 
                />
			        	<Route path='/Login' component={ Login } />
                <Route path="/ForgotPassword" component={ ForgotPassword } />
                <Route path="/ResetPassword" component={ ResetPassword } />
                <Route exact path="/" render={() => 
                  <Main />} 
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
    weights: state.weights
  }
}
const mapDispatchToProps = dispatch => {
  return {
    loadUser: () => {
      return dispatch(auth.loadUser());
    },
    fetchWeights: () =>{
      return dispatch(weights.fetchWeights());
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
