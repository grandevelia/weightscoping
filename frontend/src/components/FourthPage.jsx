import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import '../css/FourthPage.css';

import { poundsToKg, idealWeightString, weightStringFromKg } from './utils';

let carbOptions = ["Breads","Pasta/Rice","Potatoes","Dessert","Soft Drinks","Snack Carbs","Cereals","Hard Alcohol","Beer/Wine"];
export default class FourthPage extends Component {
	state={
		primary: "",
		secondary: ""
	}
	enterInitialWeight(e, unit){
		if (unit === "PRIMARY"){
			this.setState({
				primary: e.target.value
			}, function(){
				this.props.updateIntroState({weightKg: this.convertWeight()});
			});
		} else if (unit === "SECONDARY"){
			this.setState({
				secondary: e.target.value
			}, function(){
				this.props.updateIntroState({weightKg: this.convertWeight()});
			});
		}
	}
	convertWeight(){
		if (this.props.weightUnits === "Stones"){
			return poundsToKg(parseInt(this.state.primary,10) * 14 + parseInt(this.state.secondary,10));
		} else if (this.props.weightUnits === "Pounds"){
			return poundsToKg(parseInt(this.state.primary,10));
		}
		return this.state.primary;
	}
	render(){
		if (this.props.alcohol === null){
			return <Redirect to="/" />
		} else if (this.props.carbRanks.indexOf(null) >= 0){
			return <Redirect to="/SecondPage" />
		} else if (this.props.heightInches === null){
			return <Redirect to="/ThirdPage" />
		}
		let toLoseKg = this.props.weightKg - this.props.idealWeightKg;
		let incrementKg = toLoseKg/7;
		let carbRanks = [0,7,1,6,2,5,3,4];//this.props.carbRanks;
		return (
			<div id='fourth-wrap'>
				<p className='page-title'>
					Now, enter your current weight. It doesn’t have to be exact at this point. This is just to show you how the system works. Later, you’ll enter your weight using a proper scale.
				</p>
				<p id='initial-weight'>
		            <span id='initial-weight-title'>Current Weight:</span>
		            {
		            	this.props.weightUnits === "Stones" ?
				            <span id='initial-weight-buttons' className='two-buttons'>
					            <input type='number' onChange={(e) => this.enterInitialWeight(e, "PRIMARY")} placeholder='Stones'/>
					            <input type='number' onChange={(e) => this.enterInitialWeight(e, "SECONDARY")} placeholder='Pounds'/>
				            </span> :
			        	this.props.weightUnits === "Kilograms" ?
			            	<span id='initial-weight-buttons'>
				         	   <input type='number' id='metric' onChange={(e) => this.enterInitialWeight(e, "PRIMARY")} placeholder='Kilograms'/>
			           		</span> :
			        	this.props.weightUnits === "Pounds" ?
				        	<span id='initial-weight-buttons'>
					            <input type='number' id='pounds' onChange={(e) => this.enterInitialWeight(e, "PRIMARY")} placeholder='Pounds'/>
				            </span> : null
			        }	
		        </p>
		        <div>
		        {(this.state.primary !== "" && this.props.weightUnits !== "Stones") || (this.state.primary !== "" && this.state.secondary !== "" && this.props.weightUnits === "Stones") ?
			        <div>
			        	<div id='layers'>{"Your ideal weight is " + idealWeightString(this.props.weightUnits, this.props.heightUnits, this.props.sex, 0, this.props.heightInches)}</div>
			        	<h2>You have to lose {weightStringFromKg(this.props.weightKg - this.props.idealWeightKg, this.props.weightUnits)} to reach your ideal weight. Here's how we'll get you there:</h2>
			        	<div id='incentive-layers'>
			        		<div id='incentive-layers'>
								<div className='stage'>
									<div className='stage-title'>Stage 1: Target Weight: {weightStringFromKg(this.props.weightKg-2*incrementKg, this.props.weightUnits)}</div>
									<div className='stage-description'>You may have: Anything other than any incentive food. Eat as much as you want, but if you do you’ll never eat any incentive foods again.</div>
								</div>
								<div className='stage'>
									<div className='stage-title'>Stage 2: Target Weight: {weightStringFromKg(this.props.weightKg-3*incrementKg, this.props.weightUnits)}</div>
									<div className='stage-description'>You may have: {
										carbOptions[carbRanks[5]]
									}</div>
								</div>
								<div className='stage'>
									<div className='stage-title'>Stage 3: Target Weight: {weightStringFromKg(this.props.weightKg-4*incrementKg, this.props.weightUnits)}</div>
									<div className='stage-description'>You may have: {
										carbOptions[carbRanks[0]] + " and " + carbOptions[carbRanks[5]]
									}</div>
								</div>
								<div className='stage'>
									<div className='stage-title'>Stage 4: Target Weight: {weightStringFromKg(this.props.weightKg-5*incrementKg, this.props.weightUnits)}</div>
									<div className='stage-description'>You may have: {
										carbOptions[carbRanks[4]] + ", "+ carbOptions[carbRanks[0]] + ", and "+ carbOptions[carbRanks[5]]
									}</div>
								</div>
								<div className='stage'>
									<div className='stage-title'>Stage 5: Target Weight: {weightStringFromKg(this.props.weightKg-6*incrementKg, this.props.weightUnits)}</div>
									<div className='stage-description'>You may have: {
										carbOptions[carbRanks[1]] + ", "+ carbOptions[carbRanks[4]] + ", "+ carbOptions[carbRanks[0]] + ", and "+ carbOptions[carbRanks[5]]
									}</div>
								</div>
								<div className='stage'>
									<div className='stage-title'>Stage 6: Target Weight: {weightStringFromKg(this.props.weightKg-7*incrementKg, this.props.weightUnits)}</div>
									<div className='stage-description'>You may have: {
										carbOptions[carbRanks[6]] + ", "+ carbOptions[carbRanks[1]] + ", "+ carbOptions[carbRanks[4]] + ", "+ carbOptions[carbRanks[0]] + ", and "+ carbOptions[carbRanks[5]]
									}</div>
								</div>
								<div className='stage'>
									<div className='stage-title'>Stage 7: Target Weight Achieved. Incentives Change.</div>
									<div className='stage-description'>You may have: {
										carbOptions[carbRanks[4]] + ", " + carbOptions[carbRanks[7]] + ", " + carbOptions[carbRanks[7]] + ", " + carbOptions[carbRanks[2]] + ", " + carbOptions[carbRanks[6]] + ", "+ carbOptions[carbRanks[1]] + ", "+ carbOptions[carbRanks[4]] + ", "+ carbOptions[carbRanks[0]] + ", and "+ carbOptions[carbRanks[5]]
									}</div>
								</div>
							</div>
			        	</div>
				        <Link to='/FifthPage' className='intro-nav'>NEXT: Commit!</Link>
					</div> : null
				}
				</div>
				<Link to='/ThirdPage' className='intro-nav back'>Back</Link>
			</div>
		)
	}
}