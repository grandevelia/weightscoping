import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import paypal from 'paypal-checkout';

let PayPalButton = paypal.Button.driver('react', { React, ReactDOM });

export default class PaypalButton extends Component {
   constructor() {
      super();
      this.state = {
         env: 'sandbox',
         client: {
            sandbox: 'AR8y52YtGCj1faskzMSebDLCNO_KRFZ7ZUiSbpFUWwLl6XZqxAsKl2oNToD0NEH_ivp47ErFlhZ8FFH3',
            production: 'AbksGjrbt7HddUw1s_SYlzlQFRr0DovIU4jI1odtJZagBGXifaGPhXiZBTu-opCTK2S2EN4-lk1cd22w',
         },
         commit: true
      };
   }
   payment(data, actions) {
      let paymentAmount = this.props.paymentAmount;
      return actions.payment.create({
         transactions: [
            {
               amount: { total: paymentAmount, currency: 'USD' }
            }
         ]
      });
   }
   onAuthorize(data, actions) {
      return actions.payment.execute().then((paymentData) => {
         if (paymentData.state === "approved"){
            let amountPaid = parseInt(paymentData.transactions[0].amount.total,10);
            this.props.updateSettings("amount_paid", amountPaid);
         }
      });
   }
   render() {
      return (
         <PayPalButton
            commit={ this.state.commit }
            env={ this.state.env }
            client={ this.state.client }
            payment={ (data, actions) => this.payment(data, actions) }
            onAuthorize={ (data, actions) => this.onAuthorize(data, actions) }
         />
      );
   }
}

