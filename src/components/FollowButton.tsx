"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface FollowButtonProps {
  username: string;
}

export function FollowButton({ username }: FollowButtonProps) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const isMe = session?.user?.name === username;

  useEffect(() => {
    fetch(`/api/users/${username}/follow`)
      .then((res) => res.json())
      .then((data) => {
        setIsFollowing(data.isFollowing);
        setCounts({ followers: data.followersCount, following: data.followingCount });
        setLoading(false);
      });
  }, [username, session]);

  const handleFollow = async () => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const method = isFollowing ? "DELETE" : "POST";
    const res = await fetch(`/api/users/${username}/follow`, { method });

    if (res.ok) {
      setIsFollowing(!isFollowing);
      setCounts({
        ...counts,
        followers: isFollowing ? counts.followers - 1 : counts.followers + 1
      });
    }
  };

  if (loading) {
    return <div className="h-9 w-full bg-gray-100 animate-pulse rounded-md"></div>;
  }

  if (isMe) {
    return (
      <div className="flex items-center space-x-4 text-sm text-gray-600">
         <span><strong>{counts.followers}</strong> followers</span>
         <span><strong>{counts.following}</strong> following</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleFollow}
        className={`w-full py-1.5 text-sm font-medium rounded border transition-all ${
          isFollowing
            ? "bg-gray-100 text-gray-900 border-gray-300 hover:bg-gray-200"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
        }`}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </button>
      <div className="flex items-center text-sm text-gray-600">
         <span className="mr-4"><strong>{counts.followers}</strong> followers</span>
         <span><strong>{counts.following}</strong> following</span>
      </div>
    </div>
  );
}