// This is a mock database implementation
// In a real app, you would use MongoDB with Mongoose or another database

const communities = [
  {
    id: "1",
    name: "Mental Health",
    description: "A community to discuss mental wellness, share resources, and support each other.",
    members: 1250,
    posts: 324,
    rules: [
      "Be respectful to others",
      "No spam or self-promotion",
      "Stay on topic",
      "Follow Reddit's content policy",
    ],
  },
  {
    id: "2",
    name: "Chronic Illness Support",
    description: "Connect with others managing chronic conditions and share your journey.",
    members: 3420,
    posts: 567,
    rules: [
      "No medical advice without credentials",
      "Be respectful to others",
      "No piracy or illegal content",
      "Use appropriate flairs for your posts",
    ],
  },
  {
    id: "3",
    name: "Nutrition & Wellness",
    description: "Learn about healthy eating, balanced diets, and nutrition tips.",
    members: 890,
    posts: 213,
    rules: [
      "Credit sources for nutritional information",
      "No spam or excessive self-promotion",
      "Be constructive in your feedback",
      "NSFW content must be tagged",
    ],
  },
  {
    id: "4",
    name: "Fitness & Rehab",
    description: "Discuss workouts, physical therapy, and recovery routines.",
    members: 1560,
    posts: 432,
    rules: [
      "Include disclaimers if sharing exercises",
      "Be respectful of physical limitations",
      "No spam or excessive self-promotion",
      "Tag posts appropriately",
    ],
  },
  {
    id: "5",
    name: "Women's Health",
    description: "A safe space to talk about reproductive health, wellness, and hormonal care.",
    members: 2045,
    posts: 389,
    rules: [
      "Respect privacy and sensitivity",
      "No medical misinformation",
      "Stay on topic",
      "No judgment or hate speech",
    ],
  },
  {
    id: "6",
    name: "Healthcare Careers",
    description: "For students and professionals in healthcare to share insights and guidance.",
    members: 1780,
    posts: 278,
    rules: [
      "No sharing confidential patient info",
      "Be professional and courteous",
      "No spam or self-promotion",
      "Follow HIPAA and content policies",
    ],
  },
];


const posts = [
  {
    id: "1",
    title: "Welcome to our new Community App!",
    content:
      "This is a Reddit-style community app where you can create and join communities, post content, and interact with other users.",
    communityId: "1",
    community: "Announcements",
    author: "admin",
    votes: 42,
    comments: 7,
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    title: "How to create your first community",
    content:
      "Click on 'Create Community' in the sidebar, fill out the form with your community details, and you're good to go!",
    communityId: "1",
    community: "Help",
    author: "moderator",
    votes: 28,
    comments: 5,
    createdAt: "5 hours ago",
  },
  {
    id: "3",
    title: "Share your favorite programming tips",
    content: "What are some programming tips or tricks that have saved you hours of debugging?",
    communityId: "1",
    community: "Programming",
    author: "coder123",
    votes: 15,
    comments: 12,
    createdAt: "1 day ago",
  },
]

const users = [
  {
    id: "1",
    username: "admin",
    joinedCommunities: ["1", "2", "3", "4"],
  },
  {
    id: "2",
    username: "user123",
    joinedCommunities: ["1", "3"],
  },
]

const notifications = [
  {
    id: "1",
    userId: "1",
    type: "like",
    content: "user123 liked your post in r/Programming",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: "2",
    userId: "1",
    type: "comment",
    content: "user456 commented on your post: 'This is really helpful, thanks!'",
    time: "1 hour ago",
    read: false,
  },
  {
    id: "3",
    userId: "1",
    type: "join",
    content: "user789 joined your community r/Photography",
    time: "3 hours ago",
    read: true,
  },
]

// Community functions
export async function getCommunities() {
  return communities
}

export async function getCommunityById(id) {
  return communities.find((community) => community.id === id)
}

export async function createCommunity(communityData) {
  const newCommunity = {
    id: String(communities.length + 1),
    ...communityData,
    members: 1,
    posts: 0,
    rules: communityData.rules || [],
  }

  communities.push(newCommunity)
  return newCommunity
}

// Post functions
export async function getPosts() {
  return posts
}

export async function getPostById(id) {
  return posts.find((post) => post.id === id)
}

export async function createPost(postData) {
  // Generate a unique ID for the post
  const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create the post object with the provided data
  const post = {
    id: postId,
    title: postData.title,
    content: postData.content,
    communityId: postData.communityId,
    userId: postData.userId,
    imageUrl: postData.imageUrl || null,
    createdAt: postData.createdAt || new Date(),
    votes: 0,
    comments: []
  };
  
  // Add the post to the posts array
  posts.push(post);
  
  // Create a notification for the community members about the new post
  const community = communities.find(c => c.id === postData.communityId);
  if (community) {
    const user = users.find(u => u.id === postData.userId);
    const username = user ? user.username : 'A user';
    
    // Get all users who joined this community
    users.forEach(u => {
      // Don't notify the post creator
      if (u.id !== postData.userId && u.joinedCommunities && u.joinedCommunities.includes(postData.communityId)) {
        notifications.push({
          id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: u.id,
          type: 'post',
          content: `${username} posted in r/${community.name}: ${postData.title}`,
          time: new Date().toISOString(),
          read: false,
          postId: postId,
          communityId: postData.communityId
        });
      }
    });
  }
  
  return post;
}

// User functions
export async function getUserById(id) {
  return users.find((user) => user.id === id)
}

export async function joinCommunity(userId, communityId) {
  const user = users.find((user) => user.id === userId)
  if (user && !user.joinedCommunities.includes(communityId)) {
    user.joinedCommunities.push(communityId)
    return true
  }
  return false
}

export async function leaveCommunity(userId, communityId) {
  const user = users.find((user) => user.id === userId)
  if (user) {
    user.joinedCommunities = user.joinedCommunities.filter((id) => id !== communityId)
    return true
  }
  return false
}

// Notification functions
export async function getNotificationsByUserId(userId) {
  return notifications.filter((notification) => notification.userId === userId)
}

export async function markNotificationAsRead(id) {
  const notification = notifications.find((notification) => notification.id === id)
  if (notification) {
    notification.read = true
    return true
  }
  return false
}

export async function markAllNotificationsAsRead(userId) {
  notifications.forEach((notification) => {
    if (notification.userId === userId) {
      notification.read = true
    }
  })
  return true
}
