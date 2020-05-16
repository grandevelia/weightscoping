import React, { Component } from 'react';
import { Route, Switch, BrowserRouter } from 'react-router-dom';

import { Provider, connect } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import { auth, weights } from "./actions";
import weightScoping from './reducers';

import Layout from './components/Layout';
import NotFound from './components/NotFound';
import ResetPassword from './components/ResetPassword';
import Main from './components/Main';
/*
import Intro from './components/Intro';
import Home from './components/Home';

import RegistrationConfirmation from './components/RegistrationConfirmation';
import CompleteRegistration from './components/CompleteRegistration';

import Login from './components/Login';
import ForgotPassword from './components/ForgotPassword';
import Contact from './components/Contact';
import TermsOfUse from './components/TermsOfUse';
import Privacy from './components/Privacy';
import FAQ from './components/FAQ';
import About from './components/About';
*/
let store = createStore(weightScoping, applyMiddleware(thunk))

class RootContainerComponent extends Component {
  componentDidMount() {
    this.props.loadUser();
    this.props.fetchWeights();
  }
  render() {
    return (
      <BrowserRouter>
        <Layout>
          <Switch>
            <Route path="/ResetPassword" component={ResetPassword} />
            {/*
              <Route path="/Home" render={() => <Home weights={this.props.weights} />} />

              <Route path="/Intro" render={ () => <Intro auth={ this.props.auth } />} />

              <Route path='/Login' component={ Login } />
              <Route path="/ForgotPassword" component={ ForgotPassword } />

              <Route path="/RegistrationConfirmation" component={ RegistrationConfirmation } />
              <Route path="/CompleteRegistration" component={ CompleteRegistration } />

              <Route exact path="/FAQ" component={ FAQ } />
              <Route exact path="/About" component={ About } />
              <Route exact path="/Contact" component={ Contact } />
              <Route exact path="/TermsOfUse" component={ TermsOfUse } />
              <Route exact path="/Privacy" component={ Privacy } />
            */}
            <Route exact path="/" component={Main} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
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
    fetchWeights: () => {
      return dispatch(weights.fetchWeights());
    }
  }
}
let RootContainer = connect(mapStateToProps, mapDispatchToProps)(RootContainerComponent);

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <RootContainer {...this.props.auth} />
      </Provider>
    )
  }
}