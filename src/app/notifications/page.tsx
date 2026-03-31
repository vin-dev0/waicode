"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  actor: {
    name: string;
    email: string;
  };
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session) {
      fetch("/api/notifications")
        .then(res => res.json())
        .then(data => {
          setNotifications(data);
          setLoading(false);
          // Mark as read after fetching
          fetch("/api/notifications", { method: "PATCH" });
        });
    }
  }, [session, status, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const getMessage = (n: Notification) => {
    switch (n.type) {
      case "FOLLOW": return "started following you";
      case "STAR": return "starred your repository";
      case "COMMENT": return "commented on your issue/PR";
      case "PR_OPEN": return "opened a new pull request";
      default: return "performed an action";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Notifications</h1>

        <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 shadow-sm">
          {notifications.length > 0 ? (
            notifications.map((n: any) => (
              <div key={n.id} className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-indigo-50/30' : ''}`}>
                 <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                       {n.actor.name?.[0] || n.actor.email[0]}
                    </div>
                    <div>
                       <p className="text-sm text-gray-900">
                          <span className="font-bold">{n.actor.name || n.actor.email}</span>
                          {" "}{getMessage(n)}
                       </p>
                       <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                 </div>
                 {!n.isRead && (
                    <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                 )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-gray-500">
               <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
               </svg>
               <p>No notifications yet.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}