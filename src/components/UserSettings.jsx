import React, { Component } from 'react';
import { connect } from 'react-redux';
import { auth, weights } from "../actions";
import ProgressSummary from './ProgressSummary';
import '../css/UserDashboard.css';
import { planTitles } from './utils';

class UserSettings extends Component {
    constructor(props){
        super(props);
		props.fetchWeights();
        this.state = {
            email: null,
            monetary_value: null,
        }
    }
	updateValue(e){
		this.setState({monetary_value:e.target.value});
	}
	updateEmail(e){
		let val = e.target.value;
		this.setState({email: val})
	}
	updateSettings(key, value){
		this.props.updateUserSettings(key, value);
    }
    resetLevels(e){
        e.preventDefault();
        let conf = window.confirm("If you press OK, your levels will be reset from your current weight, and you will be set to level 0. Your weight history will be saved.");
        if (conf){
            this.props.updateUserSettings("starting_weight", this.props.weights.length-1);
        }
    }
    render(){
        let user = this.props.auth.user;
        return (
            <div id='settings-outer'>
                <ProgressSummary />
                <div id='settings-area'>
                    <h4 id='settings-title'>Settings</h4>
                    <div className='settings-option'>
                        <div className='settings-option-title'>Email</div>
                        <input onChange={(e) => this.updateEmail(e)} type='text' placeholder="Your Email" defaultValue={user.email} />
                        <button onClick={(e) => this.updateSettings("email", this.state.email)}>Submit</button>
                    </div>
                    <div className='settings-option'>
                        <div className='settings-option-title'>Drink Alcohol?</div>
                        <select onChange={(e) => this.updateSettings("alcohol", e.target.value)} value={user.alcohol} className='settings-option-input'>
                            <option value={true}>Yes</option>
                            <option value={false}>No</option>
                        </select>						
                    </div>
                    <div className='settings-option'>
                        <div className='settings-option-title'>Weight Units</div>
                        <select onChange={(e) => this.updateSettings("weight_units", e.target.value)} value={user.weight_units} className='settings-option-input'>
                            <option>Pounds</option>
                            <option>Stones</option>
                            <option>Kilograms</option>
                        </select>
                    </div>
                    <div className='settings-option'>
                        <div className='settings-option-title'>Height Units</div>
                        <select onChange={(e) => this.updateSettings("height_units", e.target.value)} value={user.height_units} className='settings-option-input'>
                            <option>Feet/Inches</option>
                            <option>Centimeters</option>
                        </select>
                    </div>
                    <div className='settings-option'>
                        <div className='settings-option-title'>Sex</div>
                        <select onChange={(e) => this.updateSettings("sex", e.target.value)} value={user.sex} className='settings-option-input'>
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className='settings-option'>
                        <div className='settings-option-title'>Plan</div>
                        <select onChange={(e) => this.updateSettings("payment_option", e.target.value)} value={user.payment_option} className='settings-option-input'>
                            <option value={1}>{planTitles[0]}</option>
                            <option value={2}>{planTitles[1]}</option>
                            <option value={3}>{planTitles[2]}</option>
                        </select>
                    </div>
                    <div className='settings-option'>
                        <div className='settings-option-title'>Value</div>
                        <input onChange={(e) => this.updateValue(e)} defaultValue={user.monetary_value/100} className='settings-option-input' placeholder="Your ideal weight is worth:">
                        </input>
                        <button onClick={(e) => this.updateSettings("monetary_value", this.state.monetary_value)}>Submit</button>
                    </div>
                    <button id='level-reset-button' onClick={(e) => this.resetLevels(e)}>Reset Levels From Current Weight</button>
                </div>
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
        updateUserSettings: (key, value) => {
            return dispatch(auth.updateUserSettings(key, value))
        },
		fetchWeights: () => {
			return dispatch(weights.fetchWeights())
		},
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(UserSettings);