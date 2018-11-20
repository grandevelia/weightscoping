import React, { Component } from 'react';

export default class IntroPlansPage extends Component {
	state = {
		plan: null
	}
	togglePlan(val){
		this.setState({plan: val});
	}
	render(){
		return(
			<div id='plan-page'>
				<h2>Select your plan</h2>
				<div id='payment-explanation'>Studies show that monetary investment greatly increases your chances of reaching your goal. That being said, you can use this service completely for free (but we think you’re going to be happy to pay us)</div>
		
				<div id='option-area'>
					<div className={this.state.plan === 1 ? 'payment-option selected' : 'payment-option'}>
						<div className='option-header'>Classic</div>
						<div className='option-text'>Pay something now, and something when you achieve your ideal weight.</div>
						<div onClick={() => this.togglePlan(1)} className='option-select'>Select</div>
					</div>
					<div className={this.state.plan === 2 ? 'payment-option selected' : 'payment-option'}>
						<div className='option-header'>Slow Burn</div>
						<div className='option-text'>Pay something now, and a little at each incentive target.</div>
						<div onClick={() => this.togglePlan(2)} className='option-select'>Select</div>
					</div>
					<div className={this.state.plan === 3 ? 'payment-option selected' : 'payment-option'}>
						<div className='option-header'>I Need More Proof</div>
						<div className='option-text'>Pay only at the end <br></br>(Or not at all).</div>
						<div onClick={() => this.togglePlan(3)} className='option-select'>Select</div>
					</div>
				</div>
				{
					this.state.plan !== null ?
						<div onClick={() => this.props.updateIntroState({plan: this.state.plan})} className='intro-nav'>NEXT: Sign Up!</div>
					: null
				}
				<div onClick={() => this.props.updateIntroState({initialValue: null})} className='intro-nav back'>Back</div>
			</div>
		)
	}
}