import React, { Component } from 'react';
import { iconIndex, carbOrder, carbOptions } from './utils';
import WeightHistoryGraph from './WeightHistoryGraph';
import WeightLossGraph from './WeightLossGraph';
import MModeGraph from './MModeGraph';

export default class WeightGraph extends Component {
    state = {
		wholeGraph: 1,
		zeroIdeal: true
    }
    componentDidMount(){
		if (this.props.user.mode === "1"){
			this.setState({wholeGraph : 2});
		}
    }
	changeDisplay(status){
		this.setState({wholeGraph: status});
	}
	changeZero(status){
		this.setState({zeroIdeal: status});
	}
	allowedIcons(index, carbRanks){
		if (isNaN(index)){
			return <div className='loading-icons'>Loading...</div>
		}
		if (index === 0){
			return (
				<div className='allowed-icons'>
					<div className='icon icon-allowed' id='non-incentive-icon'>
						<div className='icon-description'>Non Incentive Food</div>
					</div>
				</div>
			)
		}
		let indexArr = Array( index ).fill().map((x,i) => i);
		return (
			<div className='allowed-icons'>
				<div className='icon icon-allowed' id='non-incentive-icon'>
					<div className='icon-description'>Non Incentive Food</div>
				</div>
				{indexArr.map((x, i) => {
					let index = carbRanks[ carbOrder[ i ] ];
					return (
						<div key={i} className='icon icon-allowed' id={iconIndex[index] + "-icon"}>
							<div className='icon-description'>{carbOptions[ index ]}</div>
						</div>
					)
				})}
			</div>
		);
	}
	disallowedIcons(index, carbRanks) {
		if (isNaN(index)){
			return <div className='loading-icons'>Loading...</div>
		}
		let arr = Array( carbOptions.length - index - 1 ).fill().map((x,i) => index + i);
		return (
			<div className='disallowed-icons'>
				{arr.map(i => {
                    //For non-alcohol drinkers, carbRanks.length < than available indices
                    //With alcoholic options as the last two entries in the carbOptions array,
                    //using index only if it is < carbRanks.length avoids out of bounds errors
					if (i < carbRanks.length){
						let index = carbRanks[ carbOrder[ i ] ];
						return (
							<div key={i} className='icon icon-diallowed' id={iconIndex[index] + "-icon"}>
								<div className='icon-cross'></div>
								<div className='icon-description'>{carbOptions[ index ]}</div>
							</div>
						)
					}
					return "";
				})}
			</div>
		);
    }
    calcStyles(maxWeight, minWeight, initialWeight, sectionHeight){
        let weightRange = maxWeight - minWeight;
		return {
			firstSection : {
				/*
				*	Percentage of graph height not taken up by level sections
				*	Subtract zeroed initial weight from zeroed max weight (range) and divide by range
				*/
				flexBasis: 100 * (weightRange - (initialWeight - minWeight))/weightRange + '%'
			},
			singleSection: {
				flexBasis: 100 * sectionHeight + '%'
			},
			doubleSection:{
				flexBasis: 200 * sectionHeight + '%'
			}
		}
    }
    render(){
        let level = this.props.level;
        let user = this.props.user;
        let levelBg;

        let red = 22 + 5 * level;
        let green = 52 + 20 * level;
        let blue = 123 + 15 * level;
        levelBg = "rgb(" + red + ", " + green + ", " + blue + ")";

        return (
            <div id='graph-area' style={{background:levelBg, color: "white"}}>
                <div id='graph-top'>
                        {
                            this.state.wholeGraph === 2 ? 
                                <div id='m-axis-labels'>
                                    <div className='m-axis-label'>Allowed</div>
                                    <div className='m-axis-label'>Length of Average</div>
                                </div>
                            : user.mode === "1" ?
                                <div id='history-axis-labels'>
                                    <div className='history-axis-label'>Weight</div>
                                </div>
                            :
                                <div id='axis-labels'>
                                    <div className='axis-label'>Allowed</div>
                                    <div className='axis-label'>Not Allowed</div>
                                    <div className='axis-label'>Weight</div>
                                </div>
                        }
                    <div id='graph-title'>Progress</div>
                    <div id='graph-top-right'>

                        <div className='toggle-section'>
                            <div className='toggle-section-header'>Graph View:</div>
                            <div className={this.state.wholeGraph === 0 ? 'toggle-option active' : 'toggle-option'} onClick={() => this.changeDisplay(0)}>History</div>
                            <div className={this.state.wholeGraph === 1 ? 'toggle-option active' : 'toggle-option'} onClick={() => this.changeDisplay(1)}>Current</div>
                            {user.mode === "1" ? <div className={this.state.wholeGraph === 2 ? 'toggle-option active' : 'toggle-option'} onClick={() => this.changeDisplay(2)}>Maintenance</div>: null}
                        </div>
                        { user.mode === "0" ? 
                            <div className='toggle-section'>
                                <div className='toggle-section-header'>Zero Weight:</div>
                                <div className={this.state.zeroIdeal ? 'toggle-option active' : 'toggle-option'} onClick={() => this.changeZero(true)}>Ideal</div>
                                <div className={this.state.zeroIdeal ? 'toggle-option' : 'toggle-option active'} onClick={() => this.changeZero(false)}>Current</div>
                            </div>
                        :null
                        }  
                    </div>
                </div>
                {this.state.wholeGraph === 0 ? <WeightHistoryGraph calcStyles={this.calcStyles} level={this.props.level} user={user} weights={this.props.weights} deleteWeight={this.props.deleteWeight} allowedIcons={this.allowedIcons} disallowedIcons={this.disallowedIcons}/>
                : this.state.wholeGraph === 1 ? <WeightLossGraph calcStyles={this.calcStyles} level={this.props.level} user={user} weights={this.props.weights} deleteWeight={this.props.deleteWeight} allowedIcons={this.allowedIcons} disallowedIcons={this.disallowedIcons}/>
                : this.state.wholeGraph === 2 ? <MModeGraph level={this.props.level} user={user} weights={this.props.weights} deleteWeight={this.props.deleteWeight}/>
                : <div>Invalid State</div>
                }
            </div>
        )
    }
}