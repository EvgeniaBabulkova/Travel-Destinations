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
router.post("/api/register", async (req, res) => {
    // Our register logic starts here
   try {
        // Get user input
        const { username, password, email} = req.body;

        // Validate user input
        if (!(username && email && password )) {
            return res.status(400).send("All input are required");
        }

        // checks if user already exist
        // Validates if user exist in our database
        const oldUser = await User.findOne({ username });

        if (oldUser) {
            return res.status(409).send("Username already in use");
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
        return res.status(201).json(user);

    } catch (error) {
        console.log({ error: error.message });
    }
});

// Login
router.post("/api/login", async (req, res) => {
    try {
        // Get user input
        const { username, password } = req.body;
    
        // Validate user input
        if (!(username && password)) {
            res.status(400).send("All inputs are required");
        }
        // Validate if user exist in our database
        const user = await User.findOne({ username });
        
    
        if (user && (await bcrypt.compare(password, user.password))) {
            // Create token
            const token = jwt.sign(
                { userId: user._id, username: user.username, email: user.email },
                process.env.SECRET_KEY,
                { expiresIn: "5h" }
            );

            // create cookie
            res.cookie('jwt-TravelDestination', token, {
                httpOnly: true,
                maxAge: 5 * 60 * 60 * 1000 // 5 hours
                
            })
    
            
            return res.status(200).json(user);
        }
        return res.status(400).send("Invalid Credentials");
    } catch (error) {
        return res.status(400).json({ error: error.message })
    }    
});














// Create a new user
router.post('/api/users', async (req, res) => {
    try {

        let { username, password, email } = req.body;

        // Check if the user already exists by email or username
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        const user = new User({
            username,
            password,
            email
        });

        const savedUser = await user.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});




export default router;