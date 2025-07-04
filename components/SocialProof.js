import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";

export default function SocialProof() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch("/social_noti.json")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
      });
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      let currentIndex = 0;
      const interval = setInterval(() => {
        const notification = notifications[currentIndex];
        toast.success(`${notification.name} baru sahaja membeli KelasGPT!`, {
          duration: 4000, // Display for 4 seconds
        });
        currentIndex = (currentIndex + 1) % notifications.length;
      }, 8000); // Show a new toast every 8 seconds

      return () => clearInterval(interval);
    }
  }, [notifications]);

  return <Toaster position="bottom-center" />;
}