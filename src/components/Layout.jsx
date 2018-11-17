import React, { Component } from 'react';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';
import '../css/Layout.css';

export default class HomeLayout extends Component {
	render(){
		return(
			<div>
				<style>@import url('https://fonts.googleapis.com/css?family=Raleway');</style>
                <DashboardHeader />
					<div id='content'>
						{ this.props.children }
					</div>
				<Footer />
			</div>
		);
	}
}