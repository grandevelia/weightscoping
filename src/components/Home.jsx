import React, { Component } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { withRouter } from 'react-router'
import { connect } from 'react-redux';
import HomeLayout from './HomeLayout';

import UserDashboard from './UserDashboard';
import UserSettings from './UserSettings';
import FAQ from './FAQ';
import About from './About';
import Plans from './Plans';
import Contact from './Contact';
import TermsOfUse from './TermsOfUse';
import Privacy from './Privacy';

class Home extends Component {
	updateIntroState(update){
		this.props.updateIntroState(update);
	}
	render(){
		if (!this.props.auth.isAuthenticated){
			return <Redirect to="/Login" />
		}
		if (!this.props.auth.userConfirmed){
			return <Redirect to="/CompleteRegistration" />
		}
		return(
			<HomeLayout>
				<Route exact path="/Home/UserDashboard" component={ UserDashboard } />
				<Route exact path="/Home/UserSettings" component={ UserSettings } />
				<Route exact path="/Home/FAQ" component={ FAQ } />
				<Route exact path="/Home/About" component={ About } />
				<Route exact path="/Home/Plans" component={ Plans } />
				<Route exact path="/Home/Contact" component={ Contact } />
				<Route exact path="/Home/TermsOfUse" component={ TermsOfUse } />
				<Route exact path="/Home/Privacy" component={ Privacy } />
			</HomeLayout>
		);
	}
}
const mapStateToProps = state => {
	return {
		auth: state.auth
	}
}

const mapDispatchToProps = dispatch => {
	return {

	}
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Home));
