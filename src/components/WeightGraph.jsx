import React, { Component } from 'react';
import WeightLossGraph from './WeightLossGraph';
import MModeGraph from './MModeGraph';

export default class WeightGraph extends Component {
    componentDidMount(){
		if (this.props.user.mode === "1"){
			this.setState({wholeGraph : 2});
		}
    }
	changeDisplay(status){
		this.setState({wholeGraph: status});
	}
    render(){
        let user = this.props.user;

        return (
            <div id='graph-area'>
                <div id='graph-top'>
                    {
                        user.mode === "1" ? 
                            <div id='m-axis-labels'>
                                <div className='m-axis-label'>Allowed</div>
                                <div className='m-axis-label'>Length of Average</div>
                            </div>
                        :
                            <div id='axis-labels'>
                                <div className='axis-label'>Allowed</div>
                                <div className='axis-label'>Not Allowed</div>
                                <div className='axis-label'>Weight</div>
                            </div>
                    }
                    <div id='graph-title'>Progress</div>
                </div>
                {
                    user.mode === "0" ?
                        <WeightLossGraph level={this.props.level} user={user} weights={this.props.weights} dates={this.props.dates} ids={this.props.ids} startingIndex={this.props.startingIndex} updateWeight={this.props.updateWeight} addWeight={this.props.addWeight}/>
                    : 
                        <MModeGraph level={this.props.level} user={user} weights={this.props.weights} dates={this.props.dates} ids={this.props.ids} startingIndex={this.props.startingIndex} updateWeight={this.props.updateWeight} addWeight={this.props.addWeight}/>
                }
            </div>
        )
    }
}