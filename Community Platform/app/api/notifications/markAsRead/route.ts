import { connect } from "@/dbConfig/dbConfig";
import { userByToken } from "@/helpers/userByToken";
import Notification from "@/models/notificationModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function PUT(request: NextRequest) {
  try {
    // Get user from token
    const user = await userByToken(request);
    if (user.message) {
      return NextResponse.json({ message: user.message }, { status: 401 });
    }

    // Get notification ID from request
    const requestBody = await request.json();
    const { id } = requestBody;
    
    if (!id) {
      return NextResponse.json({
        message: "Notification ID is required",
        success: false
      }, { status: 400 });
    }

    // Update notification in MongoDB
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipient: user._id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return NextResponse.json({
        message: "Notification not found or not authorized",
        success: false
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: "Notification marked as read"
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json({
      message: error.message || "Failed to mark notification as read",
      success: false
    }, { status: 500 });
  }
}
