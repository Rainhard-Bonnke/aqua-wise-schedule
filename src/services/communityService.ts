
// Community service for farmer interactions and knowledge sharing
export interface CommunityPost {
  id: string;
  farmerId: string;
  farmerName: string;
  location: string;
  title: string;
  content: string;
  category: 'tips' | 'problems' | 'success' | 'question' | 'weather';
  tags: string[];
  likes: number;
  comments: Comment[];
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  farmerId: string;
  farmerName: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface FarmerProfile {
  id: string;
  name: string;
  location: string;
  experience: string;
  specialties: string[];
  farmSize: number;
  crops: string[];
  joinedDate: string;
  reputation: number;
  postsCount: number;
}

class CommunityService {
  private storagePrefix = 'aquawise_community_';

  // Posts management
  createPost(post: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'createdAt' | 'updatedAt'>): string {
    const newPost: CommunityPost = {
      ...post,
      id: Date.now().toString(),
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const posts = this.getAllPosts();
    posts.unshift(newPost);
    localStorage.setItem(`${this.storagePrefix}posts`, JSON.stringify(posts));
    
    return newPost.id;
  }

  getAllPosts(category?: string, location?: string): CommunityPost[] {
    const postsData = localStorage.getItem(`${this.storagePrefix}posts`);
    let posts: CommunityPost[] = postsData ? JSON.parse(postsData) : this.getDefaultPosts();

    if (category && category !== 'all') {
      posts = posts.filter(post => post.category === category);
    }

    if (location && location !== 'all') {
      posts = posts.filter(post => post.location === location);
    }

    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getPost(postId: string): CommunityPost | null {
    const posts = this.getAllPosts();
    return posts.find(post => post.id === postId) || null;
  }

  likePost(postId: string): void {
    const posts = this.getAllPosts();
    const postIndex = posts.findIndex(post => post.id === postId);
    
    if (postIndex >= 0) {
      posts[postIndex].likes++;
      posts[postIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(`${this.storagePrefix}posts`, JSON.stringify(posts));
    }
  }

  addComment(postId: string, comment: Omit<Comment, 'id' | 'likes' | 'createdAt'>): void {
    const posts = this.getAllPosts();
    const postIndex = posts.findIndex(post => post.id === postId);
    
    if (postIndex >= 0) {
      const newComment: Comment = {
        ...comment,
        id: Date.now().toString(),
        likes: 0,
        createdAt: new Date().toISOString()
      };

      posts[postIndex].comments.push(newComment);
      posts[postIndex].updatedAt = new Date().toISOString();
      localStorage.setItem(`${this.storagePrefix}posts`, JSON.stringify(posts));
    }
  }

  // Search functionality
  searchPosts(query: string): CommunityPost[] {
    const posts = this.getAllPosts();
    const searchTerm = query.toLowerCase();

    return posts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      post.farmerName.toLowerCase().includes(searchTerm)
    );
  }

  // Farmer profiles
  getFarmerProfile(farmerId: string): FarmerProfile | null {
    const profilesData = localStorage.getItem(`${this.storagePrefix}profiles`);
    const profiles: FarmerProfile[] = profilesData ? JSON.parse(profilesData) : [];
    return profiles.find(profile => profile.id === farmerId) || null;
  }

  updateFarmerProfile(profile: FarmerProfile): void {
    const profilesData = localStorage.getItem(`${this.storagePrefix}profiles`);
    const profiles: FarmerProfile[] = profilesData ? JSON.parse(profilesData) : [];
    
    const profileIndex = profiles.findIndex(p => p.id === profile.id);
    if (profileIndex >= 0) {
      profiles[profileIndex] = profile;
    } else {
      profiles.push(profile);
    }
    
    localStorage.setItem(`${this.storagePrefix}profiles`, JSON.stringify(profiles));
  }

  // Default sample posts
  private getDefaultPosts(): CommunityPost[] {
    const defaultPosts: CommunityPost[] = [
      {
        id: '1',
        farmerId: 'farmer1',
        farmerName: 'John Ochieng',
        location: 'Rachuonyo North',
        title: 'Great Success with Drip Irrigation on Tomatoes',
        content: 'After switching to drip irrigation for my tomato farm, I have seen a 40% increase in yield and 60% reduction in water usage. The key is maintaining consistent soil moisture levels.',
        category: 'success',
        tags: ['tomatoes', 'drip irrigation', 'water saving'],
        likes: 15,
        comments: [
          {
            id: 'c1',
            farmerId: 'farmer2',
            farmerName: 'Mary Akinyi',
            content: 'This is very encouraging! What brand of drip system did you use?',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            likes: 3
          }
        ],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        farmerId: 'farmer2',
        farmerName: 'Mary Akinyi',
        location: 'Homa Bay Town',
        title: 'Need Advice: Brown Spots on Maize Leaves',
        content: 'I am noticing brown spots appearing on my maize leaves. The plants are about 6 weeks old. Could this be related to my irrigation schedule or is it a disease?',
        category: 'problems',
        tags: ['maize', 'plant disease', 'irrigation'],
        likes: 8,
        comments: [
          {
            id: 'c2',
            farmerId: 'farmer3',
            farmerName: 'Peter Ouma',
            content: 'This could be leaf blight. Try reducing watering frequency and apply fungicide.',
            createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            likes: 5
          },
          {
            id: 'c3',
            farmerId: 'extension1',
            farmerName: 'Dr. Grace Wanjiku (Extension Officer)',
            content: 'I recommend soil testing first. Overwatering can create conditions for fungal diseases. Contact me for a farm visit.',
            createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            likes: 12
          }
        ],
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        farmerId: 'farmer3',
        farmerName: 'Peter Ouma',
        location: 'Ndhiwa',
        title: 'Weather Update: Heavy Rains Expected This Week',
        content: 'According to local weather reports, we should expect heavy rains from Wednesday to Friday. Consider adjusting your irrigation schedules accordingly.',
        category: 'weather',
        tags: ['weather', 'rain', 'irrigation schedule'],
        likes: 22,
        comments: [],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];

    localStorage.setItem(`${this.storagePrefix}posts`, JSON.stringify(defaultPosts));
    return defaultPosts;
  }

  // Get trending topics
  getTrendingTopics(): string[] {
    const posts = this.getAllPosts();
    const tagCount: Record<string, number> = {};

    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCount[tag] = (tagCount[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  }
}

export const communityService = new CommunityService();
