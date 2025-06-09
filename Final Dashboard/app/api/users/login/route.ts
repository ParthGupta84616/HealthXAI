import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connect();

export async function POST(request : NextRequest) {
    try {
        const reqBody = await request.json();
        const { email , password } = reqBody;
        console.log(email , password)
        const user = await User.findOne({ email });
        
        if (!user) {
            return NextResponse.json({ message: "Invalid email" }, { status: 400 });
        }

        console.log(user)

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid password" }, { status: 400 });
        }

        const payload = {
                id: user._id
        }
        const token = jwt.sign(payload, process.env.TOKEN_SECRET! , { expiresIn: "3h" });
        const response = NextResponse.json({ 
            message: "Logged in", 
            success: true,
            user: {
                id: user._id,
                email: user.email
            }
        }, { status: 200 });
        
        // Enhanced cookie settings for production
        response.cookies.set("token", token, { 
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 3, // 3 hours in seconds
            path: '/'
        });
        
        return response;
    }
    catch (error:any) {
        console.error("Login API error:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}