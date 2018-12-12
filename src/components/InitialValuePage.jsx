import React, { Component } from 'react';
import '../css/PaymentPrompt.css';

export default class InitialValuePage extends Component {
	state={
		initialValue: 20
	}
	updateInitialValue(n){
		this.setState({initialValue: n});
	}
	render(){
		let idealWeightValue = this.state.initialValue;
		if (!idealWeightValue){
			idealWeightValue = 0;
		}
		return(
			<div id='payment-prompt-page'>
				<div id='payment-stem'>
					<p>One way of helping you understand how much it means to you to get closer to  your ideal weight is to measure the importance in some tangible way. Please answer the following question using the slider.</p>
					<p id='payment-prompt-title'>How glad would you be to weigh your ideal weight?</p>
					<div id='slider-area'>
						<div className='slider-box'>
							<div className='slider-section-header'>I wouldn't care at all</div>
							<div className='slider-section-header slider-container'>
								<input id='ideal-weight-slider' type='range' min='0' max='113' onChange={(e) => this.updateInitialValue(e.target.value)} value={idealWeightValue} />
							</div>
							<div className='slider-section-header'>I'd be ecstatic</div>
						</div>
						<div className='slider-box'>
							<div className='slider-section-body'>$0</div>
							<div className='slider-section-body slider-container'>${idealWeightValue}</div>
							<div className='slider-section-body'>$113</div>
						</div>
					</div>
					<p id='payment-prompt-info'>This isn't a commitment to pay anything. It is a way of helping you understand how much you value achieving your ideal weight. Later, if you are really happy with our approach, you can thank us -- with this amount, some other amount, or by just saying “Thanks!”. During the 6 month free trial period, you don’t have to pay to use the Reductiscope if you don’t want to.</p>
					<div onClick={() => this.props.updateIntroState({initialValue: this.state.initialValue})} className='intro-nav'>NEXT: Pick your plan</div>
					<div onClick={() => this.props.updateIntroState({initialWeight: null})} className='intro-nav back'>Back</div>
				</div>
			</div>
		)
	}
}