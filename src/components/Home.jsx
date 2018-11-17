import React, { Component } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { withRouter } from 'react-router'
import { connect } from 'react-redux';

import UserDashboard from './UserDashboard';
import UserSettings from './UserSettings';
import PlansPage from './PlansPage';

class Home extends Component {
	render(){
		if (!this.props.auth.isAuthenticated){
			return <Redirect to="/Login" />
		}
		if (!this.props.auth.userConfirmed){
			return <Redirect to="/CompleteRegistration" />
		}
		return(
			<div>
				<Route exact path="/Home/UserDashboard" component={ UserDashboard } />
				<Route exact path="/Home/UserSettings" component={ UserSettings } />
                <Route exact path="/Home/Plans" component={ PlansPage } />
			</div>
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
		
	}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
