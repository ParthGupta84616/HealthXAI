import { connect } from "@/dbConfig/dbConfig";
import Community from "@/models/communityModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(request: NextRequest, { params }: { params: { name: string } }) {
  try {
    const { name } = params;

    if (!name) {
      return NextResponse.json({ 
        message: "Community name is required", 
        success: false 
      }, { status: 400 });
    }

    // Find community by name case-insensitive
    const community = await Community.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (!community) {
      return NextResponse.json({ 
        message: "Community not found", 
        success: false 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      community, 
      success: true 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error fetching community by name:", error);
    return NextResponse.json({ 
      message: error.message || "Failed to fetch community", 
      success: false 
    }, { status: 500 });
  }
}
