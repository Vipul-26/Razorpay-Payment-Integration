const app = require('express')();
const path = require('path');
const shortid = require('shortid');
const Razorpay = require('razorpay');
const cors = require('cors');
const bodyParser = require('body-parser');

require('dotenv').config();

app.use(cors());
app.use(bodyParser.json());

const razorpay = new Razorpay({
	key_id: process.env.RAZOR_PAY_KEY,
	key_secret: process.env.RAZOR_PAY_SECRET_KEY
});

// for logo

app.get('/my_logo.svg', (req, res) => {
	res.sendFile(path.join(__dirname, 'my_logo.svg'));
});

app.post('/verification', (req, res) => {
	// do a validation
	const secret = process.env.WEBHOOK_SECRET_KEY; // jo webhook me add krenge
	const crypto = require('crypto');

	const shasum = crypto.createHmac('sha256', secret);
	shasum.update(JSON.stringify(req.body));
	const digest = shasum.digest('hex');

	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit');
		// process it
		require('fs').writeFileSync('payment.json', JSON.stringify(req.body, null, 4));
		res.json({ status: 'ok' });
	} else {
		// pass it
		console.log('request is not legit');
		res.status(502);
	}
});

app.post('/razorpay', async (req, res) => {

	const payment_capture = 1;
	const amount = req.body.amount;
	const currency = 'INR';

	const options = {
		amount: amount * 100,
		currency,
		receipt: shortid.generate(),
		payment_capture
	};

	try {
		const response = await razorpay.orders.create(options);
		// console.log(response);
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		});
	} catch (error) {
		console.log(error)
	};
});

app.listen(1337, () => {
	console.log('Listening on 1337');
});
