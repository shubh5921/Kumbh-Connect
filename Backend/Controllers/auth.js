const User = require("../Models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { z } = require("zod");
const { sendResetPasswordMail } = require("../Utils/sendVerificationCode");

const userSchemaValidate = z.object({
    firstName: z
        .string({
            required_error: "First Name is required",
            invalid_type_error: "First Name must be a string",
        }),
    lastName: z
        .string({
            required_error: "Last Name is required",
            invalid_type_error: "Last Name must be a string",
        }).optional(),
    phoneNumber: z
        .string({required_error: "Mobile Number is required"})
        .regex(/^[6-9]\d{9}$/,{message:"Invalid Mobile Number."}),
    email: z
        .string({required_error: "Email is required"})
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,{message:"Invalid Email Address."}),
    password: z.
        string({required_error:"Password is Required."})
        .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(.{8,})$/, {message:"Password must be at least 8 characters long, include an uppercase letter and a special character"})
});

const verificationCodeValidate = z.object({
    verifyCode : z
        .string({required_error: "Verification Code is required"})
        .length(6,{message:"Verification Code must be of 6 Length"}),
    email: z
        .string({required_error: "Email is required"})
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,{message:"Invalid Email Address."}),
    password: z
        .string({required_error:"Password is Required."})
        .min(8, {message:"Password must be atleast of 8 length"})
});

const emailValidate = z.string({required_error: "Email is required"}).regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,{message:"Invalid Email Address."});

const generateToken = (userId)=>{
    try {
        const token = jwt.sign({_id:userId}, process.env.JWT_KEY, { 
            algorithm: "HS256", 
            expiresIn: '7d' 
        });


        return token;
    } catch (error) {
        console.error("Error Generating Token",error);
        return "";
    }
};

const handleSignUp = async(req,res)=>{
    try{
        const {firstName,lastName,email,phoneNumber,password} = req.body;

        const validate = userSchemaValidate.safeParse({firstName,lastName,phoneNumber,email,password});
        
        if(validate.success){

            const foundUser = await User.findOne({email:email});

            if(foundUser){
                return res.status(409).json({
                    success:false,
                    message:"User Already Exists with this email",
                })
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = bcrypt.hashSync(password,salt);

            const user = new User({
                firstName,
                lastName,
                phoneNumber,
                email,
                password:hashedPassword,
            });

            await user.save();

            return res.status(201).json({
                success: true,
                message: "User Registered Successfully",
            });
        }
        else{
            return res.status(400).json({
                success: false,
                message: validate.error.issues.map((err)=>err.message).join(", "),
            });
        }

    } catch (error) {
        console.error("Error Signing Up",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}


const handleSignIn = async(req,res)=>{
    try {
        const {email,password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Email or Password is Required",
            });
        }

        const foundUser = await User.findOne({email:email});
        
        if(foundUser){
            const checkPassword = await bcrypt.compare(password, foundUser.password);
            if(checkPassword){
                const user = {
                    firstName:foundUser.firstName,
                    lastName:foundUser.lastName,
                    email:foundUser.email,
                    role:foundUser.role,
                };
                const token = generateToken(foundUser._id);
                
                return res.status(200).json({
                    success:true,
                    message:"User logged in Successfully",
                    user,
                    token
                });

            }

            return res.status(409).json({
                success:false,
                message:"Wrong Password",
            })
        }

        return res.status(404).json({
            success:false,
            message:"User not Found",
        })

    } catch (error) {
        console.error("Error Signing Up",error);
        return res.status(500).json({
            success:false,
            message: "Internal Server Issue, Please try again!",
        })
    }
}

const handleSignOut = (req, res) => {
    try {
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        return res.status(200).json({
            success: true,
            message: "User signed out successfully",
        });
    } catch (error) {
        console.error("Error signing out", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
};

const handleSendVerificationCode = async(req,res)=>{
    try {
        const {email} = req.body;
        
        const validate = emailValidate.safeParse(email);
        if(validate.success){
            const foundUser = await User.findOne({email:email});
            if(foundUser){
                const verifyCode = Math.floor(100000+Math.random()*900000).toString();
                await sendResetPasswordMail(email, verifyCode);
                foundUser.verifyCodeExpiry = new Date(Date.now()+3600000);
                foundUser.verifyCode = verifyCode;
                await foundUser.save();
    
                return res.status(200).json({
                    success: true,
                    message: "Verification Code Sent Successfully",
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: "User Not Found",
                });
            } 
        }

        return res.status(400).json({
            success: false,
            message: validate.error.issues.map((err)=>err.message).join(", "),
        });

    } catch (error) {
        console.error("Error Sending Verification Code", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}

const handleVerifyCode = async(req,res)=>{
    try {
        const {email, verifyCode, password} = req.body;

        const validate = verificationCodeValidate.safeParse({email,verifyCode,password});
        if(validate.success){

            const foundUser = await User.findOne({email:email});
            if(!foundUser){
                return res.status(400).json({
                    success: false,
                    message: "User Not Found",
                });
            }

            const code = foundUser.verifyCode;

            const isNotExpired = new Date(foundUser.verifyCodeExpiry) > new Date();
            if(code!==verifyCode || !isNotExpired){
                return res.status(400).json({
                    success: false,
                    message: "Wrong Verification Code or Code has Expired",
                });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = bcrypt.hashSync(password,salt);

            foundUser.password=hashedPassword;
            foundUser.verifyCode=null;
            await foundUser.save();

            return res.status(200).json({
                success: true,
                message: "Password Forget Successfully.",
            });
        }

        return res.status(400).json({
            success: false,
            message: validate.error.issues.map((err)=>err.message).join(", "),
        });

    } catch (error) {
        console.error("Error Forgetting Code", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Issue, Please try again!",
        });
    }
}



module.exports = {handleSignUp, handleSignIn, handleSignOut, handleSendVerificationCode, handleVerifyCode, generateToken};