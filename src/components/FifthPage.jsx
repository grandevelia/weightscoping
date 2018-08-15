import React, { Component } from 'react';

import { Link, Redirect } from 'react-router-dom';
import { auth } from "../actions";
import { connect } from 'react-redux';
import '../css/FifthPage.css';

class FifthPage extends Component {
	state = {
		email: "",
		password: "",
	}
	onSubmit = e => {
		e.preventDefault();
		this.props.register(this.state.email, this.state.password, this.props.intro.alcohol, this.props.intro.carbRanks, this.props.intro.weightUnits, this.props.intro.heightUnits, this.props.intro.heightInches, this.props.intro.weightKg, this.props.intro.idealWeightKg, this.props.intro.idealWeightValue, this.props.intro.sex);
	}
	render(){
		/*if (this.props.alcohol === null){
			return <Redirect to="/" />
		} else if (this.props.carbRanks.indexOf(null) >= 0){
			return <Redirect to="/SecondPage" />
		} else if (this.props.heightInches === null){
			return <Redirect to="/ThirdPage" />
		} else if (this.props.weightKg === null){
			return <Redirect to="/FourthPage/" />;
		}*/
		return(
			<div id='fifth-page'>
				<div>
				{this.props.confirmationSent !== true ?
					<div id='signup-area'>
						<h2>It's Time To Get Thin.</h2>
						<form className='box-form' onSubmit={this.onSubmit}>
							{
								this.props.errors && this.props.errors.length > 0 ? 
									<div className='feedback'>
										{this.props.errors.map(error => (
											<div className='invalid' key={error.field}>{error.field + ": " + error.message}</div>
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
							<button className='form-submit' type="submit">Submit</button>
						</form>
					</div> :
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
							<Link to='/SixthPage' className='intro-nav'>NEXT: Select your plan</Link>
						</div>
					</div>
				}
				</div>
				<Link to='/FourthPage' className='intro-nav back'>Back</Link>
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

export default connect(mapStateToProps, mapDispatchToProps)(FifthPage)