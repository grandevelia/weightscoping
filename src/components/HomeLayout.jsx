import React, { Component } from 'react';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';
export default class HomeLayout extends Component {
	render(){
		return(
			<div className='content'>
				<style>@import url('https://fonts.googleapis.com/css?family=Raleway');</style>
                <DashboardHeader />
					<div id='dashboard-content'>
						{ this.props.children }
					</div>
				<Footer />
			</div>
		);
	}
}