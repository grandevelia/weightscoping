import React, { Component } from 'react';
import { connect } from 'react-redux';
import { auth, notifications } from "../actions";
import { Link } from 'react-router-dom';
import NotificationLightbox from './NotificationLightbox';
import '../css/DashboardHeader.css';

let planTitles = ["Classic","Slow Burn", "I Need More Proof"];
class DashboardHeader extends Component {
	constructor(props){
		super(props);
        props.fetchNotifications();
        this.state = {
            notificationLightbox : null
        }
	}
	handleLogout(){
		this.props.logout();
    }
    closeNotification(){
        this.setState({notificationLightbox:null});
    }
    showNotification(target){
        this.props.updateNotification(target.id);
        this.setState({notificationLightbox : target});
    }
    render(){
        let notifications = this.props.notifications;
        let user = this.props.auth.user;
        let unreadCount = 0;
        notifications.map(i => {
            if (!i.read){
                unreadCount ++;
            }
            return null;
        });
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
                <div className='nav-wrapper'></div>
                <div className='nav-wrapper'></div>
                <div className='nav-wrapper' id='notification-header-section'>
                    <i className="fa fa-bell" aria-hidden="true"></i>
                    <div id='navbar-notification-notice'>
                        {unreadCount > 0 ? <div className='notification-num'>{unreadCount}</div> : null}
                        <div id='notification-detail-area'>
                        {
                            notifications.map((i, index) => {
                                return (
                                    <div key={index} className='notification-detail' onClick={() => this.showNotification(i)}>
                                        <div className='notification-title-area'>
                                            {!i.read ? 
                                            <div className='notification-title'>
                                                <div className='notification-circle'></div>
                                                New Notification
                                            </div>
                                            : null }
                                            <div className='notification-date'>{i.date}</div>
                                        </div>
                                        <div className='notification-body'>
                                            {i.message.length > 40 ? i.message.substring(0, 40) + "..." : i.message}
                                        </div>
                                        <div className='notification-see-more'>
                                            View
                                        </div>
                                    </div>
                                )
                            })
                        }
                        </div>
                    </div>
                </div>
                <div className='nav-wrapper'>
                    <Link to="/Home/UserSettings" className="navbar-link dropdown" id='settings-link'>{user.email.substring(0, user.email.indexOf('@'))}			
                        <i className='fa fa-angle-down fa-lg'></i>
                    </Link>
                    <div className='dropdown-content'>
                        <Link to="/Home/UserDashboard" className="dropdown-item">Status</Link>
                        <Link to="/Home/UserSettings" className='dropdown-item'>Settings</Link>
                        <div id='logout' className='dropdown-item' onClick={() => this.handleLogout()}>Logout</div>
                    </div>
                </div>
                {
                    this.state.notificationLightbox !== null ?
                        <NotificationLightbox closeNotification={() => this.closeNotification()} content={this.state.notificationLightbox} />
                    : null
                }
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
			return dispatch(notifications.updateNotificationStatus(id));
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardHeader);