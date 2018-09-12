import React, { Component } from 'react';
import { connect } from 'react-redux';
import { auth, notifications } from "../actions";
import { Link } from 'react-router-dom';
import '../css/DashboardHeader.css';

let planTitles = ["Classic","Slow Burn", "I Need More Proof"];
class DashboardHeader extends Component {
	constructor(props){
		super(props);
		props.fetchNotifications();
	}
	handleLogout(){
		this.props.logout();
	}
    render(){
		let user = this.props.auth.user;
        return (
            <div id='dashboard-nav-links'>
                <div className='nav-wrapper'>
                    <Link to="/Home/UserDashboard" className="navbar-link" id='home-link'>Reductiscope</Link>
                </div>
                <div className='nav-wrapper'>
                    <Link to="/Home/Plans" className="navbar-link" id='plan-link'>Plan: {"\"" + planTitles[user.payment_option-1] + "\""}</Link>
                </div>
                <div className='nav-wrapper'>
                    <Link to="/Home/FAQ" className="navbar-link" id='faq-link'>FAQ</Link>
                </div>
                <div className='nav-wrapper'>
                    <Link to="/Home/About" className="navbar-link" id='about-link'>About</Link>
                </div>
                <div className='nav-wrapper'></div><div className='nav-wrapper'></div>
                <div className='nav-wrapper'>
                    <Link to="/Home/UserSettings" className="navbar-link dropdown" id='settings-link'>{user.email.substring(0, user.email.indexOf('@'))}			
                        <i className='fa fa-angle-down fa-lg'></i>
                    </Link>
                    <div className='dropdown-content'>
                        <Link to="/Home/UserSettings" className='dropdown-item'>Settings</Link>
                        <div id='logout' className='dropdown-item' onClick={() => this.handleLogout()}>Logout</div>
                    </div>
                    <div id='navbar-notification-notice'>
                        {this.props.notifications.length > 0 ? <div className='notification-num'>{this.props.notifications.length}</div> : null}
                    </div>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => {
	return {
		auth: state.auth,
		notifications: state.notifications,
	}
}

const mapDispatchToProps = dispatch => {
	return {
		logout: () => {
			return dispatch(auth.logout())
        },
		fetchNotifications: () => {
			return dispatch(notifications.fetchNotifications());
		},
		updateNotification: id => {
			return dispatch(notifications.updateNotification(id));
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardHeader);