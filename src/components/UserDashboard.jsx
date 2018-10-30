import React, { Component } from 'react';
import { connect } from 'react-redux';
import { weights, notifications, auth } from "../actions";
import { planTitles, weightStringFromKg, allowedCarbs, disallowedCarbs, lossmodeLevel, setupAverages, calcAverages, maintenanceCarbOrder, carbOptions, interpolateDates, guessWeightsToNow } from './utils';
import PaypalButton from './PaypalButton';
import WeightGraph from './WeightGraph';

import moment from 'moment';
import '../css/UserDashboard.css';

let paymentFracs = [0.25,0.1,0.0];

class UserDashboard extends Component {
	componentDidMount(){
		if (this.props.weights.length && this.props.weights[0] === null){
			this.props.fetchWeights();
		}
	}
	updateValue(e){
		this.setState({monetary_value:e.target.value});
	}
	updateSettings(key, value){
		this.props.updateUserSettings(key,value);
	}
	render(){
		if (this.props.weights.length && this.props.weights[0] === null){
			return (
				<div>Loading Weights...</div>
			)
		}

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
		
        let initialWeight  = weights[user.starting_weight];
		let currentWeight = weights[weights.length - 1 ];
		
		//Adjust starting index to account for points  interpolated from 0 through starting weight
        let newStartingIndex = moment(dates[user.starting_weight]).diff(dates[0], "days");
        
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

		let totalOwed = 0;
		let remainingOwed = 0;

		let level, mWeights, modStart, weightAvgs;
		if (user.mode === "0"){

			level = lossmodeLevel(weights[newStartingIndex], user.ideal_weight_kg, weights[weights.length-1]);
			totalOwed = paymentFracs[user.payment_option-1]*level*user.monetary_value;
			remainingOwed = totalOwed-user.amount_paid;

		} else {
			level = 7;
			
			let mData = setupAverages(weights, dates, newStartingIndex);
			mWeights = mData.weights;
			modStart = mData.startIndex;
			weightAvgs = calcAverages(modStart, mWeights);
			weightAvgs = weightAvgs[weightAvgs.length-1];
		}
		
		return (
			<div id='dashboard-wrap'>
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
						
						<div id='dashboard-fourth'>
							<WeightGraph 
								user={user} 
								level={level} 
								weights={weights} 
								dates={dates} 
								ids={ids} 
								startingIndex={newStartingIndex} 
								updateWeight={this.props.updateWeight} 
								addWeight={(weightKg, date) => this.props.addWeight(weightKg, date)}
							/>
						</div>
					</div>
				}
				{
					user.mode === "1" ?
						<div className='mode-switch'>
							<div className='mode-switch-button' onClick={() => this.props.updateUserSettings("mode", "0")}>
								Switch to Weight Loss Mode
							</div>
						</div>
					: weights[weights.length - 1] <= user.ideal_weight_kg ?
						<div className='mode-switch'>
							<div className='mode-switch-button' onClick={() => this.props.updateUserSettings("mode", "1")}>
								Switch to Maintenance Mode
							</div>
						</div>
					: null
				}
				<div id='status-bar'>
					<div id='primary-status'>
						<div className='primary-status-section'>

							<div className='primary-status-inner-section'>
								<div className='top-label'>Mode:</div>
								<div className='top-entry' id='current-mode'>
								{
									user.mode === "0" ?
										"Weight Loss"
									:
										"Maintentance"
								}
								</div>
							</div>

							<div className='primary-status-inner-section'>
								<div className='top-label'>Current Weight</div>
								<div className='top-entry'>{ weightStringFromKg(currentWeight, user['weight_units']) }</div>
							</div>

						</div>
						<div className='primary-status-section'>
							<div className='primary-status-header'>You may have</div>
							<div className='primary-status-content'>
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
						<div className='primary-status-section'>
							<div className='primary-status-header'>You may not have</div>
							<div className='primary-status-content'>
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
					<div id='secondary-status'>

						<div className='secondary-status-section'>
							<div className='top-label'>Starting Weight</div>
							<div className='top-entry'>{ weightStringFromKg(initialWeight, user.weight_units) }</div>
						</div>

						<div className='secondary-status-section'>
							<div className='center-label top-label'>You've {initialWeight - currentWeight >= 0 ? "lost" : "gained"}</div>
							<div className='top-entry'>
							{
								initialWeight - currentWeight >= 0 ? weightStringFromKg(initialWeight - currentWeight, user['weight_units']) :
								weightStringFromKg(currentWeight - initialWeight, user['weight_units'])
							}
							</div>
						</div>

						<div className='secondary-status-section'>
							<div className='primary-status-header'>Next target weight: </div>
								<div className='top-entry'>
									{
										level < 7 ? 
											weightStringFromKg(weights[newStartingIndex]-(level+2)*(weights[newStartingIndex] - user.ideal_weight_kg)/8, user.weight_units)
										: 
											"Maintain weight under " + weightStringFromKg(user.ideal_weight_kg, user.weight_units)
									}
								</div>
						</div>
						<div className='secondary-status-section'>
							<div className='top-label'>Ideal weight</div>
							<div className='top-entry'>
							{
								weightStringFromKg(user['ideal_weight_kg'], user['weight_units'])
							}
							</div>
						</div>
					</div>
				</div>
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
		addNotification: message => {
			return dispatch(notifications.addNotification(message));
		},
        updateUserSettings: (key, value) => {
            return dispatch(auth.updateUserSettings(key, value))
        },
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDashboard);