import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const response = NextResponse.json({ message: "Logged out", success: true }, { status: 200 });
        response.cookies.set("token", "", { httpOnly: true, maxAge: 0 });
        return response;
    } catch (error:any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
        
    }
}