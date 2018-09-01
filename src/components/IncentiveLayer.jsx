import React, { Component } from 'react';
import { weightStringFromKg, allowedCarbs, disallowedCarbs } from './utils';

let carbOptions = ["All non-incentive food","Breads","Pasta/Rice","Potatoes","Dessert","Soft Drinks","Snack Carbs","Cereals","Hard Alcohol","Beer/Wine"];
let optionsLen = carbOptions.length;
let wetLevelMap = [[0],[6],[1],[4],[2],[7],[5,8,4,3]];
let dryLevelMap = [[0],[5],[1],[3],[2],[6],[4]];

export default class IncentiveLayer extends Component {

	checkAlcoholChange(){
		if (this.props.alcohol === "false" && carbOptions.length === optionsLen){
			carbOptions.splice(optionsLen-2,2);
		} else if (this.props.alcohol === "true" && carbOptions.length !== optionsLen){
			carbOptions.push.apply(carbOptions, ["Hard Alcohol", "Beer/Wine"]);
		}
	}
	render(){
		let carbRanks = this.props.carbRanks;
		carbRanks = carbRanks.map(i => i+1);
		carbRanks.unshift(0);

		let kgPerLevel = (this.props.initialWeightKg - this.props.idealWeightKg)/6;
		let level = Math.floor((this.props.initialWeightKg-this.props.currentWeightKg)/kgPerLevel);
		
		if (level >= 1){
			level = level - 1;
		} else if (level < 0){
			level = 0;
		}

		let intArr = Array(level+1).fill().map( (x, i) => i);
		let levelMap;
		if (!this.props.alcohol){
			levelMap = dryLevelMap;
		} else {
			levelMap = wetLevelMap;
		}
		return(
			<div className='stage dashboard-stage'>
				<div className='stage-title'>You are at Level {level} <br />Next Target Weight: {weightStringFromKg(this.props.initialWeightKg-(level+2)*(this.props.initialWeightKg - this.props.idealWeightKg)/6, this.props.weightUnits)}</div>
				<div className='stage-description'>
					<div className='section'>
						<div className='section-header'>You may have</div>
						<div className='section-description'>
							{ allowedCarbs(4, carbRanks) }
						</div>
					</div>
					<div className='section'>
						<div className='section-header'>You may not have</div>
						<div className='section-description'>
							{ disallowedCarbs(4, carbRanks) }
						</div>
					</div>
				</div>
			</div>
		);
	}
}

	