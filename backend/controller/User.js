const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt=require("jsonwebtoken")

const UserSignup = async (req, res) => {
    try {
        console.log("Signup request received:", { email: req.body.email });
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
                details: {
                    email: !email ? "Email is required" : null,
                    password: !password ? "Password is required" : null
                }
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Invalid email format",
                details: { email: "Please enter a valid email address" }
            });
        }

        // Check existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                error: "Email already exists",
                details: { email: "This email is already registered" }
            });
        }

        // Create new user
        const hashpwd = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            email,
            password: hashpwd
        });

        // Generate token
        const token = jwt.sign(
            { email, id: newUser._id },
            process.env.SECRET_KEY,
            { expiresIn: '24h' }
        );

        return res.status(201).json({
            message: "User created successfully",
            token,
            user: {
                _id: newUser._id,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            error: "Internal server error",
            details: { message: error.message }
        });
    }
};

const Userlogin=async(req,res)=>{
    try {
        console.log("Login request received:", req.body);
        const {email,password}=req.body
        if(!email || !password){
            console.log("Missing email or password");
            return res.status(400).json({message: "Email and password is required"})
        }
        const user = await User.findOne({email})
        console.log("User found in database:", user ? user.email : "No user found");
        if(!user){
            return res.status(400).json({error:"User not found"})
        }
        const isPasswordValid = await bcrypt.compare(password, user.password)
        console.log("Password valid:", isPasswordValid);
        if(!isPasswordValid){
            return res.status(400).json({error:"Invalid password"})
        }
        const token=jwt.sign({email,id:user._id},process.env.SECRET_KEY)
        return res.status(200).json({token,user})
    } catch (error) {
        console.error("Login error:", error)
        return res.status(500).json({error: "Internal server error"})
    }
}

const getUser=async(req,res)=>{
    try {
        const {id} = req.params
        const user = await User.findById(id).select('-password')
        if(!user){
            return res.status(404).json({error:"User not found"})
        }
        return res.status(200).json({user})
    } catch (error) {
        console.error("Get user error:", error)
        return res.status(500).json({error: "Internal server error"})
    }
}

module.exports={UserSignup,Userlogin,getUser}