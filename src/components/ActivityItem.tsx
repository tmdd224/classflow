import type { ReactNode } from "react";

export function ActivityItem({
  icon,
  title,
  detail,
  time,
  tone,
}: {
  icon: ReactNode;
  title: string;
  detail: string;
  time: string;
  tone: string;
}) {
  return (
    <div className="activity-item">
      <div className={`activity-icon ${tone}`}>{icon}</div>
      <div className="activity-copy">
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <time>{time}</time>
    </div>
  );
}
