import React, { Component } from 'react';
import InteractionArea from './InteractionArea';

export default  class CarbsPage extends Component {
	moveOption(optionId, toId){
		let positions = this.props.carbRanks;

		//If this option has already been selected, remove it in order to prevent duplication
		let alreadyPlaced = positions.indexOf(optionId);
		
		if (alreadyPlaced >= 0){
			positions[alreadyPlaced] = null;
		}

		if (positions[toId] === null){
			//Target space currently empty

			positions[toId] = optionId;
		} else {
			//Target space occupied

			//Find nearest open position below target
			let spaceBelow = false;
			for (let i = toId+1; i < positions.length; i ++){
				if (positions[i] === null){
					spaceBelow = i;
					break;
				}
			}
			if (spaceBelow !== false){
				//Space below target
				//Move everything down to nearest open space
				for (let i = spaceBelow; i > toId; i --){
					positions[i] = positions[i-1];
				}

				positions[toId] = optionId;
			} else {
				//No space below target

				let spaceAbove = 0;
				//Find nearest open position above target
				for (let i = toId - 1; i > 0; i --){
					if (positions[i] === null){
						spaceAbove = i;
						break;
					}
				}
				//Move everything up to nearest open space
				for (let i = spaceAbove; i < toId; i ++){
					positions[i] = positions[i+1];
				}

				positions[toId] = optionId;
			}
		}
		this.props.updateIntroState({carbRanks: positions});
	}
	render(){
		let carbOptions;
		if (this.props.alcohol){
			carbOptions = ["Breads","Pasta/Rice","Potatoes","Dessert","Soft Drinks","Snack Carbs","Cereals","Hard Alcohol","Beer/Wine"];
		} else {
			carbOptions = ["Breads","Pasta/Rice","Potatoes","Dessert","Soft Drinks","Snack Carbs","Cereals"];
		}
		
		let positions = this.props.carbRanks;
		return (
			<div>
				<h3 className="page-intro">Rate the following in order of how much you enjoy them</h3>
				<div id='drag-and-drop-hint'>(Drag and drop from most favorite to least)</div>
				<InteractionArea options={carbOptions} positions={positions} moveOption={(optionId, toId) => this.moveOption(optionId, toId)}/>
				{
					positions.indexOf(null) < 0 ?
						<p className='intro-nav'>NEXT: Find Your Ideal Weight</p>
					: null
				}
				<p onClick={() => this.props.updateIntroState({alcohol: null})} className='intro-nav back'>Back</p>
			</div>
		)
	}
}