import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

connect()

export async function userByToken(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value || "";
        if (!token) {
            return { message: "No token, authorization denied" }
        }

        const decoded:any = jwt.verify(token, process.env.TOKEN_SECRET!);
        
        const user = await User.findById(decoded.id).select("-password");
        if (!user) {
            return { message: "User not found" }
        }
        return user;

    } catch (error:any) {
        return { message: error.message };
    }
}