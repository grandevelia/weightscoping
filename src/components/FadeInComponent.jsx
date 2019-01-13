
import React, { Component } from 'react';
import '../css/FadeInComponent.css';

class FadeInComponent extends Component{
    state = {
        fadeOut: 'start'
    }
    componentDidMount () {
        this.timeoutId = setTimeout(() => {
            this.props.resetSubmissionAnimation();
        }, 1000);
        this.startFadeIn = setTimeout(function(){
            this.setState({fadeOut: false});
        }.bind(this), 1);
        this.startFadeOut = setTimeout(function(){
            this.setState({fadeOut: true});
        }.bind(this), 500);
    }

    render(){
        return (
            <div className={
                this.state.fadeOut === 'start' ? 'fade-component'
                : this.state.fadeOut === false ? 'show fade-component' 
                : 'fade fade-component'
            } style={this.props.style}>
                <div className='saved-text'>Saved!</div>
                <div id='check-container'>
                    <i className='fa fa-check' />
                </div>
            </div>
        );
    }
}

export default FadeInComponent;