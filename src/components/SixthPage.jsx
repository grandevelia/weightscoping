import React, { Component } from 'react';

import SignupOption from './SignupOption';
import '../css/FifthPage.css';

export default class SixthPage extends Component {
	render(){
		return(
			<div id='fifth-page'>
				<div id='payment-area'>
					{this.props.paymentOption === null ?
						<div>
							<h2>Select your plan</h2>
							<div id='payment-explanation'>Studies show that monetary investment greatly increases your chances of reaching your goal. That being said, you can use this service completely for free (but we think you’re going to be happy to pay us)</div>
					
							<div id='option-area'>
								<div className='payment-option'>
									<div className='option-header'>Classic</div>
									<div className='option-text'>Pay something now, and something when you achieve your ideal weight.</div>
									<div onClick={() => this.props.updateIntroState({paymentOption:1})} className='option-select'>Select</div>
								</div>
								<div className='payment-option'>
									<div className='option-header'>Slow Burn</div>
									<div className='option-text'>Pay something now, and a little at each incentive target.</div>
									<div onClick={() => this.props.updateIntroState({paymentOption:2})} className='option-select'>Select</div>
								</div>
								<div className='payment-option'>
									<div className='option-header'>I Need More Proof</div>
									<div className='option-text'>Pay only at the end <br></br>(Or not at all).</div>
									<div onClick={() => this.props.updateIntroState({paymentOption:3})} className='option-select'>Select</div>
								</div>
							</div>
						</div> :
						<div>
							<SignupOption {...this.props}/>
							<div className='intro-nav back' onClick={() => this.props.updateIntroState({paymentOption:null})}>Change Plan</div> 
						</div>
					}
				</div>
				
			</div>
		)
	}
}
