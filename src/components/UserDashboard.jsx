import React, { Component } from 'react';
import { connect } from 'react-redux';
import { weights, notifications, auth } from "../actions";
import { planTitles, weightStringFromKg, poundsToKg, allowedCarbs, disallowedCarbs, lossmodeLevel, setupAverages, calcAverages, maintenanceCarbOrder, carbOptions } from './utils';
import PaypalButton from './PaypalButton';
import ProgressSummary from './ProgressSummary';
import WeightGraph from './WeightGraph';

import moment from 'moment';
import '../css/UserDashboard.css';

let paymentFracs = [0.25,0.1,0.0];

class UserDashboard extends Component {
	state = {
		weightDate: null,
		newWeightPrimary: null,
		newWeightSecondary: null
	}
	componentDidMount(){
		this.props.fetchWeights();
	}
	addWeight(e){
		e.preventDefault();
		if (this.state.weightDate){
			let dateString = moment(this.state.weightDate.utc()._d).format("YYYY-MM-DD");
			for (let i = 0; i < weights.length; i ++){
				if (weights[i].date_added === dateString){
					let conf = window.confirm("You've already added a weight for " + dateString + ". Update this weight?");
					if (conf){
						this.props.updateWeight(this.convertWeight(), weights[i].id);
					}
					this.setState({weightDate: null, newWeightPrimary: null, newWeightSeconday: null});
					return;
				}
			}
			this.props.addWeight(this.convertWeight(), dateString);
			this.setState({weightDate: null, newWeightPrimary: null, newWeightSeconday: null});
		} else {
			alert("You have to choose the date you weighed this much!");
		}
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
	updateValue(e){
		this.setState({monetary_value:e.target.value});
	}
	chooseWeightDate = (date) => {
		this.setState({weightDate: date});
	}
	deleteWeight = id => {
		this.props.deleteWeight(id);
	}
	updateSettings(key, value){
		this.props.updateUserSettings(key,value);
	}
	render(){
		if (this.props.weights.length > 0 && this.props.weights[0] === null){
			return (
				<div>Loading Weights...</div>
			)
		}
		let user = this.props.auth.user;
		let weights = this.props.weights;

		let totalOwed, remainingOwed;
		let level, mWeights, modStart, weightAvgs;
		if (user.mode === "0"){
			level = lossmodeLevel(weights[user.starting_weight].weight_kg, user.ideal_weight_kg, weights[weights.length-1].weight_kg);
			totalOwed = paymentFracs[user.payment_option-1]*level*user.monetary_value/100;
			remainingOwed = totalOwed-user.amount_paid/100;
		} else {
			level = 7;
			totalOwed = 0;
			remainingOwed = 0;
			let weightArr = []
			let dateArr = [];

			//Split user weight data into arrays for easier manipulation
			Object.keys(weights).map(key => {
				dateArr.push(weights[key]['date_added']);
				weightArr.push(weights[key]['weight_kg']);
			});
			let mData = setupAverages(weightArr, dateArr, user.starting_weight);
			mWeights = mData.weights;
			modStart = mData.startIndex;
			weightAvgs = calcAverages(modStart, mWeights);
			weightAvgs = weightAvgs[weightAvgs.length-1];
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
							
							<div id='level-area'>
								<div className='level-area-section'>
									<div className='level-area-header'>You are at level</div>

									<div className='level-area-content'>
										{user.mode === "0" ? level : "Maintenance: " + level }
									</div>
									<div className='level-area-header'>Next target weight: </div>
									<div className='level-area-content'>
										{
											level < 7 ? 
												weightStringFromKg(weights[user.starting_weight].weight_kg-(level+2)*(weights[user.starting_weight].weight_kg - user.ideal_weight_kg)/8, user.weight_units)
											: 
												"Maintain weight under " + weightStringFromKg(user.ideal_weight_kg, user.weight_units)
										}
									</div>
								</div>
								<div className='level-area-section'>
									<div className='level-area-header'>You may have</div>
									<div className='level-area-content'>
										{ 
											level < 7 ? 
												allowedCarbs(level, user.carb_ranks) 
											:
												['All non-incentive foods'].concat(Object.keys(weightAvgs).map( (k,i) => {
													let curr = weightAvgs[k];
													if (curr <= user.ideal_weight_kg){
														return carbOptions[user.carb_ranks[ maintenanceCarbOrder[i] ] ]
													}
												}).filter(e => e)).concat(Array(user.carb_ranks.length - 6).fill().map((x, i) => i + 6).map(i => {
													if (weightAvgs[19] <= user.ideal_weight_kg){
														return carbOptions[user.carb_ranks[ maintenanceCarbOrder[i] ] ];
													}
												})).join(', ')
										}
									</div>
								</div>
								<div className='level-area-section'>
									<div className='level-area-header'>You may not have</div>
									<div className='level-area-content'>
										{ 
											level < 7 ? 
												disallowedCarbs(level, user.carb_ranks) 
											:
												Object.keys(weightAvgs).map((k, i) => {
													let curr = weightAvgs[k];
													if (curr > user.ideal_weight_kg){
														return carbOptions[user.carb_ranks[ maintenanceCarbOrder[i] ] ]
													}
												}).filter(e => e).concat(Array(user.carb_ranks.length - 6).fill().map((x, i) => i + 6).map(i => {
													if (weightAvgs[19] > user.ideal_weight_kg){
														return carbOptions[user.carb_ranks[ maintenanceCarbOrder[i] ] ];
													}
												})).join(', ')
											}
									</div>
								</div>
							</div>
						</div>
						<div id='dashboard-fourth'>
							<WeightGraph user={user} level={level} weights={weights} addWeight={this.props.addWeight} updateWeight={this.props.updateWeight} deleteWeight={this.deleteWeight}/>
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
		weights: state.weights,
		notifications: state.notifications
	}
}

const mapDispatchToProps = dispatch => {
	return {
		fetchWeights: () => {
			return dispatch(weights.fetchWeights());
		},
		addWeight: (weightKg, date) => {
			return dispatch(weights.addWeight(weightKg, date))
		},
		updateWeight: (weightKg, id) => {
			return dispatch(weights.updateWeight(weightKg, id));
		},
		deleteWeight: (id) => {
			return dispatch(weights.deleteWeight(id));
		},
		addNotification: message => {
			return dispatch(notifications.addNotification(message));
		},
        updateUserSettings: (key, value) => {
            return dispatch(auth.updateUserSettings(key, value))
        },
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDashboard);