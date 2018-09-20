import React, { Component } from 'react';
import '../css/Projection.css';

export default class Projection extends Component {
    render(){
        let xLabels = [];
        let user = this.props.user;
        return (
            <div id='graph-middle'>
                {
                    user.mode === "0" ?
                        <div id='graph-middle-top'>
                            <div id='m-y-labels'>

                            </div>
                            <div id='m-graph-display'>
                                
                            </div>
                        </div>
                    : user.mode === "1" ?
                        <div id='graph-middle-top'>
                            <div id='m-y-labels'>

                            </div>
                            <div id='m-graph-display'>
                               
                            </div>
                        </div>
                    : null
                }
                <div id='x-labels'>
                    {
                        xLabels.map((x, k ) => {
                            return <div key={"xlabel"+k} className='x-label'>{ x.substring(5,10)}</div>
                        })
                    }
                </div>
            </div>
        )
    }
}