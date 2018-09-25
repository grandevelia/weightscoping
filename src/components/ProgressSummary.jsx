import React, { Component } from 'react';
import { weightStringFromKg, breakthroughIndex, mStatusCheck } from './utils';
import { connect } from 'react-redux';
import { weights, auth } from "../actions";
import moment from 'moment';

class ProgressSummary extends Component {
    state = {
        newWeightPrimary: null,
        newWeightSecondary: null
    }
    componentDidMount(){
        this.props.fetchWeights();
    }
    render(){
        let user = this.props.auth.user;
        let weights = this.props.weights;
        let warningDays, weightsArr, dates;

        if (weights.length < 1){
            return <div>Loading Weight History...</div>
        }
		let initialWeight  = weights[user.starting_weight].weight_kg;
        let currentWeight = weights[weights.length - 1 ].weight_kg;
        
        let daysAtIdeal = 0;
        if (user.mode === "0"){
            let closestIdealBreakthrough = breakthroughIndex( Object.keys(this.props.weights).map(key => weights[key]['weight_kg']), user.ideal_weight_kg );

            if (closestIdealBreakthrough >= 0){
                daysAtIdeal = 1 + moment().diff(moment(weights[closestIdealBreakthrough].date_added), 'days');
            }
        } else {
            weightsArr = []
            dates = [];
    
            //Split user weight data into arrays for easier manipulation
            Object.keys(weights).map(key => {
                dates.push(weights[key]['date_added']);
                weightsArr.push(weights[key]['weight_kg']);
            });

            warningDays = mStatusCheck(weightsArr, dates, user.starting_weight, user.ideal_weight_kg);
        }
        return (
            <div id='top-area'>
                <div id='top-content'>
                    <div className='top-section'>
                        <div className='top-label'>Mode:</div>
                        <div className='top-entry' id='current-mode'>
                        {
                            user.mode === "0" ?

                                daysAtIdeal > 0 ?
                                    <div>
                                        <div id='maintenance-mouseover'>
                                            Once you reach your ideal weight, you must maintain within 2% of it in order to enter the next phase
                                        </div>
                                        Days to Maintenance Mode: {(7-daysAtIdeal)}
                                    </div>
                                :
                                    "Weight Loss"
                            : warningDays < 10 ?
                                <div>
                                    Maintentance
                                    <div id='reversion-warning'>
                                        Exceeding all allowed Averages. Days to reversion to Weight Loss Mode: {warningDays}
                                    </div>
                                </div>
                            :
                            "Maintentance"
                        }
                        </div>
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
                            initialWeight - currentWeight >= 0 ? weightStringFromKg(initialWeight - currentWeight, user['weight_units']) :
                            weightStringFromKg(currentWeight - initialWeight, user['weight_units'])
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
        },
        updateUserSettings: (key, value) => {
            return dispatch(auth.updateUserSettings(key, value))
        },
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ProgressSummary);