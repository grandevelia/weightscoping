import React, { Component } from 'react';
import { weightStringFromKg } from './utils';
import { connect } from 'react-redux';
import { weights } from "../actions";
import moment from 'moment';

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
        let weights = this.props.weights;
        let weightLen = weights.length - 1;
        if (weightLen < 1){
            return <div>Loading Weight History...</div>
        }
		let initialWeight  = weights[user.starting_weight].weight_kg;
        let currentWeight = weights[weightLen].weight_kg;
        let closestIdealBreakthrough = -1;
        if (currentWeight <= 1.02 * user.ideal_weight_kg){
            //Starting from most recent weight, find the most recent time they attained their ideal weight
            //For the first time without having been in maintenance mode first
            
            for (let i = weightLen; i >= 0; i --){
                if (weights[i].weight_kg <= 1.02 * user.ideal_weight_kg){
                    if (weights[i].weight_kg <= user.ideal_weight_kg){
                        closestIdealBreakthrough = i;
                    }
                } else {
                    break;
                }
            }
        }
        let daysAtIdeal = 0;
        if (closestIdealBreakthrough >= 0){
            daysAtIdeal = moment().diff(moment(weights[closestIdealBreakthrough].date_added), 'days');
        }
        
        return (
            <div id='top-area'>
                <div id='top-content'>
                    <div className='top-section'>
                        <div className='top-label'>Mode:</div>
                        <div className='top-entry'>
                        {
                            currentWeight < user['ideal_weight_kg'] + (initialWeight-user['ideal_weight_kg'])/7 ?
                                daysAtIdeal < 7 ?
                                "Days to Maintenance Mode: " + (7-daysAtIdeal)
                                : 
                                "Maintenance"
                            :
                                "Weight Loss"
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
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(ProgressSummary);