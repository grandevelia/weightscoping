import React, { Component } from 'react';
import WeightLossGraph from './WeightLossGraph';
import MModeGraph from './MModeGraph';

export default class WeightGraph extends Component {
    render(){
        let user = this.props.user;
        return (
            <div>
                {
                    user.mode === "0" ?
                        <WeightLossGraph 
                            level={this.props.level} 
                            user={user} 
                            weights={this.props.weights} 
                            dates={this.props.dates}
                            ids={this.props.ids} 
                            startingIndex={this.props.startingIndex} 
                            updateWeight={this.props.updateWeight} 
                            addWeight={this.props.addWeight}
                        />
                    : 
                        <MModeGraph level={this.props.level} user={user} weights={this.props.weights} dates={this.props.dates} ids={this.props.ids} startingIndex={this.props.startingIndex} updateWeight={this.props.updateWeight} addWeight={this.props.addWeight}/>
                }
            </div>
        )
    }
}