import React, { Component } from 'react';

export default class AlcoholPage extends Component {
	render(){
		return (
			<div id='alcohol-page'>
				<div id="alcohol-prompt">First: Do you drink alcohol?</div>
				<div id='button-area'>
					<div className='alcohol-button' id='alcohol-yes' onClick={() => this.props.updateIntroState({alcohol: true})}>Yes</div>
					<div className='alcohol-button' id='alcohol-no' onClick={() => this.props.updateIntroState({alcohol: false})}>No</div>
				</div>
			</div>
		)
	}
}