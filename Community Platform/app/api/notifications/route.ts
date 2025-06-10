import { connect } from "@/dbConfig/dbConfig";
import { userByToken } from "@/helpers/userByToken";
import Notification from "@/models/notificationModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const user = await userByToken(request);
    if (user.message) {
      return NextResponse.json({ message: user.message }, { status: 401 });
    }

    // Fetch notifications from MongoDB
    const notifications = await Notification.find({ recipient: user._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'username')
      .populate('post', 'title')
      .populate('community', 'name');
    
    // Transform notifications for frontend
    const formattedNotifications = notifications.map(notification => {
      const timeDiff = new Date().getTime() - new Date(notification.createdAt).getTime();
      let timeDisplay;
      
      // Format time display
      if (timeDiff < 60000) { // Less than a minute
        timeDisplay = 'Just now';
      } else if (timeDiff < 3600000) { // Less than an hour
        timeDisplay = `${Math.floor(timeDiff / 60000)} minutes ago`;
      } else if (timeDiff < 86400000) { // Less than a day
        timeDisplay = `${Math.floor(timeDiff / 3600000)} hours ago`;
      } else if (timeDiff < 604800000) { // Less than a week
        timeDisplay = `${Math.floor(timeDiff / 86400000)} days ago`;
      } else { // More than a week
        timeDisplay = new Date(notification.createdAt).toLocaleDateString();
      }
      
      return {
        id: notification._id,
        type: notification.type,
        content: notification.content,
        time: timeDisplay,
        read: notification.read,
        postId: notification.post?._id,
        communityId: notification.community?._id
      };
    });
    
    return NextResponse.json({ 
      success: true, 
      notifications: formattedNotifications 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ 
      message: error.message || "Failed to fetch notifications", 
      success: false 
    }, { status: 500 });
  }
}
