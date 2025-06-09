
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, MessageCircle, Heart, Search, Plus, TrendingUp, 
  MapPin, Calendar, Tag, ThumbsUp, MessageSquare 
} from "lucide-react";
import { communityService, CommunityPost } from "@/services/communityService";
import { locations } from "@/components/farmer-registration/constants";
import { useToast } from "@/hooks/use-toast";

const CommunitySharing = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingTopics, setTrendingTopics] = useState<string[]>([]);

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: '',
    location: '',
    tags: ''
  });

  const [newComment, setNewComment] = useState<Record<string, string>>({});

  const categories = [
    { value: 'all', label: 'All Posts', icon: '📝' },
    { value: 'tips', label: 'Tips & Advice', icon: '💡' },
    { value: 'problems', label: 'Problems & Help', icon: '🆘' },
    { value: 'success', label: 'Success Stories', icon: '🏆' },
    { value: 'question', label: 'Questions', icon: '❓' },
    { value: 'weather', label: 'Weather Updates', icon: '🌤️' }
  ];

  useEffect(() => {
    loadCommunityData();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedCategory, selectedLocation, searchQuery]);

  const loadCommunityData = () => {
    setLoading(true);
    const communityPosts = communityService.getAllPosts();
    const trending = communityService.getTrendingTopics();
    
    setPosts(communityPosts);
    setTrendingTopics(trending);
    setLoading(false);
  };

  const filterPosts = () => {
    let filtered = posts;

    if (searchQuery) {
      filtered = communityService.searchPosts(searchQuery);
    } else {
      filtered = communityService.getAllPosts(selectedCategory, selectedLocation);
    }

    setFilteredPosts(filtered);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.title || !newPost.content || !newPost.category || !newPost.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const tags = newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const postData = {
      farmerId: 'current_farmer', // This would come from auth
      farmerName: 'Current Farmer', // This would come from auth
      title: newPost.title,
      content: newPost.content,
      category: newPost.category as any,
      location: newPost.location,
      tags
    };

    communityService.createPost(postData);
    loadCommunityData();

    setNewPost({
      title: '',
      content: '',
      category: '',
      location: '',
      tags: ''
    });
    setShowCreatePost(false);

    toast({
      title: "Post Created",
      description: "Your post has been shared with the community.",
    });
  };

  const handleLikePost = (postId: string) => {
    communityService.likePost(postId);
    loadCommunityData();
  };

  const handleAddComment = (postId: string) => {
    const commentContent = newComment[postId];
    if (!commentContent?.trim()) return;

    communityService.addComment(postId, {
      farmerId: 'current_farmer',
      farmerName: 'Current Farmer',
      content: commentContent.trim()
    });

    setNewComment(prev => ({ ...prev, [postId]: '' }));
    loadCommunityData();

    toast({
      title: "Comment Added",
      description: "Your comment has been posted.",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <Users className="h-8 w-8 animate-pulse text-green-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Community Sharing
              </CardTitle>
              <CardDescription>Connect with fellow farmers and share knowledge</CardDescription>
            </div>
            <Button onClick={() => setShowCreatePost(!showCreatePost)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="posts" className="space-y-4">
            <TabsList>
              <TabsTrigger value="posts">Community Posts</TabsTrigger>
              <TabsTrigger value="trending">Trending Topics</TabsTrigger>
            </TabsList>

            {/* Posts Tab */}
            <TabsContent value="posts" className="space-y-4">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Search Posts</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select onValueChange={setSelectedCategory} defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center">
                            <span className="mr-2">{category.icon}</span>
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select onValueChange={setSelectedLocation} defaultValue="all">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" onClick={() => {
                    setSelectedCategory('all');
                    setSelectedLocation('all');
                    setSearchQuery('');
                  }}>
                    Clear Filters
                  </Button>
                </div>
              </div>

              {/* Create Post Form */}
              {showCreatePost && (
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle>Share with the Community</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleCreatePost} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Category *</Label>
                          <Select onValueChange={(value) => setNewPost(prev => ({...prev, category: value}))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.slice(1).map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  <div className="flex items-center">
                                    <span className="mr-2">{category.icon}</span>
                                    {category.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Location *</Label>
                          <Select onValueChange={(value) => setNewPost(prev => ({...prev, location: value}))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              {locations.map((location) => (
                                <SelectItem key={location} value={location}>
                                  {location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Title *</Label>
                        <Input
                          value={newPost.title}
                          onChange={(e) => setNewPost(prev => ({...prev, title: e.target.value}))}
                          placeholder="What would you like to share?"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Content *</Label>
                        <Textarea
                          value={newPost.content}
                          onChange={(e) => setNewPost(prev => ({...prev, content: e.target.value}))}
                          placeholder="Share your experience, ask a question, or provide advice..."
                          rows={4}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tags (comma-separated)</Label>
                        <Input
                          value={newPost.tags}
                          onChange={(e) => setNewPost(prev => ({...prev, tags: e.target.value}))}
                          placeholder="e.g. tomatoes, drip irrigation, water saving"
                        />
                      </div>

                      <div className="flex space-x-3">
                        <Button type="submit">Share Post</Button>
                        <Button type="button" variant="outline" onClick={() => setShowCreatePost(false)}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {/* Posts List */}
              <div className="space-y-4">
                {filteredPosts.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Found</h3>
                    <p className="text-gray-600">
                      {searchQuery ? 'Try different search terms' : 'Be the first to share with the community'}
                    </p>
                  </div>
                ) : (
                  filteredPosts.map((post) => {
                    const categoryInfo = categories.find(c => c.value === post.category);
                    
                    return (
                      <Card key={post.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* Post Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="bg-green-100 p-2 rounded-full">
                                  <Users className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{post.farmerName}</h4>
                                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <MapPin className="h-3 w-3" />
                                    <span>{post.location}</span>
                                    <span>•</span>
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatTimeAgo(post.createdAt)}</span>
                                  </div>
                                </div>
                              </div>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                <span className="mr-1">{categoryInfo?.icon}</span>
                                {categoryInfo?.label}
                              </Badge>
                            </div>

                            {/* Post Content */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                              <p className="text-gray-700">{post.content}</p>
                            </div>

                            {/* Tags */}
                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Post Actions */}
                            <div className="flex items-center space-x-4 pt-2 border-t">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLikePost(post.id)}
                                className="text-gray-600 hover:text-red-600"
                              >
                                <Heart className="h-4 w-4 mr-1" />
                                {post.likes}
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-600">
                                <MessageSquare className="h-4 w-4 mr-1" />
                                {post.comments.length}
                              </Button>
                            </div>

                            {/* Comments */}
                            {post.comments.length > 0 && (
                              <div className="space-y-3 pl-4 border-l-2 border-gray-100">
                                {post.comments.map((comment) => (
                                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-sm text-gray-900">
                                        {comment.farmerName}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {formatTimeAgo(comment.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm">{comment.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Comment */}
                            <div className="flex space-x-2">
                              <Input
                                placeholder="Add a comment..."
                                value={newComment[post.id] || ''}
                                onChange={(e) => setNewComment(prev => ({
                                  ...prev,
                                  [post.id]: e.target.value
                                }))}
                                className="flex-1"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleAddComment(post.id)}
                                disabled={!newComment[post.id]?.trim()}
                              >
                                Comment
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

            {/* Trending Tab */}
            <TabsContent value="trending">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-orange-600" />
                    Trending Topics
                  </CardTitle>
                  <CardDescription>Popular discussion topics in the community</CardDescription>
                </CardHeader>
                <CardContent>
                  {trendingTopics.length === 0 ? (
                    <div className="text-center py-8">
                      <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trending Topics</h3>
                      <p className="text-gray-600">Topics will appear here as the community grows</p>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-3">
                      {trendingTopics.map((topic, index) => (
                        <Badge
                          key={topic}
                          variant="outline"
                          className="text-sm px-3 py-2 cursor-pointer hover:bg-green-50"
                          onClick={() => setSearchQuery(topic)}
                        >
                          <span className="mr-2">#{index + 1}</span>
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunitySharing;
