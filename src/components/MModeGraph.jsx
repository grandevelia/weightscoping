import React, { Component } from 'react';
import { iconIndex, carbOptions, poundsToKg, interpolateDates,  weightStringFromKg, maintenanceCarbOrder } from './utils';
import DatepickerArea from './DatepickerArea';
import moment from 'moment';

export default class WeightHistoryGraph extends Component {
    allowedIcons(index, carbRanks){

		if (isNaN(index)){
			return <div className='loading-icons'>Loading...</div>
        }
        let innerIndex = carbRanks[ maintenanceCarbOrder[ index ] ];
		return (
			<div className='allowed-icons maintenance-icons'>
				<div className='icon icon-allowed' id='non-incentive-icon'>
					<div className='icon-description'>Non Incentive Food</div>
                </div>
                    {
                        //In Maintenance Mode, there are 6 levels
                        //If the user is level 6, a special case is needed to allow everything
                        //since carbRanks is either 7 or 9 items long
                        index !== 5 ? 
                            <div className='icon icon-allowed' id={iconIndex[ innerIndex ] + "-icon"}>
                                <div className='icon-description'>{carbOptions[ innerIndex ]}</div>
                            </div>
                        :
                            Array( carbRanks.length - index).fill().map( (x, j) => j + index).map(j => {
                                innerIndex = carbRanks[ maintenanceCarbOrder[ j ] ];
                                return (
                                    <div key={j} className='icon icon-allowed' id={iconIndex[innerIndex] + "-icon"}>
                                        <div className='icon-description'>{carbOptions[ innerIndex ]}</div>
                                    </div>
                                )
                            })
                    }
			</div>
		);
    }
    render(){
        let user = this.props.user;

        
        return (
            <div id='tab-y-labels'>
                {
                   /* levelMap.map(y => {
                        y = (maintenanceAvgs.length - 1) - y;
                        return (
                            <div key={y} className='y-label tab-graph-section'>
                                <div className='icons-wrap'>
                                    {this.allowedIcons(y, user.carb_ranks)}
                                </div>
                                <div className='y-label-weight'>{maintenanceAvgs[y] + " Days"}</div>
                            </div>
                        )
                    })*/
                }
            </div>
        )
    }
}