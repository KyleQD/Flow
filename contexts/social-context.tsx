import { createContext, useContext, useState, ReactNode } from 'react';

interface SocialContextType {
  followers: number;
  following: number;
  posts: number;
  addFollower: () => void;
  removeFollower: () => void;
  addPost: () => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

export function SocialProvider({ children }: { children: ReactNode }) {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [posts, setPosts] = useState(0);

  const addFollower = () => setFollowers(prev => prev + 1);
  const removeFollower = () => setFollowers(prev => Math.max(0, prev - 1));
  const addPost = () => setPosts(prev => prev + 1);

  return (
    <SocialContext.Provider
      value={{
        followers,
        following,
        posts,
        addFollower,
        removeFollower,
        addPost,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const context = useContext(SocialContext);
  if (context === undefined) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
} 