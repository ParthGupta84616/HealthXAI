import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { token } = reqBody;
        console.log(token)

        // const user = await User.findOneAndUpdate(
        //     {
        //     verificationToken : token ,
        //     verificationTokenExpire : { $gt : new Date() }
        //     }
        // )

        const user = await User.findOne({verificationToken: token, verificationTokenExpire: {$gt: Date.now()}});

        if (!user) {
            return NextResponse.json({ message: "Invalid or expired token" }, { status: 400 });
        }
        console.log(user)

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;

        await user.save();

        return NextResponse.json({ message: "Email verified", success: true },{ status: 200 });


    } catch (error:any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}