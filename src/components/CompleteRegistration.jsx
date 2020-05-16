import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import '../css/RegistrationConfirmation.css';

class CompleteRegistration extends Component {
	render() {
		if (this.props.auth.isAuthenticated) {
			return <Redirect to="/UserDashboard" />
		}
		return (
			<div id='incomplete-wrap'>
				<div id='registration-incomplete'>
					<div id='incomplete-title'>Please follow the link sent to your email in order to access your dashboard</div>
				</div>
			</div>
		)
	}
}


const mapStateToProps = state => {
	return {
		auth: state.auth,
	}
}

const mapDispatchToProps = dispatch => {
	return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(CompleteRegistration);