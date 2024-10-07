import Router from 'express';

const router = Router();

import User from '../Model/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Get all users
router.get('/api/users', async (req, res) => {
	try {
		const users = await User.find();
		res.status(200).json(users);
	} catch (error) {
		res.status(404).json({ error: error.message });
	}
});

// Register
router.post('/api/register', async (req, res) => {
	// Our register logic starts here
	try {
		// Get user input
		const { username, password, email } = req.body;

		// Validate user input
		if (!(username && email && password)) {
			return res.status(400).send('All input are required');
		}

		// Check if username already exists
		const existingUsername = await User.findOne({ username });
		if (existingUsername) {
			return res.status(409).json({ message: 'This username is already taken, please use another one' });
		}

		// Check if email already exists
		const existingEmail = await User.findOne({ email });
		if (existingEmail) {
			return res.status(409).json({ message: 'Another account is using this email' });
		}

		//Encrypt user password
		const encryptedUserPassword = await bcrypt.hash(password, 10);

		// Create user in our database
		const user = await User.create({
			username: username.toLowerCase(), // sanitize
			email: email.toLowerCase(), // sanitize
			password: encryptedUserPassword,
		});

		// return new user
		return res.status(201).json({ message: 'User registered successfully' });
	} catch (error) {
		console.log({ error: error.message });
	}
});

// Login
router.post('/api/login', async (req, res) => {
	try {
		// Get user input
		const { username, password } = req.body;

		// Validate user input
		if (!(username && password)) {
			res.status(400).send('All inputs are required');
		}
		// Validate if user exist in our database
		const user = await User.findOne({ username });
		if (!user) {
			// If the user doesn't exist, return a specific message
			return res.status(400).json({ message: 'User does not exist' });
		}
		// Check if the password is correct
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			// If the password is wrong, return this message
			return res.status(400).json({ message: 'Wrong password' });
		}

		if (user && isPasswordValid) {
			// Create token
			const token = jwt.sign(
				{
					userId: user._id,
					username: user.username,
					email: user.email,
				},
				process.env.SECRET_KEY,
				{ expiresIn: '5h' }
			);

			const { password, ...userWithoutPassword } = user._doc;
			return res.status(200).json({ ...userWithoutPassword, token });
		}
		return res.status(400).json({ message: 'User does not exist' });
	} catch (error) {
		return res.status(400).json({ error: error.message });
	}
});

// Create a new user
router.post('/api/users', async (req, res) => {
	try {
		let { username, password, email } = req.body;

		// Check if the user already exists by email or username
		const existingUser = await User.findOne({
			$or: [{ email }, { username }],
		});
		if (existingUser) {
			return res.status(400).json({ error: 'Username or email already exists' });
		}

		const user = new User({
			username,
			password,
			email,
		});

		const savedUser = await user.save();
		res.status(201).json(savedUser);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

export default router;
