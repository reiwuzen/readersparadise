import { useEffect, useState } from "react";

const NetworkStatus = () => {
  const [online, setOnline] = useState<boolean>(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>("");

  useEffect(() => {
    const updateStatus = () => {
      const isOnline = navigator.onLine;
      setOnline(isOnline);

      if (isOnline) {
        if ("connection" in navigator) {
          const conn = (navigator as any).connection;
          let type = conn.effectiveType?.toUpperCase() || conn.type?.toUpperCase() || "ONLINE";

          // Map to common labels
          switch (type) {
            case "SLOW-2G":
            case "2G":
              type = "2G";
              break;
            case "3G":
              type = "3G";
              break;
            case "4G":
              type = "4G";
              break;
            case "5G":
              type = "5G";
              break;
            default:
              type = "ONLINE";
          }

          setConnectionType(type);
        } else {
          setConnectionType("ONLINE");
        }
      } else {
        setConnectionType(""); // offline
      }
    };

    // Initial check
    updateStatus();

    // Listen for events
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    if ("connection" in navigator) {
      (navigator as any).connection.addEventListener("change", updateStatus);
    }

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      if ("connection" in navigator) {
        (navigator as any).connection.removeEventListener("change", updateStatus);
      }
    };
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "14px" }}>
      {online ? (
        <>
          <span>📶</span>
          <span>Online{connectionType ? ` - ${connectionType}` : ""}</span>
        </>
      ) : (
        <>
          <span>❌</span>
          <span>Offline</span>
        </>
      )}
    </div>
  );
};

export default NetworkStatus;
