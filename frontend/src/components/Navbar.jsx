import React, { Component } from 'react';
import {Link} from 'react-router-dom';
import '../css/navbar.css';

export default class Navbar extends Component {
	renderLink(id, mobile, dropdown=false, dropdownContent=false){
		if (dropdown){
			return (
				<NavbarLinkDropdown
					id={id}
					mobile={mobile}
					dropdownContent={dropdownContent}
				/>
			);
		} else {
			return (
				<NavbarLink 
					id={id}
					mobile={mobile}
				/>
			);
		}
	}
	render(){
		return(
			<div id='navbar'>
				<div id='navbar-links'>
		            {this.renderLink("Login","")}
			    </div>
			    <div id='mobile-menu'>
		            {this.renderLink("Login","mobile-")}
		        </div>
		        <div className='icon-menu fa-icon'>
		            <i className='fa fa-bars fa-lg'></i>
		        </div>
	        </div>
		);
	}
}

function NavbarLink(props){
	return (
		<div>
			<Link to={'/' + props.id} id={props.mobile + props.id.toLowerCase()} className={props.mobile + "navbar-link"}>{props.id}</Link>
		</div>
	);
}
function NavbarLinkDropdown(props){
	return (
		<div>
			<Link to={'/' + props.id} id={props.mobile + props.id.toLowerCase()} className={props.mobile + "navbar-link dropdown"}>{props.id}			
				<i className='fa fa-angle-down fa-lg'></i>
			</Link>
			<div className={props.mobile+'dropdown-content'}>
				{
					props.dropdownContent.map(link => {
					return <Link to={'/' + props.id + '/' + link.replace(/ /g,'')} className={props.mobile + 'dropdown-item'} key={link}>{link}</Link>;
				})}
			</div>
		</div>
	);
}