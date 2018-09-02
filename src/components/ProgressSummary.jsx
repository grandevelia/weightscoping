import React, { Component } from 'react';
import { weightStringFromKg } from './utils';
import { connect } from 'react-redux';
import { weights } from "../actions";

class ProgressSummary extends Component {
    constructor(props){
        super(props);
        props.fetchWeights();
        this.state = {
            newWeightPrimary: null,
            newWeightSecondary: null
        }
    }
    render(){
        let user = this.props.auth.user;
		let weights = Object.keys(this.props.weights).map(key => {
			return this.props.weights[key]['weight_kg'];
		});
		let weightLen = weights.length - 1;
		let initialWeight  = weights[user.starting_weight];
        let currentWeight = weights[weightLen];
        
        return (
            <div id='top-area'>
                <div id='top-content'>
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
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ProgressSummary);