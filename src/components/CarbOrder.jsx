import React, { Component } from 'react';
import CarbsPage from './CarbsPage'

export default class CarbOrder extends Component {
    render(){
        return (
            <div id='change-carbs-area' className={this.props.className}>
                <CarbsPage 
                    updateSettings={this.props.updateSettings} 
                    cancelCarbChange={this.props.cancelCarbChange}
                    alcohol={this.props.user.alcohol} 
                    carbRanks={this.props.user.carb_ranks} 
                    intro={false} />
            </div>
        )
    }
}