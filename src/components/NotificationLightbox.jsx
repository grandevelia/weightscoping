import React, { Component } from 'react';
import '../css/NotificationLightbox.css';

export default class NotificationLightbox extends Component {
    render(){
        let content = this.props.content;
        return (
            <div className='lightbox-background'>
                <div className='lightbox-main'>
                    <div className='notification-title-area'>
                        <div className='notification-title'>New Notification</div>
                        <div className='notification-date'>{content.date}</div>
                    </div>
                    <div className='lightbox-body notification-body'>{content.message}</div>
                    <div id='close-lightbox' onClick={() => this.props.closeNotification()}>Close</div>
                </div>
            </div>
        )
    }
}