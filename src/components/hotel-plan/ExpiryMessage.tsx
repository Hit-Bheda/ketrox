import { AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface ExpiryMessageProps {
  endDate: string;
  onExpire?: () => void;
}

export function ExpiryMessage({ endDate, onExpire }: ExpiryMessageProps) {
  const [timer, setTimer] = useState("");
  const [color, setColor] = useState("text-green-600");
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimer("Expired");
        setColor("text-red-500 font-semibold");
        if (!expired) {
          setExpired(true);
          if (onExpire) onExpire();
        }
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      if (days === 0 && hours < 24) setColor("text-orange-500 font-semibold");
      else setColor("text-green-600");

      setTimer(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      setExpired(false);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDate]);

  return (
    <div className="flex items-center gap-2">
      {timer === "Expired" ? (
        <AlertCircle className="w-5 h-5 text-red-500" />
      ) : (
        <Clock className="w-5 h-5 text-current" />
      )}
      <span className={color}>
        {timer === "Expired" ? "Your plan has expired" : `Time left: ${timer}`}
      </span>
    </div>
  );
}