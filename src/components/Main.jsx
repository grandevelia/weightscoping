import React, { Component } from 'react';
import DashboardHeader from './DashboardHeader';
export default class Main extends Component{
    render(){
        return (
			<div className='content'>
                    <DashboardHeader></DashboardHeader>
                    Main
            </div>
        )
    }
}