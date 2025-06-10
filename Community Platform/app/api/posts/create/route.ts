import { connect } from "@/dbConfig/dbConfig";
import { userByToken } from "@/helpers/userByToken";
import Post from "@/models/postModel";
import Notification from "@/models/notificationModel";
import Community from "@/models/communityModel";
import { NextRequest, NextResponse } from "next/server";

connect();

export async function POST(request: NextRequest) {
  try {
    // Get user from token
    const user = await userByToken(request);
    if (user.message) {
      return NextResponse.json({ message: user.message }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    
    // Get post data from form
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const communityId = formData.get('communityId') as string;
    
    // Validate required fields
    if (!title || !communityId) {
      return NextResponse.json({ 
        message: "Title and community ID are required", 
        success: false 
      }, { status: 400 });
    }

    // Validate community exists
    const community = await Community.findById(communityId);
    if (!community) {
      return NextResponse.json({ 
        message: "Community not found", 
        success: false 
      }, { status: 404 });
    }

    let imageUrl = null;
    // Handle image upload
    const imageFile = formData.get('file') as File;
    
    if (imageFile) {
      // Create a new FormData to send to external API
      const uploadFormData = new FormData();
      uploadFormData.append('file', imageFile);
      
      // Upload image to external service
      const uploadResponse = await fetch('https://gaadimarket.in/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image');
      }
      
      const uploadData = await uploadResponse.json();
      imageUrl = uploadData.filename;
    }

    // Create new post in MongoDB
    const newPost = new Post({
      title,
      content,
      imageUrl,
      community: communityId,
      author: user._id
    });

    await newPost.save();

    // Create notifications for community members
    const communityMembers = await Community.findById(communityId).select('members');
    if (communityMembers && communityMembers.members) {
      // Create notifications for each member except the post author
      const notificationPromises = communityMembers.members
        .filter(memberId => memberId.toString() !== user._id.toString())
        .map(memberId => {
          return new Notification({
            recipient: memberId,
            type: 'post',
            content: `New post in r/${community.name}: ${title}`,
            post: newPost._id,
            community: communityId,
            sender: user._id
          }).save();
        });

      await Promise.all(notificationPromises);
    }

    return NextResponse.json({
      success: true,
      message: "Post created successfully",
      post: newPost
    }, { status: 201 });
    
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json({
      message: error.message || "Failed to create post",
      success: false
    }, { status: 500 });
  }
}

// Disable body parser to handle FormData
export const config = {
  api: {
    bodyParser: false
  }
};
