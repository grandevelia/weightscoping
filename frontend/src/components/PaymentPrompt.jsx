import React, { Component } from 'react';
import { idealWeightString } from './utils';
import { Link, Redirect } from 'react-router-dom';
import '../css/PaymentPrompt.css';

export default class PaymentPrompt extends Component {
	render(){
		if (this.props.alcohol === null){
			return <Redirect to="/" />
		} else if (this.props.carbRanks.indexOf(null) >= 0){
			return <Redirect to="/SecondPage" />
		} else if (this.props.heightInches === null){
			return <Redirect to="/ThirdPage" />
		}
		return(
			<div id='payment-prompt-page'>
				<div id='payment-stem'>
					<p id='payment-prompt-title'>How much would you pay to wake up tomorrow weighing {idealWeightString(this.props.weightUnits, this.props.heightUnits, this.props.sex, 0, this.props.heightInches)}? </p>
					$<input onChange={(e) => this.props.updateIntroState({idealWeightValue:e.target.value})} type='number' value={this.props.idealWeightValue} />

					<p id='payment-prompt-info'>This isn't a commitment. Putting a real value on your goal is one of the best ways to help you achieve it.</p>
					{this.props.idealWeightValue !== "" ?
						<Link to='/FourthPage' className='intro-nav'>Continue</Link>
						:null
					}
					<Link to='/ThirdPage' className='intro-nav back'>Back</Link>
				</div>
			</div>
		)
	}
}