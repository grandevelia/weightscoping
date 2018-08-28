import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { auth, weights } from "../actions";
import { weightStringFromKg, poundsToKg } from './utils';
import IncentiveLayer from './IncentiveLayer';
import DashboardHeader from './DashboardHeader';
import PaypalButton from './PaypalButton';
import '../css/UserDashboard.css';

//let backendKeys = ["email","alcohol","weight_units","height_units","monetary_value","sex","payment_option"];
let planTitles = ["Classic","Slow Burn", "I Don't Believe You"];
let numLabels = 5;
let labelsMap = Array(numLabels).fill().map((x,i) => i);
let paymentFracs = [0.25,0.1,0.0];

class UserDashboard extends Component {
	constructor(props){
		super(props);
		props.fetchWeights();
		this.state = {
			newWeightPrimary: null,
			newWeightSecondary: null
		}
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
	handleLogout(){
		this.props.logout();
	}
	updateValue(e){
		this.setState({monetary_value:e.target.value});
	}
	render(){
		if (!this.props.auth.isAuthenticated){
			return <Redirect to="/Login" />
		}
		if (!this.props.auth.userConfirmed){
			return <Redirect to="/CompleteRegistration" />
		}
		let user = this.props.auth.user;
		let weights = Object.keys(this.props.weights).map(key => {
			return this.props.weights[key]['weight_kg'];
		});

		let weightLen = weights.length - 1;
		let initialWeight  = weights[0];
		let currentWeight = weights[weightLen];

		let maxWeight = Math.max(...weights);
		let minWeight = Math.min(...weights);
		let weightRange = minWeight - maxWeight;
	/*	let currentdate = new Date(); 
		let datetime = currentdate.getFullYear() + "-"
                + this.zeroPad(currentdate.getMonth()+1,2)  + "-" 
                + this.zeroPad(currentdate.getDate(),2) + "T"  
                + currentdate.getHours() + ":"  
                + currentdate.getMinutes() + ":" 
                + currentdate.getSeconds();
                */
        let level = Math.floor((initialWeight-currentWeight)/((initialWeight - user.ideal_weight_kg)/6));
        let totalOwed = paymentFracs[user.payment_option-1]*level*user.monetary_value/100;
		let remainingOwed = totalOwed-user.amount_paid/100;

		return (
			<div id='dashboard-wrap'>
				<DashboardHeader />
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
						<div id='lower-area-main'>
							<div id='left-area'>
								{	this.props.weights.length < 1 ? <div id='incentives-loading-indicator'>Loading Incentives...</div>
									:
									<IncentiveLayer initialWeightKg={initialWeight} idealWeightKg={user.ideal_weight_kg} carbRanks={user.carb_ranks} alcohol={user.alcohol} weightUnits={user.weight_units} currentWeightKg={currentWeight} />
								}
								</div>
							<div id='graph-area'>
								<div id='graph-top'>
									Progress
								</div>
								<div id='graph-middle'>
									<div id='y-labels'>
									{
										labelsMap.map(y => {
											return <div key={y} className='y-label'>{weightStringFromKg(maxWeight + (weightRange/numLabels) * y, user['weight_units'])}</div>
										})
									}
									</div>
									{
										weights.map((weight, i) => {
											return (
												<div className='data-point' key={i} style={{ width: 100/(weightLen + 1) + "%" }}>
													<div className='weight-point' style={{ bottom: 15 + 80*( weight - minWeight )/-weightRange + "%" }}>
														<div className='point-hover'>{weightStringFromKg(weight, user.weight_units)}</div>
													</div>
												</div>
											)
										})
									}
								</div>
								<div id='x-labels'>
									{
										this.props.weights.length < 1 ? <div id='loading-weights-indicator'>Loading weights...</div>
										:
										labelsMap.map((x, k )=> {
											let j = Math.round(weightLen - weightLen/(x+1));
											return <div key={"xlabel"+k} className='x-label'>{ this.props.weights[j]['date_added'].substring(5,10)}</div>
										})
									}
								</div>
							</div>
						</div>
						<form id='submit-weight' onSubmit={(e) => this.addWeight(e)}>
							<div id='submit-weight-title'>Today's Weight:</div>
								{user.weight_units === "Stones" ?
						            <span id='weight-buttons'>
							            <input type='number' onChange={(e) => this.handleWeightChange(e, "PRIMARY")} placeholder='Stones'/>
							            <input type='number' onChange={(e) => this.handleWeightChange(e, "SECONDARY")} placeholder='Pounds'/>
						            </span> : <input step="0.01" onChange={(e) => this.handleWeightChange(e, "PRIMARY")} type='number' />
					        	}
							<button id='weight-change-submit' type='submit'>Submit</button>
						</form>
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
		logout: () => {
			return dispatch(auth.logout())
		},
		fetchWeights: () => {
			return dispatch(weights.fetchWeights())
		},
		addWeight: (weightKg) => {
			return dispatch(weights.addWeight(weightKg))
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDashboard);