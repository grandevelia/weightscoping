import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../css/Footer.css';
export default class Footer extends Component {
	render(){
		return(
			<div id='footer'>
				<Link to='TermsOfUse' className='footer-link'>Terms of Use</Link>
				<Link to='Contact' className='footer-link'>Contact</Link>
				<Link to='Privacy' className='footer-link'>Privacy</Link>
			</div>
		)
	}
}