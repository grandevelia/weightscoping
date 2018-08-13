import React , { Component } from 'react';
import PaypalButton from './PaypalButton';

class PaypalComponent extends Component {
  render() {
    const onSuccess = (payment) =>
      console.log('Successful payment!', payment);

    const onError = (error) =>
      console.log('Erroneous payment OR failed to load script!', error);

    const onCancel = (data) =>
      console.log('Cancelled payment!', data);

    return (
      <div>
        <PaypalButton/>
      </div>
    );
  }
}

export default PaypalComponent;
