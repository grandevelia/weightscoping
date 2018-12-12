import React, { Component } from 'react';
import '../css/InfoLink.css';

export default class InfoLink extends Component {
    render(){
        return(
            <div className='infolink'>
                <div className='link-text'>{this.props.title}</div>
                <div className='link-hover'>
                    <div className='link-hover-title'>{this.props.title}</div>
                    <div className='link-hover-list'>
                        {
                            Array.isArray(this.props.list) ? 
                                this.props.list.map((x, i) => {
                                    return <div key={i} className='link-hover-item'>{x}</div>
                                })
                            :
                            <div className='link-hover-item'>{this.props.list}</div>
                        }
                    </div>
                </div>
            </div>
        )
    }
}