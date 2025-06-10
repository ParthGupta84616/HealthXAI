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
        const response =  NextResponse.json({ message: "Logged in", success : true }, { status: 200 });
        response.cookies.set("token", token, { httpOnly: true });
        
        return response;
    }
    catch (error:any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}