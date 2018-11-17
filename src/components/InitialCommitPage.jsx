import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';
import { auth } from "../actions";

import SignupOption from './SignupOption';

class InitialCommitPage extends Component {
	state = {
		planSelected: false
	}
	togglePlan(val){
		if (val !== false){
			this.setState({planSelected: true}, () => {
				this.props.updateUserSettings({paymentOption:val})
			})
		} else {
			this.setState({planSelected: false});
		}
	}
	render(){
		if (!this.props.auth.user){
			return <Redirect to="/Intro" />
		}
		return(
			<div id='sixth-page'>
				<div id='payment-area'>
					{this.state.planSelected === false ?
						<div>
							<h2>Select your plan</h2>
							<div id='payment-explanation'>Studies show that monetary investment greatly increases your chances of reaching your goal. That being said, you can use this service completely for free (but we think you’re going to be happy to pay us)</div>
					
							<div id='option-area'>
								<div className='payment-option'>
									<div className='option-header'>Classic</div>
									<div className='option-text'>Pay something now, and something when you achieve your ideal weight.</div>
									<div onClick={() => this.togglePlan(1)} className='option-select'>Select</div>
								</div>
								<div className='payment-option'>
									<div className='option-header'>Slow Burn</div>
									<div className='option-text'>Pay something now, and a little at each incentive target.</div>
									<div onClick={() => this.togglePlan(2)} className='option-select'>Select</div>
								</div>
								<div className='payment-option'>
									<div className='option-header'>I Need More Proof</div>
									<div className='option-text'>Pay only at the end <br></br>(Or not at all).</div>
									<div onClick={() => this.togglePlan(3)} className='option-select'>Select</div>
								</div>
							</div>
						</div> :
						<div>
							<SignupOption {...this.props}/>
							<div className='intro-nav back' onClick={() => this.togglePlan(false)}>Change Plan</div> 
						</div>
					}
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
		updateUserSettings: (key, val) => {
			return dispatch(auth.updateUserSettings(key, val));
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(InitialCommitPage);