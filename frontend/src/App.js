import React from 'react';
import './App.css';

require('dotenv').config();

// Razor Pay ka script load krna
const loadScript = (src) => {
	return new Promise((resolve) => {
		const script = document.createElement('script');
		script.src = src;
		script.onload = () => {
			resolve(true);
		}
		script.onerror = () => {
			resolve(false);
		}
		document.body.appendChild(script);
	});
};

const App = () => {

	async function displayRazorpay() {
		const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');

		if (!res) {
			alert('Razorpay SDK failed to load. Are you online?')
			return;
		};

		// Sending Dynamic Data

		const data = await fetch('http://localhost:1337/razorpay', {
			method: 'POST',
			body: JSON.stringify({
				amount: "1",
			}),
			headers: {
				"Content-type": "application/json; charset=UTF-8"
			},
		})
			.then((response) =>
				response.json()
			);

		const options = {
			key: process.env.RAZOR_PAY_KEY, // configure as per dev/prod environments
			currency: data.currency,
			amount: data.amount.toString(),
			order_id: data.id,
			name: 'Merchant Name',
			description: 'Merchant Description',
			image: 'http://localhost:1337/my_logo.svg',
			handler: function (response) {
				alert(response.razorpay_payment_id);
				alert(response.razorpay_order_id);
				alert(response.razorpay_signature);
			},
		}
		const paymentObject = new window.Razorpay(options);
		paymentObject.open();
	};

	return (
		<div>
			<button className="glow-on-hover" onClick={displayRazorpay}>
				Donate Rs 1
			</button>
		</div>
	);
};

export default App;
