import React, { Component } from 'react';

import { ItemTypes } from './Constants';
import { DropTarget } from 'react-dnd';

import PropTypes from 'prop-types';

const optionTarget = {
  drop(props, monitor) {
    props.moveOption(monitor.getItem().optionId, props.id);
  }
};

function collect(connect, monitor) {
  return {
    connectDropTarget: connect.dropTarget(),
    isOver: monitor.isOver()
  };
}

class DraggableTarget extends Component {
  render() {
    const id = this.props.id;
    const connectDropTarget = this.props.connectDropTarget;
    const isOver = this.props.isOver;
    return connectDropTarget(
      <div id={id} className={'selection-number' + (isOver ? ' target-hover-child' : '')}>
        {this.props.children}
      </div>
    );
  }
}

DraggableTarget.propTypes = {
  id: PropTypes.number.isRequired,
  connectDropTarget: PropTypes.func.isRequired,
  isOver: PropTypes.bool.isRequired
}

export default DropTarget(ItemTypes.OPTION, optionTarget, collect)(DraggableTarget);