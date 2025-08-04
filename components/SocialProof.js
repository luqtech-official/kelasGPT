import { useEffect, useState, useRef } from "react";
import styles from "../styles/SocialProof.module.css";

export default function SocialProof() {
  const [notifications, setNotifications] = useState([]);
  const [currentNotification, setCurrentNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  // Use a ref to keep track of the current index in the sequence.
  // A ref is used here because its value persists across renders without causing re-renders itself,
  // making it ideal for managing state inside an interval.
  const currentIndexRef = useRef(0);

  // This effect runs once when the component mounts to fetch the notification data.
  useEffect(() => {
    fetch("/social_noti.json")
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data);
      })
      .catch((error) => {
        // Log an error if the notification data fails to load.
        console.error('Failed to load social notifications:', error);
      });
  }, []);

  // This effect sets up the interval to display notifications sequentially.
  // It runs only when the `notifications` array has been populated.
  useEffect(() => {
    if (notifications.length > 0) {
      const showNextNotification = () => {
        // Set the notification to be displayed using the current index from the ref.
        setCurrentNotification(notifications[currentIndexRef.current]);
        setIsVisible(true);
        
        // Increment the index for the next call.
        // The modulo operator (%) ensures the index loops back to 0 after the last notification.
        currentIndexRef.current = (currentIndexRef.current + 1) % notifications.length;
        
        // Set a timeout to hide the notification after it has been visible for 5 seconds.
        setTimeout(() => {
          setIsVisible(false);
        }, 5000); // Hide after 5 seconds
      };

      // Show the first notification immediately when the component is ready.
      showNextNotification();

      // Set up an interval to show the next notification every 10 seconds.
      const interval = setInterval(showNextNotification, 10000);

      // The cleanup function clears the interval when the component unmounts
      // to prevent memory leaks.
      return () => clearInterval(interval);
    }
  }, [notifications]);

  // If there is no notification to display, render nothing.
  if (!currentNotification) return null;

  return (
    // The container's visibility is controlled by the `isVisible` state.
    <div className={`${styles.socialProofContainer} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.notification}>
        <div className={styles.content}>
          <div className={styles.mainText}>
            <span className={styles.customerName}>{currentNotification.name}</span> sudah sertai{" "}
            <span className={styles.productName}>{currentNotification.productName}</span> pada {currentNotification.when}.
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
