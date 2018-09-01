import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import '../css/PaymentPrompt.css';

export default class PaymentPrompt extends Component {
	render(){
		/*
		if (this.props.alcohol === null){
			return <Redirect to="/" />
		} else if (this.props.carbRanks.indexOf(null) >= 0){
			return <Redirect to="/SecondPage" />
		} else if (this.props.heightInches === null){
			return <Redirect to="/ThirdPage" />
		}*/
		let idealWeightValue = this.props.idealWeightValue;
		if (!idealWeightValue){
			idealWeightValue = 0;
		}
		return(
			<div id='payment-prompt-page'>
				<div id='payment-stem'>
					<p>
						One way of helping you understand how much it means to you to get closer to  your ideal weight is to measure the importance in some tangible way. Please answer the following question using the slider.
					</p>
					<p id='payment-prompt-title'>
						How glad would you be to weigh your ideal weight?
					</p>
					<div id='slider-area'>
						<div className='slider-box'>
							<div className='slider-section-header'>
								I wouldn't care at all
							</div>

							<div className='slider-section-header slider-container'>
								<input id='ideal-weight-slider' type='range' min='0' max='113' onChange={(e) => this.props.updateIntroState({idealWeightValue:e.target.value})} value={idealWeightValue} />
							</div>
							<div className='slider-section-header'>
								I'd be ecstatic
							</div>
						</div>
						<div className='slider-box'>
							<div className='slider-section-body'>
								$0
							</div>
							<div className='slider-section-body slider-container'>
								${idealWeightValue}
							</div>
							<div className='slider-section-body'>
								$113
							</div>
						</div>
					</div>

					<p id='payment-prompt-info'>
						This isn't a commitment to pay anything. It is a way of helping you understand how much you value achieving your ideal weight. Later, if you are really happy with our approach, you can thank us -- with this amount, some other amount, or by just saying “Thanks!”. You don’t have to pay to use the Reductiscope if you don’t want to.
					</p>
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