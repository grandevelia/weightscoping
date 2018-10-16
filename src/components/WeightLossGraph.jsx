import React, { Component } from 'react';

export default class WeightHistoryGraph extends Component{
    render(){
        return (
            <canvas id='line-graph-display' style={{width: this.props.canvasWidth}} width={this.props.canvasWidth} height={this.props.canvasHeight}></canvas>
        )
    }
}