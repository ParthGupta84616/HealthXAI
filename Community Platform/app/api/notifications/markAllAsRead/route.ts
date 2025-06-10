import { NextRequest, NextResponse } from "next/server";
import { userByToken } from "@/helpers/userByToken";
import { connect } from "@/dbConfig/dbConfig";
import Notification from "@/models/notificationModel";

connect();

export async function PUT(request: NextRequest) {
  try {
    // Get user from token
    const user = await userByToken(request);
    if (user.message) {
      return NextResponse.json({ message: user.message }, { status: 401 });
    }

    // Mark all notifications as read in MongoDB
    const result = await Notification.updateMany(
      { recipient: user._id, read: false },
      { read: true }
    );
    
    return NextResponse.json({
      success: true,
      message: "All notifications marked as read",
      updatedCount: result.modifiedCount
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error marking all notifications as read:", error);
    return NextResponse.json({
      message: error.message || "Failed to mark notifications as read",
      success: false
    }, { status: 500 });
  }
}
