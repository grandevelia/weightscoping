import React, { Component } from 'react';
import { weightStringFromKg } from './utils';

export default class ProgressSummary extends Component {
    render(){
        let user = this.props.user;
        let weights = this.props.weights;

        let initialWeight  = weights[user.starting_weight];
        let currentWeight = weights[weights.length - 1 ];
        
        return (
            <div id='top-area'>
                <div id='top-content'>
                    <div className='top-section'>
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
                    <div className='top-section'>
                        <div className='top-label'>You started at</div>
                        <div className='top-entry'>{ weightStringFromKg(initialWeight, user.weight_units) }</div>
                    </div>
                    <div className='top-section'>
                        <div className='center-label top-label'>You're At</div>
                        <div className='top-entry'>{ weightStringFromKg(currentWeight, user['weight_units']) }</div>
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