import React, { Component } from 'react';
import { connect } from 'react-redux';
import { weights, notifications, auth } from "../actions";
import { planTitles, weightStringFromKg, allowedCarbs, disallowedCarbs, lossmodeLevel, setupAverages, calcAverages, maintenanceCarbOrder, carbOptions, interpolateDates, guessWeightsToNow } from './utils';
import PaypalButton from './PaypalButton';
import ProgressSummary from './ProgressSummary';
import WeightGraph from './WeightGraph';

import moment from 'moment';
import '../css/UserDashboard.css';

let paymentFracs = [0.25,0.1,0.0];

class UserDashboard extends Component {
	state = {
		weights: null,
		dates: null,
		ids: null,
		startingIndex: null
	}
	setupWeight(){

		let user = this.props.auth.user;
		let weights = []
		let dates = [];
		let ids = [];
		//Split user weight data into arrays for easier manipulation
		Object.keys(this.props.weights).map(key => {
			dates.push(this.props.weights[key]['date_added']);
			weights.push(this.props.weights[key]['weight_kg']);
			ids.push(this.props.weights[key]['id']);
			return "";
        });
		//Adjust starting index to account for points  interpolated from 0 through starting weight
        let newStartingIndex = moment(dates[user.starting_weight]).diff(moment(dates[0]), "days");
        
        //interpolate missing data
        let interpData = interpolateDates(weights, dates, ids);

        //Don't use first element of second array to avoid duplicate join point
        weights = interpData.weights;
		dates = interpData.dates;
		ids = interpData.ids;

        //Ensure weights are present up to current day
        interpData = guessWeightsToNow(weights, dates, ids);
        weights = interpData.weights;
        dates = interpData.dates;
		ids = interpData.indexes;

		this.setState({
			weights: weights,
			dates: dates,
			ids: ids,
			startingIndex: newStartingIndex
		})
	}
	componentDidMount(){
		if (this.props.weights.length && this.props.weights[0] === null){
			this.props.fetchWeights().then(() => {
				this.setupWeight();
			});
		} else {
			this.setupWeight();
		}
	}
	updateWeight(weight, id){
		let index = 0;
		for (let i = 0; i < this.state.ids.length; i ++){
			if (this.state.ids[i] === id){
				index = i;
				break;
			}
		}
		this.props.updateWeight(weight, id);
		let newWeights = this.state.weights;
		newWeights[index] = weight;
		this.setState({weights: newWeights});
	}
	addWeight(weight, date){
		let index = 0;
		for (let i = 0; i < this.state.dates.length; i ++){
			if (this.state.dates[i] === date){
				index = i;
				break;
			}
		}
		this.props.addWeight(weight, date);
		let newWeights = this.state.weights;
		newWeights[index] = weight;
		this.setState({weights: newWeights});
	}
	updateValue(e){
		this.setState({monetary_value:e.target.value});
	}
	updateSettings(key, value){
		this.props.updateUserSettings(key,value);
	}
	render(){
		if ((this.props.weights.length && this.props.weights[0] === null) || this.state.weights === null){
			return (
				<div>Loading Weights...</div>
			)
		}
		let user = this.props.auth.user;
		let weights = this.state.weights;
		let totalOwed = 0;
		let remainingOwed = 0;

		let level, mWeights, modStart, weightAvgs;
		if (user.mode === "0"){

			level = lossmodeLevel(weights[this.state.startingIndex], user.ideal_weight_kg, weights[weights.length-1]);
			totalOwed = paymentFracs[user.payment_option-1]*level*user.monetary_value;
			remainingOwed = totalOwed-user.amount_paid;

		} else {
			level = 7;
			
			let mData = setupAverages(this.state.weights, this.state.dates, this.state.startingIndex);
			mWeights = mData.weights;
			modStart = mData.startIndex;
			weightAvgs = calcAverages(modStart, mWeights);
			weightAvgs = weightAvgs[weightAvgs.length-1];
		}
		return (
			<div id='dashboard-wrap'>
				<ProgressSummary weights={this.state.weights} user={user}/>
				{user.amount_paid < totalOwed ? 
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
							{
								user.mode === "1" ?
									<div className='mode-switch'>
										<div className='mode-switch-button' onClick={() => this.props.updateUserSettings("mode", "0")}>
											Switch to Weight Loss Mode
										</div>
									</div>
								: this.state.weights[this.state.weights.length - 1] <= user.ideal_weight_kg ?
									<div className='mode-switch'>
										<div className='mode-switch-button' onClick={() => this.props.updateUserSettings("mode", "1")}>
											Switch to Maintenance Mode
										</div>
									</div>
								: null
							}
							<div id='level-area'>
								<div className='level-area-section'>
									<div className='level-area-header'>You are at level</div>
									<div className='level-area-content'>{level}</div>
									<div className='level-area-header'>Next target weight: </div>
									<div className='level-area-content'>
										{
											level < 7 ? 
												weightStringFromKg(weights[this.state.startingIndex]-(level+2)*(weights[this.state.startingIndex] - user.ideal_weight_kg)/8, user.weight_units)
											: 
												"Maintain weight under " + weightStringFromKg(user.ideal_weight_kg, user.weight_units)
										}
									</div>
								</div>

								<div className='level-area-section'>
									<div className='level-area-header'>You may have</div>
									<div className='level-area-content'>
										{ 
											level < 7 || user.mode === "0" ? 
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
											level < 7 || user.mode === "0" ? 
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
							<WeightGraph user={user} level={level} weights={this.state.weights} dates={this.state.dates} ids={this.state.ids} startingIndex={this.state.startingIndex} updateWeight={(weight_kg, id) => this.updateWeight(weight_kg, id)} addWeight={(weight_kg, date) => this.addWeight(weight_kg, date)}/>
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