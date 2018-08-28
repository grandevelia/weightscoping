import React, { Component } from 'react';
import { weightStringFromKg } from './utils';

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
				<div className='stage-title'>You are level {level} <br />Next Target Weight: {weightStringFromKg(this.props.initialWeightKg-(level+2)*(this.props.initialWeightKg - this.props.idealWeightKg)/6, this.props.weightUnits)}</div>
				<div className='stage-description'><h5>You may have</h5> {
					intArr.map( i => {
						let current = levelMap[i];
						return current.map(j => {
							return <div className='you-may-have' key={"inner"+j}>{carbOptions[ carbRanks[j] ]}</div>;
						})
					})
				}
				</div>
			</div>
		);
	}
}

	