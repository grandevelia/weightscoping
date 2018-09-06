import React, { Component } from 'react';
import { connect } from 'react-redux';
import { weights } from "../actions";
import { weightStringFromKg, poundsToKg, iconIndex, carbOrder, carbOptions } from './utils';
import IncentiveLayer from './IncentiveLayer';
import PaypalButton from './PaypalButton';
import ProgressSummary from './ProgressSummary';
import '../css/UserDashboard.css';

let planTitles = ["Classic","Slow Burn", "I Need More Proof"];
let paymentFracs = [0.25,0.1,0.0];

class UserDashboard extends Component {
	constructor(props){
		super(props);
		props.fetchWeights();
		this.state = {
			newWeightPrimary: null,
			newWeightSecondary: null,
			wholeGraph: true,
			zeroIdeal: true 
		}
	}
	changeDisplay(status){
		this.setState({wholeGraph: status});
	}
	changeZero(status){
		this.setState({zeroIdeal: status});
	}
	addWeight(e){
		e.preventDefault();
		this.props.addWeight(this.convertWeight());
	}
	handleWeightChange(e, unit){
		if (unit === "PRIMARY"){
			this.setState({
				newWeightPrimary: e.target.value
			});
		} else if (unit === "SECONDARY"){
			this.setState({
				newWeightSecondary: e.target.value
			});
		}
	}
	convertWeight(){
		let weightUnits = this.props.auth.user.weight_units;
		if (weightUnits === "Stones"){
			return poundsToKg(parseInt(this.state.newWeightPrimary,10) * 14 + parseInt(this.state.newWeightSecondary,10));
		} else if (weightUnits === "Pounds"){
			return poundsToKg(parseInt(this.state.newWeightPrimary,10));
		}
		return this.state.newWeightPrimary;
	}
	zeroPad(num, digits){
		let numString = num + "";
		while(numString.length < digits){
			numString = "0" + numString;
		}
		return numString;
	}
	updateValue(e){
		this.setState({monetary_value:e.target.value});
	}
	allowedIcons(index, carbRanks){
		if (isNaN(index)){
			return <div className='loading-icons'>Loading...</div>
		}
		if (index === 0){
			return (
				<div className='allowed-icons'>
					<div className='icon icon-allowed' id='non-incentive-icon'>
						<div className='icon-description'>Non Incentive Food</div>
					</div>
				</div>
			)
		}
		let indexArr = Array( index ).fill().map((x,i) => i);
		return (
			<div className='allowed-icons'>
				<div className='icon icon-allowed' id='non-incentive-icon'>
					<div className='icon-description'>Non Incentive Food</div>
				</div>
				{indexArr.map((x, i) => {
					let index = carbRanks[ carbOrder[ i ] ];
					return (
						<div key={i} className='icon icon-allowed' id={iconIndex[index] + "-icon"}>
							<div className='icon-description'>{carbOptions[ index ]}</div>
						</div>
					)
				})}
			</div>
		);
	}
	disallowedIcons = (index, carbRanks) => {
		if (isNaN(index)){
			return <div className='loading-icons'>Loading...</div>
		}
		let arr = Array( carbOptions.length - index - 1 ).fill().map((x,i) => index + i);
		return (
			<div className='disallowed-icons'>
				{arr.map(i => {

					//Non-alcohol drinkers will have shorter rank arrays than available indices
					if (i < carbRanks.length){
						let index = carbRanks[ carbOrder[ i ] ];
						return (
							<div key={i} className='icon icon-diallowed' id={iconIndex[index] + "-icon"}>
								<div className='icon-cross'></div>
								<div className='icon-description'>{carbOptions[ index ]}</div>
							</div>
						)
					}
					return "";
				})}
			</div>
		);
	}
	render(){
		let numLevels = 8;
		let numSections = numLevels + 1; 
		let levelMap = Array( numLevels ).fill().map((x,i) => i);

		let user = this.props.auth.user;
		let weights = this.props.weights;

		weights = Object.keys(weights).map(key => {
			return this.props.weights[key]['weight_kg'];
		});

		if (!this.state.wholeGraph){
			weights.splice(0, user.starting_weight);
		}

		let weightLen = weights.length - 1;
		let initialWeight;
		if (this.state.wholeGraph){
			initialWeight  = weights[user.starting_weight];
		} else {
			initialWeight = weights[0];
		}

		let currentWeight = weights[weightLen];

		let maxWeight = Math.max(...weights);
		let minWeight;
		if (this.state.zeroIdeal){
			minWeight = Math.min(...weights, user['ideal_weight_kg']);
		} else {
			minWeight = Math.min(...weights);
		}
		let weightRange = maxWeight - minWeight;

		/*
		*	Percentage height of graph for each level
		*	Total height expressed in terms of graph height
		*	Zero all weights by subtracting minWeight
		*
		*	Each section is 1/numSections of zeroed initialWeight kg
		*	In terms of percentage of graph height, each section is (initial - min) / (numSections * range)
		*/
		let sectionHeight = (initialWeight - minWeight)/(numSections * weightRange);

		//	Divide by numLevels here since there are numSections - 1 = numLevels increments between the sections
		let kgPerSection = (initialWeight - user.ideal_weight_kg)/numLevels;

		let level = Math.floor((initialWeight - currentWeight)/kgPerSection);
		//First level is two increments from initial weight
		if (level >= 1){
			level = level - 1;
		} else if (level < 0){
			level = 0;
		}

		if (!this.state.zeroIdeal){
			sectionHeight = sectionHeight * numLevels/level;
			numLevels = level;
			numSections = level + 1;
			levelMap = Array( numLevels ).fill().map((x,i) => i);
		}

		let red = 22 + 5 * level;
		let green = 52 + 20 * level;
		let blue = 123 + 15 * level;
		let levelBg = "rgb(" + red + ", " + green + ", " + blue + ")";

        let totalOwed = paymentFracs[user.payment_option-1]*level*user.monetary_value/100;
		let remainingOwed = totalOwed-user.amount_paid/100;

		const styles = {
			firstSection : {
				/*
				*	Percentage of graph height not taken up by level sections
				*	Subtract zeroed initial weight from zeroed max weight (range) and divide by range
				*/
				flexBasis: 100 * (weightRange - (initialWeight - minWeight))/weightRange + '%'
			},
			singleSection: {
				flexBasis: 100 * sectionHeight + '%'
			},
			doubleSection:{
				flexBasis: 200 * sectionHeight + '%'
			}
		}
		return (
			<div id='dashboard-wrap'>
				<ProgressSummary />
				{user.amount_paid/100 < totalOwed ? 
					<div id='payment-info-area'>
						<div className='payment-option'>
							<div className='option-header'>{planTitles[user.payment_option-1]}</div>
							<div className='payment-amount'>You've committed: {"$"+remainingOwed.toFixed(2)}</div>
							<PaypalButton updateSettings={(key, value) => this.updateSettings(key, value)} paymentAmount={remainingOwed} />
						</div>
						<div>Or Change Your Plan:
							<select onChange={(e) => this.updateSettings("payment_option", e.target.value)} value={user.payment_option} className='settings-option-input'>
								<option value={1}>{planTitles[0]}</option>
								<option value={2}>{planTitles[1]}</option>
								<option value={3}>{planTitles[2]}</option>
							</select>
						</div>
					</div>
					:
					<div id='lower-area'>
						<div id='dashboard-third'>
							<form id='submit-weight' onSubmit={(e) => this.addWeight(e)}>
								<div id='submit-weight-title'>Enter A Weight:</div>
								<div id='submit-weight-input-area'>
									{user.weight_units === "Stones" ?
										<span id='weight-buttons'>
											<input type='number' onChange={(e) => this.handleWeightChange(e, "PRIMARY")} placeholder='Stones'/>
											<input type='number' onChange={(e) => this.handleWeightChange(e, "SECONDARY")} placeholder='Pounds'/>
										</span> : <input step="0.01" onChange={(e) => this.handleWeightChange(e, "PRIMARY")} type='number' />
									}
									<button id='weight-change-submit' type='submit'>Submit</button>
								</div>
							</form>
							{	this.props.weights.length < 1 ? <div id='incentives-loading-indicator'>Loading Incentives...</div>
								:
								<IncentiveLayer level={level} initialWeightKg={initialWeight} idealWeightKg={user.ideal_weight_kg} carbRanks={user.carb_ranks} alcohol={user.alcohol} weightUnits={user.weight_units} currentWeightKg={currentWeight} />
							}
						</div>
						<div id='dashboard-fourth'>
							<div id='graph-area' style={{background:levelBg}}>
								<div id='graph-top'>
									<div id='axis-labels'>
										<div className='axis-label'>Allowed</div>
										<div className='axis-label'>Not Allowed</div>
										<div className='axis-label'>Weight</div>
									</div>
									<div id='graph-title'>Progress</div>
									<div id='graph-top-right'>

										{user.starting_weight !== 0 ?
											<div className='toggle-section'>
												<div className='toggle-section-header'>Graph View:</div>
												<div className={this.state.wholeGraph ? 'toggle-option active' : 'toggle-option'} onClick={() => this.changeDisplay(true)}>History</div>
													<div className={this.state.wholeGraph ? 'toggle-option' : 'toggle-option active'} onClick={() => this.changeDisplay	(false)}>Current</div>
											</div>

											: null
										}
										<div className='toggle-section'>
											<div className='toggle-section-header'>Zero Weight:</div>
											<div className={this.state.zeroIdeal ? 'toggle-option active' : 'toggle-option'} onClick={() => this.changeZero(true)}>Ideal</div>
											<div className={this.state.zeroIdeal ? 'toggle-option' : 'toggle-option active'} onClick={() => this.changeZero(false)}>Current</div>
										</div>
									</div>
								</div>
									<div id='graph-middle'>
									<div id='y-labels'>

									{this.state.wholeGraph ? 
										<div className='y-label graph-section graph-section-0' style={{...styles.firstSection, background: levelBg}}><div className='y-label-weight'>{weightStringFromKg(maxWeight, user['weight_units'])}</div></div>
										: null
									}
									{
										levelMap.map(y => {
											let yWeight = initialWeight - (y + 1) * kgPerSection;
											let currStyle;
											if (y === 0){
												currStyle = styles.doubleSection;
												yWeight += kgPerSection;
											} else {
												currStyle = styles.singleSection;
											}
											if (y <= level){
												currStyle = {...currStyle, background: levelBg};
											} else {
												let currRed = 57 - 5 * (numLevels - y + 1);
												let currGreen = 192 - 20 * (numLevels - y + 1);
												let currBlue = 228 - 15 * (numLevels - y + 1);
												let currBackground = "rgb(" + currRed + ", " + currGreen + ", " + currBlue + ")";
												currStyle = {...currStyle, background: currBackground, borderTop: "1px dashed rgba(0,0,0,0.2)"};
											}
											return (
												<div key={y} className={'y-label graph-section graph-section-' + (y+1)} style={currStyle}>
													<div className='icons-wrap'>
														{y > level ? this.allowedIcons(y, user.carb_ranks) : null}
														{y > level ? this.disallowedIcons(y, user.carb_ranks) : null}
													</div>
													<div className='y-label-weight'>{ weightStringFromKg( yWeight , user['weight_units'] )}</div>
												</div>
											)
										})
									}
									</div>
									<div id='graph-display'>
										<div id='graph-display-backgrounds'>

										{this.state.wholeGraph ? 
											<div className='graph-section graph-section-0' style={{...styles.firstSection, background: levelBg}}></div>
											: null
										}
											{
												levelMap.map(y => {
													let currStyle;
													if (y === 0){
														currStyle = styles.doubleSection;
													} else {
														currStyle = styles.singleSection;
													}
													if (y <= level){
														currStyle = {...currStyle, background: levelBg}
													} else {
														let currRed = 57 - 5 * (numLevels - y + 1);
														let currGreen = 192 - 20 * (numLevels - y + 1);
														let currBlue = 228 - 15 * (numLevels - y + 1);
														let currBackground = "rgb(" + currRed + ", " + currGreen + ", " + currBlue + ")";
														currStyle = {...currStyle, background: currBackground, borderTop: "1px dashed rgba(0,0,0,0.2)"};
													}
													return <div key={y} className={'graph-section graph-section-' + (y+1)} style={currStyle}></div>;
												})
											}
										</div>
										{
											weights.map((weight, i) => {
												return (
													<div className='data-point' key={i} style={{ width: 100/(weightLen + 1) + "%" }}>
														<div className='weight-point' style={{top: (1+ 99 * ( maxWeight - weight )/weightRange) + "%" }}>
															<div className='point-hover'>{weightStringFromKg(weight, user.weight_units)}</div>
														</div>
													</div>
												)
											})
										}
									</div>
								</div>
								<div id='x-labels'>
									{
										this.props.weights.length < 1 ? <div id='loading-weights-indicator'>Loading weights...</div>
										:
										levelMap.map((x, k )=> {
											let j = Math.round(weightLen - weightLen/(x+1));
											return <div key={"xlabel"+k} className='x-label'>{ this.props.weights[j]['date_added'].substring(5,10)}</div>
										})
									}
								</div>
							</div>
						</div>
					</div>
				}
			</div>
		)
	}
}

const mapStateToProps = state => {
	return {
		auth: state.auth,
		weights: state.weights
	}
}

const mapDispatchToProps = dispatch => {
	return {
		fetchWeights: () => {
			return dispatch(weights.fetchWeights())
		},
		addWeight: (weightKg) => {
			return dispatch(weights.addWeight(weightKg))
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDashboard);