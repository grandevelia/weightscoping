import React, { Component } from 'react';

export default class AlcoholPage extends Component {
	state = {
		alcohol : null
	}
	setAlcohol(val){
		this.setState({alcohol:val});
	}
	render(){
		return (
			<div id='alcohol-page'>
				<div id="alcohol-prompt">First: Do you drink alcohol?</div>
				<div id='button-area'>
					<div className='alcohol-button' id='alcohol-yes' onClick={() => this.setAlcohol(true)}>Yes</div>
					<div className='alcohol-button' id='alcohol-no' onClick={() => this.setAlcohol(false)}>No</div>
				</div>
				{
					this.state.alcohol !== null ? 
						<div onClick={() => this.props.updateIntroState({alcohol: this.state.alcohol})} className='intro-nav'>NEXT: Choose your favorite foods</div>
					: null
				}
			</div>
		)
	}
}