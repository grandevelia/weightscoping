import React, { Component } from 'react';
import Navbar from './Navbar';
import { logo } from '../css/images/logo.svg'
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
			return <Redirect to='/Home/UserDashboard/' />
		}
		let showErrors = false;
		if (this.props.errors['non_field_errors'] || this.props.errors['email'] || this.props.errors['password']){
			console.log(this.props.errors['non_field_errors'], this.props.errors['email'], this.props.errors['password'])
			showErrors = true;
		}
		return (
			<div className='content'>
				<style>
					@import url('https://fonts.googleapis.com/css?family=Raleway');
				</style>
				<div className="top-wrap">
					<Navbar></Navbar>
					<header className="app-header">
			          <img src={logo} className="app-logo" alt="logo" />
			          <h1 className="app-title">Your Love of Food Can Make You Thin</h1>
			        </header>
			    </div>
				<div id='main-area'>
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
								{
									showErrors ? 
										<div id='login-invalid'>Invalid Username or Password</div>
									:
										null
								}
								<Link id='forgot-pass' to="/ForgotPassword">Forgot your password?</Link>
							</div>
							<button id='login-submit' type="submit">Login</button>
						</form>
					</div>
				</div>
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

