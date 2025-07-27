import { useEffect, useState } from "react";
import styles from "../styles/SocialProof.module.css";

export default function SocialProof() {
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    fetch("/social_noti.json")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
      })
      .catch((error) => {
        console.error('Failed to load social notifications:', error);
      });
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      const showRandomNotification = () => {
        const randomIndex = Math.floor(Math.random() * notifications.length);
        const notification = notifications[randomIndex];
        
        setCurrentNotification(notification);
        setIsVisible(true);
        
        setTimeout(() => {
          setIsVisible(false);
        }, 5000); // Hide after 5 seconds
      };

      // Show the first notification immediately
      showRandomNotification();

      // Then show a new one every 10 seconds
      const interval = setInterval(showRandomNotification, 10000);

      return () => clearInterval(interval);
    }
  }, [notifications]);

  if (!currentNotification) return null;

  return (
    <div className={`${styles.socialProofContainer} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.notification}>
        <div className={styles.content}>
          <div className={styles.mainText}>
            <span className={styles.customerName}>{currentNotification.name}</span> just purchased{" "}
            <span className={styles.productName}>{currentNotification.productName}</span> today.
          </div>
          <div className={styles.verification}>
            <div className={styles.checkmark}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M11.6667 3.5L5.25 9.91667L2.33333 7"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className={styles.verificationText}>Purchase Verified by SecurePay.</span>
          </div>
        </div>
      </div>
    </div>
  );
}