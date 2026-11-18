"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, ArrowRight, RefreshCw, MessageSquare } from "lucide-react";
import { formatDateTime, timeAgo } from "@/lib/utils";

interface NotificationItem {
  id: string;
  type: string;
  channel: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  requestId: string | null;
  donorResponseId: string | null;
}

export default function NotificationsCenterPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=50");
      const json = await res.json();
      if (json.success) {
        setNotifications(json.notifications || []);
        setUnreadCount(json.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      );
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const markSingleRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark single read:", err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-950">Notifications Center</h1>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount} unread</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Emergency requests, donor responses, and hospital coordination alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={markAllRead}
            className="text-xs gap-1.5 self-start"
          >
            <Check className="w-3.5 h-3.5" /> Mark All as Read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-red-600" />
            <p className="text-xs">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center text-gray-500 border-gray-200">
            <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-900 text-sm">No notifications yet</p>
            <p className="text-xs mt-1">
              You will be alerted when someone needs blood or volunteers for your request.
            </p>
          </Card>
        ) : (
          notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => !n.readAt && markSingleRead(n.id)}
              className={`p-4 transition-colors cursor-pointer border-gray-200 ${
                !n.readAt ? "bg-red-50/40 border-red-200" : "hover:bg-gray-50/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-950">{n.title}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {n.channel}
                    </Badge>
                    {!n.readAt && (
                      <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{n.message}</p>
                </div>
                <span className="text-[11px] text-gray-400 shrink-0">
                  {timeAgo(n.createdAt)}
                </span>
              </div>

              {n.requestId && (
                <div className="mt-3 pt-2 border-t border-gray-100 flex justify-end">
                  <Link
                    href={`/dashboard/requests/${n.requestId}`}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    View Request &rarr;
                  </Link>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
