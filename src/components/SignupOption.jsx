import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import '../css/SignupOption.css';
import { idealWeightString } from './utils';

export default class SignupOption extends Component {
	render(){
		let paymentOption = this.props.paymentOption;
		let currency = "$";
		let optionHeader;
		let optionText;
		let paymentModifier;

		if (paymentOption === 1){
			optionHeader = "Classic";
			optionText = "Some now, some later";
			paymentModifier = 0.25;
		} else if (paymentOption === 2){
			optionHeader = "Slow Burn";
			optionText = "Some now, some at each target";
			paymentModifier = 0.1;
		} else {
			optionHeader = "I Need More Proof";
			optionText = "Nothing until you reach your goal";
			paymentModifier = 0.0;
		}
		let paymentAmount = paymentModifier * parseInt(this.props.idealWeightValue, 10);
		if (isNaN(paymentAmount)){
			paymentAmount = 0;
		}
		return (
			<div id='option-page'>
				<div id='payment-stem'>
					Living at {idealWeightString(this.props.weightUnits, this.props.heightUnits, this.props.sex, 0, this.props.heightInches)} is worth {currency}<input onChange={(e) => this.props.updateIntroState({idealWeightValue:e.target.value})} type='number' value={this.props.idealWeightValue} /> to you.
				</div>
				<div id='payment-system-info'>
					<h4>You can change your plan, and payment amount, at any time.</h4>
					If you decide being thin is worth less to you, then pay less. If your life really starts to improve, then commit to more. Since your payment is a direct reflection of how much it matters to you, the more you pay, the more likely you are to succeed. 
					<h5>After all, it's your body.</h5>
				</div>
				<div id='payment-info-area'>
					<div className='payment-option'>
						<div className='option-header'>{optionHeader}</div>
						<div className='option-text'>{optionText}</div>
						<div className='payment-amount'>Down payment: {currency+""+parseFloat(Math.round(paymentAmount*100)/100, 10).toFixed(2)}</div>
						<Link id='no-payment' to='/Login' >Login</Link>
					</div>
				</div>
			</div>
		)
	}
}