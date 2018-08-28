import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import { auth } from "../actions";
import '../css/Login.css';

class Login extends Component {
	state = {
		email: "",
		password: "",
	}

	onSubmit = e => {
		e.preventDefault();
		this.props.login(this.state.email, this.state.password);
	}
	render(){
		if (this.props.auth.isAuthenticated){
			return <Redirect to='/UserDashboard' />
		}
		return (
			<div id='login-wrap'>
				<form id='login-form' onSubmit={this.onSubmit}>
					{this.props.errors.length > 0 && (
						<div className='feedback'>
							{this.props.errors.map(error => (
								<div className='invalid' key={error.field}>{error.message}</div>
							))}
						</div>
					)}
					<legend>Login</legend>
					{this.props.errors.length > 0 && (
						<ul>
							{this.props.errors.map(error => (
								<li key={error.field}>{error.message}</li>
							))}
						</ul>
					)}
					<div id='input-area'>
						<input
							type='text' id='email' placeholder='Email'
							onChange={e=> this.setState({email:e.target.value})}
						/>
			            <input
			              type="password" id="password" placeholder='Password'
			              onChange={e => {
			              	this.setState({password: e.target.value})
			              }} />

		         		<Link id='forgot-pass' to="/ForgotPassword">Forgot your password?</Link>
		            </div>
		            <button id='login-submit' type="submit">Login</button>
				</form>
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		auth: state.auth,
		errors: state.auth.errors
	}
}

const mapDispatchToProps = dispatch => {
	return {
		login: (email, password) => {
			return dispatch(auth.login(email, password));
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);

