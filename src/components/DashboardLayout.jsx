import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { auth, weights } from "../actions";
import { connect } from 'react-redux';
import { weightStringFromKg } from './utils';

class DashboardLayout extends Component {
    render(){
        return (
            <div id='top-area'>
				<div id='logout' onClick={() => this.handleLogout()}>Logout</div>
                <Link id='username-settings' to='/UserSettings'>{this.props.auth.email}</Link>
                <div className='top-section'>
                    <div className='top-label'>You started at</div>

                    <div className='top-entry'>
                    {
                        weightStringFromKg(initialWeight, user['weight_units'])
                    }
                    </div>
                </div>
                <div className='top-section'>
                    <div className='center-label top-label'>You're At</div>
                    <div className='top-entry'>
                    {
                        weightStringFromKg(currentWeight, user['weight_units'])
                    }
                    </div>
                    <div className='center-label top-label'>You've {initialWeight - currentWeight >= 0 ? "lost" : "gained"}</div>
                    <div className='top-entry'>
                    {
                        weightStringFromKg(initialWeight - currentWeight, user['weight_units'])
                    }
                    </div>
                </div>
                <div className='top-section'>
                    <div className='top-label'>Ideal weight</div>
                    <div className='top-entry'>
                    {
                        weightStringFromKg(user['ideal_weight_kg'], user['weight_units'])
                    }
                    </div>
                </div>
            </div>
            
        )
    }
}
const mapStateToProps = state => {
	return {
		intro: state.intro,
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
		},
		updateUserSettings: (key, value) => {
			return dispatch(auth.updateUserSettings(key, value))
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardLayout);