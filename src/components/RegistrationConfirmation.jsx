import React, { Component } from 'react';
import { connect } from 'react-redux';
import { auth } from "../actions";
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import '../css/RegistrationConfirmation.css';

class RegistrationConfirmation extends Component {
	componentDidMount(){
		let params = queryString.parse(this.props.location.search);
		this.props.confirmRegistration(params.email, params.key);
	}
	render(){
		return (
			<div id='confirmation-wrap'>
			{this.props.auth.userConfirmed? 
				<div id='registration-confirmed'>
					<div id='confirmation-title'>You're all set!</div>
					<Link to='/Home/UserDashboard' className='intro-nav'>Go To Your Dashboard</Link>
				</div>
				: this.props.auth.errors && this.props.auth.errors.length > 0 ? 
					<div className='feedback'>
						{this.props.auth.errors.map((error, i) => (
							<div className='invalid' key={i}>{error}</div>
						))}
					</div> : <div id='failed-confirmation'>We don't have a key corresponding to the email you provided. Please make sure you copied the link sent to your inbox exactly.</div>
						
			}
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		intro: state.intro,
		auth: state.auth,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		confirmRegistration: (email, key) => {
			return dispatch(auth.confirmRegistration(email, key))
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(RegistrationConfirmation);