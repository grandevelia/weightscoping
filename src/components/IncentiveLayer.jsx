import React, { Component } from 'react';
import { weightStringFromKg, allowedCarbs, disallowedCarbs } from './utils';

let carbOptions = ["All non-incentive food","Breads","Pasta/Rice","Potatoes","Dessert","Soft Drinks","Snack Carbs","Cereals","Hard Alcohol","Beer/Wine"];
let optionsLen = carbOptions.length;

export default class IncentiveLayer extends Component {

	checkAlcoholChange(){
		if (this.props.alcohol === "false" && carbOptions.length === optionsLen){
			carbOptions.splice(optionsLen - 2, 2);
		} else if (this.props.alcohol === "true" && carbOptions.length !== optionsLen){
			carbOptions.push.apply(carbOptions, ["Hard Alcohol", "Beer/Wine"]);
		}
	}
	render(){
		let carbRanks = this.props.carbRanks;
		carbRanks = carbRanks.map(i => i+1);
		carbRanks.unshift(0);
		let level = this.props.level;
		return(
			<div id='level-area'>
				<div className='level-area-section'>
					<div className='level-area-header'>You are at level</div>

					<div className='level-area-content'>
						{level}
					</div>
					<div className='level-area-header'>Next target weight: </div>
					<div className='level-area-content'>
						{level < 7 ? 
						weightStringFromKg(this.props.initialWeightKg-(level+2)*(this.props.initialWeightKg - this.props.idealWeightKg)/8, this.props.weightUnits)
						: "Maintain weight under " + weightStringFromKg(this.props.idealWeightKg, this.props.weightUnits)}
					</div>
				</div>
				<div className='level-area-section'>
					<div className='level-area-header'>You may have</div>
					<div className='level-area-content'>
						{ level < 7 ? allowedCarbs(level, carbRanks) :
						"Whatever you want"	
						}
					</div>
				</div>
				<div className='level-area-section'>
					<div className='level-area-header'>You may not have</div>
					<div className='level-area-content'>
						{ disallowedCarbs(level, carbRanks) }
					</div>
				</div>
			</div>
		);
	}
}

	