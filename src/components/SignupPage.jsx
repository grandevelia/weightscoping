import React, { Component } from 'react';

import { auth } from "../actions";
import { connect } from 'react-redux';
import '../css/Intro.css';

class SignupPage extends Component {
	state = {
		email: "",
		password: "",
		passwordConfirm: "",
	}
	onSubmit = e => {
		e.preventDefault();
		if (this.state.password.length){
			if (this.state.password === this.state.passwordConfirm){
				this.props.register(this.state.email, this.state.password, this.props.alcohol, this.props.carbRanks, this.props.weightUnits, this.props.heightUnits, this.props.height, this.props.initialWeight, this.props.idealWeightKg, this.props.initialValue, this.props.sex);
			} else {
				alert("Password fields don't match");
			}
		} else {
			alert("Password is required");
		}
	}
	render(){
		return(
			<div id='fifth-page'>
				{this.props.confirmationSent !== true ?
					<div id='signup-area'>
						<h2>It's Time To Get Thin.</h2>
						<form id='signup-form' onSubmit={this.onSubmit}>
							{
								this.props.errors && this.props.errors.length > 0 ? 
									<div className='feedback'>
										{this.props.errors.map(error => (
											<div className='invalid' key={error.field}>{error.message}</div>
										))}
									</div> : null
							}
							<input
								type='text' id='email' placeholder='Your Email'
								onChange={e => this.setState({email:e.target.value})}
							/>
							<input
							type="password" id="password" placeholder='Password'
							onChange={e => {
								this.setState({password: e.target.value})
							}} />
							<input
							type="password" id="confirm-password" placeholder='Confirm Password'
							onChange={e => {
								this.setState({passwordConfirm: e.target.value})
							}} />
							<button className='form-submit' type="submit">Submit</button>
						</form>
					</div> 
				:
					<div id='confirmation-area'>
						<div id='account-confirmation'>
							<div id='registration-title'>Account Created!</div>
							<div id='check-area'>
								<div id='check-outer-wrap'>
									<div id="halfclip">
										<div className='halfcircle' id='clipped'></div>
									</div>
									<div className="halfcircle" id="fixed"></div>
									
									<i className='fa fa-check'></i>
								</div>
							</div>
							<div id='confirmation-info'>A confirmation email has been sent to {this.props.email}. You'll need to follow the link in it to complete your registration</div>
						</div>
					</div>
				}
				<div to='/Intro/FourthPage' className='intro-nav back'>Back</div>
			</div>
		)
	}
}
const mapStateToProps = state => {
	let errors = [];
	if (state.auth.errors) {
		if (state.auth.errors.detail !== 'Authentication credentials were not provided.' && state.auth.errors.detail !== "Invalid token."
	){
			errors = Object.keys(state.auth.errors).map(field => {
				return {field, message: state.auth.errors[field]};
			});
		}
	}
	return {
		errors,
		isAuthenticated: state.auth.isAuthenticated,
		confirmationSent: state.auth.confirmationSent,
		intro: state.intro,
		email: state.auth.email
	};
}

const mapDispatchToProps = dispatch => {
	return {
		register: (email, password, alcohol, carbRanks, weightUnits, heightUnits, heightInches, weightKg, idealWeightKg, idealWeightValue, sex) => {
			return dispatch(auth.register(email, password, alcohol, carbRanks, weightUnits, heightUnits, heightInches, weightKg, idealWeightKg, idealWeightValue, sex));
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(SignupPage)