import React, { Component } from 'react';
import { connect } from 'react-redux';
import { auth } from "../actions";

import '../css/Intro.css';
import '../css/Plans.css';

let planTitles = ["Classic","Slow Burn", "I Need More Proof"];
let planDescriptions = ["Pay half your value to start, and the other half when you reach your goal", "Pay something each time you reach a new level", "Pay nothing until you reach your goal"];

class PlansPage extends Component {
	updateSettings(key, value){
		this.props.updateUserSettings(key, value);
	}
    render(){
        let user = this.props.auth.user;
        return(
            <div>
                <div id='selected-plan' className='payment-option'>
                    <div className='option-header'>Your Plan: "{planTitles[user.payment_option-1]}"</div>    
                    <div className='plan-description'>{planDescriptions[user.payment_option-1]}</div>
                </div>
                <div id='other-plans'>
                    Other Options
                    {planTitles.map((title, i) => {
                        if (i + 1 !== parseInt(user.payment_option,10) ){
                            return (
                                <div key={i} className='payment-option'>
									<div className='option-header'>"{planTitles[i]}"</div>    
                                    <div className='plan-description'>{planDescriptions[i]}</div>
									<div onClick={() => this.updateSettings("payment_option", (i + 1))} className='option-select'>Select This Plan</div>
                                </div>
                            );
                        } 
                        return "";
                    })}
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
	return {
		auth: state.auth
	}
}

const mapDispatchToProps = dispatch => {
	return {
        updateUserSettings: (key, value) => {
            return dispatch(auth.updateUserSettings(key, value))
        },
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(PlansPage);