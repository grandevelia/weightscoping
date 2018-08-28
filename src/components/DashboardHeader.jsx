import React, { Component } from 'react';
import { connect } from 'react-redux';
import { auth, weights } from "../actions";
import { Link } from 'react-router-dom';
import { weightStringFromKg } from './utils';
import '../css/UserDashboard.css';
class DashboardHeader extends Component {
    render(){
		let user = this.props.auth.user;
		let weights = Object.keys(this.props.weights).map(key => {
			return this.props.weights[key]['weight_kg'];
		});

		let weightLen = weights.length - 1;
		let initialWeight  = weights[0];
		let currentWeight = weights[weightLen];
        return (
            <div id='top-area'>
                <div id='dashboard-nav-links'>
                    <div id='logout' onClick={() => this.handleLogout()}>Logout</div>
                    <Link id='settings-link' to='/UserSettings'>{user.email.substring(0, user.email.indexOf('@'))}</Link>
                </div>
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
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardHeader);