import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { userByToken } from "@/helpers/userByToken";

connect()

export async function POST(request: NextRequest) {
    try {
        const user = await userByToken(request);
        if (user.message) {
            return NextResponse.json({ message: user.message }, { status: 401 });
        }
        return NextResponse.json({ user, success: true }, { status: 200 });
        
    } catch (error:any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
        
    }
}