import React, { Component } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { Link } from 'react-router-dom';
import { logo } from '../css/images/logo.svg'
import "../css/Layout.css";
export default class Layout extends Component {
	render(){
		return(
			<div className='content'>
				<style>
					@import url('https://fonts.googleapis.com/css?family=Raleway');
				</style>
				<div className="top-wrap">
					<Navbar></Navbar>
					<header className="app-header">
			          <img src={logo} className="app-logo" alt="logo" />
			          <h1 className="app-title">Your Love of Food Can Make You Thin</h1>
			        </header>
			    </div>
				<div id='main-area'>
					<div id='navigation-area'>
						<div id='nav-container'>
							<NavItem current={this.props.pageName} pageName="/Intro/FirstPage" icon={0} active={this.props.intro.alcohol !== null}/>
							<NavItem current={this.props.pageName} pageName="/Intro/SecondPage" icon={1} active={this.props.intro.carbRanks.indexOf(null) < 0}/>
							<NavItem current={this.props.pageName} pageName="/Intro/ThirdPage/" icon={2} active={this.props.intro.heightInches !== null}/>
							<NavItem current={this.props.pageName} pageName="/Intro/FourthPage" icon={3} active={this.props.intro.weightKg !== null}/>
							<NavItem current={this.props.pageName} pageName="/Intro/FifthPage" icon={4} active={this.props.email !== null}/>
							<NavItem current={this.props.pageName} pageName="/Intro/SixthPage" icon={5} active={this.props.intro.paymentOption !== null}/>
						</div>
					</div>
					<div id='page-area'>
						{ this.props.children }
					</div>
				</div>
				<Footer></Footer>
			</div>
		);
	}
}

let icons=["beer","birthday-cake","clipboard","balance-scale","envelope","check"];
class NavItem extends Component {
	render(){
		return (
			<div className={
				this.props.active ? 'nav-item complete'
				: this.props.current === this.props.pageName ? 'nav-item current'
				: 'nav-item incomplete'
			}>
				{this.props.active ? 
					<Link to={this.props.pageName}>
						<i className={"fa fa-" + icons[this.props.icon]} />
					</Link> : <i className={"fa fa-" + icons[this.props.icon]} />
				}
			</div>
		)
	}
}