import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';

export default class DatepickerArea extends Component {
    constructor (props) {
        super(props)
        this.state = {
            start: moment().subtract(7, "days"),
            end: moment()
        }
        this.setStart = this.setStart.bind(this);
        this.setEnd = this.setEnd.bind(this);
    }
    setStart(date) {
        if (this.state.end.isAfter(date)){
            this.setState({
                start: date
            });
        } else {
            alert("Start date must be before end date!");
        }
    }
    setEnd(date) {
        if (date.isAfter(this.state.start)){
            this.setState({
                end: date
            });
        } else {
            alert("End date must be after start date!");
        }
    }
    render(){
        return (
            <div id='datepicker-popup'>
                <div id='popup-main-area'>
                    <div className='popup-main-section'>
                        <div className='popup-main-header'>
                            From
                        </div>
                        <DatePicker selected={this.state.start} onChange={this.setStart} />
                    </div>
                    <div className='popup-main-section'>
                        <div className='popup-main-header'>
                            To
                        </div>
                        <DatePicker selected={this.state.end} onChange={this.setEnd} />
                    </div>
                </div>
                <div id='popup-done-area'>
                    <div id='popup-submit' onClick={() => this.props.setDateRange(this.state.start, this.state.end)}>Apply</div>
                    <div id='popup-cancel' onClick={() => this.props.showDatePicker(false)}>Cancel</div>
                </div>
            </div>
        )
    }
}