import React, { Component } from 'react';

import InfoLink from './InfoLink';
import { weightStringFromKg, allowedCarbs, disallowedCarbs, convertWeight } from './utils';
export default class InitialWeightPage extends Component {
	state={
		primary: "",
		secondary: ""
	}
	enterInitialWeight(e, unit){
		if (unit === "PRIMARY"){
			this.setState({
				primary: e.target.value
			});
		} else if (unit === "SECONDARY"){
			this.setState({
				secondary: e.target.value
			});
		}
	}
	render(){
		let currentWeight = convertWeight(this.state.primary, this.props.user.weight_units, this.state.secondary);
		let toLoseKg = currentWeight - this.props.idealWeightKg;
		let incrementKg = toLoseKg/7;
		let carbRanks =  this.props.carbRanks;
		return (
			<div id='initial-weight-wrap'>
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
			        	<div id='layers'>{"Your ideal weight is " + weightStringFromKg(this.props.idealWeightKg, this.props.weightUnits)}</div>
			        	<h2>You have to lose {weightStringFromKg(currentWeight - this.props.idealWeightKg, this.props.weightUnits)} to reach your ideal weight. Here's how we'll get you there:</h2>
			        	<div id='incentive-layers'>
			        		<div id='incentive-layers'>
								<div className='stage'>
									<div className='stage-title'>Level 1</div>
									<div className='stage-description'>
										<div className='section'>
											<div className='section-header'>Until you have reduced your weight to {weightStringFromKg(currentWeight-2*incrementKg, this.props.weightUnits)}, you may have</div>
											<div className='section-description'>
												Anything other than any incentive food. Eat as much as you want, but if you do you’ll never eat any incentive foods again.
											</div>
										</div>
										<div className='section'>
											<div className='section-header'>You may not have</div>
											<div className='section-description'>{ disallowedCarbs(0, carbRanks).map(x => x) }</div>
										</div>
									</div>
								</div>
								<div className='stage'>
									<div className='stage-title'>Level 2</div>
									<div className='stage-description'>
										<div className='section'>
											<div className='section-header'>Until you have reduced your weight to {weightStringFromKg(currentWeight-3*incrementKg, this.props.weightUnits)}, you may have</div>
											<div className='section-description'>{ allowedCarbs(1, carbRanks).map(x => x) }</div>
										</div>
										<div className='section'>
											<div className='section-header'>You may not have</div>
											<div className='section-description'>{ disallowedCarbs(1, carbRanks).map(x => x) }</div>
										</div>
									</div>
								</div>
								<div className='stage'>
									<div className='stage-title'>Level 3</div>
									<div className='stage-description'>
										<div className='section'>
											<div className='section-header'>Until you have reduced your weight to {weightStringFromKg(currentWeight-4*incrementKg, this.props.weightUnits)}, you may have</div>
											<div className='section-description'>{ allowedCarbs(2, carbRanks).map(x => x) }</div>
										</div>
										<div className='section'>
											<div className='section-header'>You may not have</div>
											<div className='section-description'>{ disallowedCarbs(2, carbRanks).map(x => x) }</div>
										</div>
									</div>
								</div>
								<div className='stage'>
									<div className='stage-title'>Level 4</div>
									<div className='stage-description'>
										<div className='section'>
											<div className='section-header'>Until you have reduced your weight to {weightStringFromKg(currentWeight-5*incrementKg, this.props.weightUnits)}, you may have</div>
											<div className='section-description'>{ allowedCarbs(3, carbRanks).map(x => x) }</div>
										</div>
										<div className='section'>
											<div className='section-header'>You may not have</div>
											<div className='section-description'>{ disallowedCarbs(3, carbRanks).map(x => x) }</div>
										</div>
									</div>
								</div>
								<div className='stage'>
									<div className='stage-title'>Level 5</div>
									<div className='stage-description'>
										<div className='section'>
											<div className='section-header'>Until you have reduced your weight to {weightStringFromKg(currentWeight-6*incrementKg, this.props.weightUnits)}, you may have</div>
											<div className='section-description'>{ allowedCarbs(4, carbRanks).map(x => x) }</div>
										</div>
										<div className='section'>
											<div className='section-header'>You may not have</div>
											<div className='section-description'>{ disallowedCarbs(4, carbRanks).map(x => x) }</div>
										</div>
									</div>
								</div>
								<div className='stage'>
									<div className='stage-title'>Level 6</div>
									<div className='stage-description'>
										<div className='section'>
											<div className='section-header'>Until you have reduced your weight to {weightStringFromKg(currentWeight-7*incrementKg, this.props.weightUnits)}, you may have</div>
											<div className='section-description'>{ allowedCarbs(5, carbRanks).map(x => x) }</div>
										</div>
										<div className='section'>
											<div className='section-header'>You may not have</div>
											<div className='section-description'>{ disallowedCarbs(5, carbRanks).map(x => x) }</div>
										</div>
									</div>
								</div>
								<div className='stage'>
									<div className='stage-title'>Level 7: Target Weight Achieved. Incentives Change.</div>
									<div className='stage-description'>
										<div className='section'>
											<div className='section-header'>You may have</div>
											<div className='section-description'>Whatever you want<InfoLink title='as long as you maintain your weight' list='Once you reach your ideal weight you will enter Maintenance mode, where your average weight over various periods of time will determine what incentive foods you may have'/></div>
										</div>
									</div>
								</div>
							</div>
			        	</div>
				        <div onClick={() => this.props.updateIntroState({initialWeight: convertWeight(this.state.primary, this.props.user.weight_units, this.state.secondary)})} className='intro-nav'>NEXT: Make it real</div>
					</div> : null
				}
				</div>
				<div onClick={() => this.props.updateIntroState({height: null})} className='intro-nav back'>Back</div>
			</div>
		)
	}
}