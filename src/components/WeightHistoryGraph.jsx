import React, { Component } from 'react';
import { weightStringFromKg } from './utils';
import moment from 'moment';

export default class WeightHistoryGraph extends Component {
    render(){
        let user = this.props.user;
        let level = this.props.level;

		let sectionHeight, kgPerSection, numLevels, numSections, levelMap;

		let weights = []
		let dates = [];
		let ids = [];

		//Split user weight data into arrays for easier manipulation
		Object.keys(this.props.weights).map(key => {
			dates.push(this.props.weights[key]['date_added']);
			weights.push(this.props.weights[key]['weight_kg']);
			ids.push(this.props.weights[key]['id']);
        });

		//Find x label date widths
		let dateRange = moment(dates[dates.length-1]).diff(moment(dates[0]), "days");
		let dateInc = (Math.floor(dateRange/5) + Math.ceil(dateRange/5))/2;
		let xLabels = [];
		for (let i = 0; i < 5; i ++){
			xLabels.push(moment(dates[0]).add(dateInc * i, "days").format("YYYY-MM-DD"));
		}

		let weightLen = weights.length - 1;
		let initialWeight = weights[user.starting_weight];

		let maxWeight = Math.max(...weights);
		let minWeight;
		if (this.props.zeroIdeal){
			//Ensures weight points stay on the graph
			minWeight = Math.min(...weights, user['ideal_weight_kg']);
		} else {
			minWeight = Math.min(...weights);
		}
        let weightRange = maxWeight - minWeight;
        /*
        *	Percentage height of graph for each level
        *	Total height expressed in terms of graph height
        *	Zero all weights by subtracting minWeight
        *
        *	Each section is 1/numSections of zeroed initialWeight kg
        *	In terms of percentage of graph height, each section is (initial - min) / (numSections * range)
        */

        numLevels = 8;
        numSections = numLevels + 1; 
        levelMap = Array( numLevels ).fill().map((x,i) => i);

        sectionHeight = (initialWeight - minWeight)/(numSections * weightRange);
    
        //	Divide by numLevels here since there are numSections - 1 = numLevels increments between the sections
        kgPerSection = (initialWeight - user.ideal_weight_kg)/numLevels;

		if (!this.props.zeroIdeal){
			sectionHeight = sectionHeight * numLevels/level;
			numLevels = level;
			numSections = level + 1;
			levelMap = Array( numLevels ).fill().map((x,i) => i);
        }
        let styles = this.props.calcStyles(maxWeight, minWeight, initialWeight, sectionHeight);
        return (
            <div className='graph-middle'>
                <div id='graph-middle-top'>
                    <div id={user.mode == "0" ? 'y-labels' : "history-y-labels"}> 
                        {   
                            maxWeight > initialWeight && user.mode === "0" ?
                                <div className='y-label graph-section graph-section-0' style={{...styles.firstSection}}>
                                    <div className='y-label-weight'>
                                        {weightStringFromKg(maxWeight, user['weight_units'])}
                                    </div>
                                </div>
                            :      
                                null
                        }
                        {
                            user.mode === "0" && initialWeight > user.ideal_weight_kg ?
                                levelMap.map(y => {
                                    let yWeight = initialWeight - (y + 1) * kgPerSection;
                                    let currStyle;
                                    if (y === 0){
                                        currStyle = styles.doubleSection;
                                        yWeight += kgPerSection;
                                    } else {
                                        currStyle = styles.singleSection;
                                    }
                                    return (
                                        <div key={y} className={'y-label graph-section graph-section-' + (y+1)} style={currStyle}>
                                            <div className='icons-wrap'>
                                                {y > level ? this.props.allowedIcons(y, user.carb_ranks) : null}
                                                {y > level ? this.props.disallowedIcons(y, user.carb_ranks) : null}
                                            </div>
                                            <div className='y-label-weight'>{ weightStringFromKg( yWeight , user['weight_units'] )}</div>
                                        </div>
                                    )
                                })
                            :
                                levelMap.map(y => {
                                    let yWeight = maxWeight - y * (maxWeight - minWeight)/numLevels;
                                    let currStyle = {flexBasis: 100/numLevels + "%"};
                                
                                    return (
                                        <div key={y} className={'y-label graph-section graph-section-' + (y+1)} style={currStyle}>
                                            <div className='y-label-weight' style={{alignItems: "flex-start"}}>{ weightStringFromKg( yWeight , user['weight_units'] )}</div>
                                        </div>
                                    )
                                })
                        }
                    </div>

                    <div id='graph-display'>
                        <div id='graph-display-backgrounds'>
                            <div className='graph-section graph-section-0' style={{...styles.firstSection}}></div>
                            {
                                user.mode === "0" && initialWeight > user.ideal_weight_kg ?
                                    levelMap.map(y => {
                                        let currStyle;
                                        if (y === 0){
                                            currStyle = styles.doubleSection;
                                        } else {
                                            currStyle = styles.singleSection;
                                        }
                                        return <div key={y} className={'graph-section graph-section-' + (y+1)} style={currStyle}></div>;
                                    })
                                : null
                            }
                        </div>
                        {
                            weights.map((weight, i) => {
                                return (
                                    <div className='data-point' key={i} style={{ width: 100/(weightLen + 1) + "%" }}>
                                        <div className='weight-point' style={{top: (1+ 99 * ( maxWeight - weight )/weightRange) + "%" }}>
                                            <div className='point-hover'>
                                                <div className='point-hover-section'>{weightStringFromKg(weight, user.weight_units)}</div>
                                                <div className='point-hover-section'>{dates[i]}</div>
                                                <div className='point-hover-section' id='point-delete' onClick={() => this.props.deleteWeight(ids[i])}>Delete</div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div id='x-labels'>
                    {
                        xLabels.map((x, k ) => {
                            return <div key={"xlabel"+k} className='x-label'>{ x.substring(5,10)}</div>
                        })
                    }
                </div>
            </div>
        )
    }
}