import React, { useEffect, useRef, useState } from "react";
import "add-to-calendar-button";
import { logAnalyticsEvent } from "../firebase";

const addToCalendarOpenCountKey = "add-to-calendar-open-count";
const addToCalendarDateKey = "add-to-calendar-open-count-date";

export function setAddToCalendarOpenCount(number: number) {
  localStorage.setItem(addToCalendarOpenCountKey, number.toString());
  localStorage.setItem(addToCalendarDateKey, new Date().toISOString());
}

const AddToCalendar: React.FC = () => {
  const [openCount, setOpenCount] = useState(() =>
    parseInt(localStorage.getItem(addToCalendarOpenCountKey) ?? "0")
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const date = localStorage.getItem(addToCalendarDateKey);
    if (date) {
      const diff = new Date().getTime() - new Date(date).getTime();
      const diffDays = Math.floor(diff / (1000 * 3600 * 24));
      const openCount = parseInt(
        localStorage.getItem(addToCalendarOpenCountKey) ?? "0"
      );
      if (diffDays > 30 && openCount < 5) {
        setAddToCalendarOpenCount(openCount - 1);
        setOpenCount(openCount - 1);
      }
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "atcb-last-event"
        ) {
          const lastEvent = (mutation.target as HTMLElement).getAttribute(
            "atcb-last-event"
          );
          if (lastEvent?.startsWith("success:")) {
            setAddToCalendarOpenCount(10000);
            setOpenCount(10000);
            observer.disconnect();
            logAnalyticsEvent("add_to_calendar_success");
          }

          if (lastEvent?.startsWith("closeList")) {
            const newOpenCount = openCount + 1;
            setAddToCalendarOpenCount(newOpenCount);
            setOpenCount(newOpenCount);
            observer.disconnect();
            logAnalyticsEvent("add_to_calendar_close");
          }
        }
      }
    });

    observer.observe(container, { attributes: true, subtree: true });

    return () => observer.disconnect();
  }, [openCount]);

  const today = new Date();
  const nextMonth = new Date(
    Date.UTC(
      today.getFullYear() + (today.getMonth() === 11 ? 1 : 0),
      (today.getMonth() + 1) % 12,
      1
    )
  );

  return (
    openCount < 3 && (
      <div ref={containerRef} className="inline-block">
        <add-to-calendar-button
          buttonStyle="date"
          styleLight="--btn-background: transparent; --btn-text: #222; --font: 'Courier New',monospace; --btn-font-weight: 200; --btn-border: none; --btn-shadow: none;"
          label="Add Reminder to calendar"
          size={window.innerWidth < 500 ? "0" : "2"}
          name="Monthly accounting @ finance_stuff"
          trigger="click"
          hideBranding={true}
          hideCheckmark={true}
          description="fill monthly accounting @ https://stuff.finance"
          startDate={nextMonth.toISOString().split("T")[0]}
          startTime="19:00"
          endTime="19:30"
          location="https://stuff.finance"
          recurrence="monthly"
          recurrence_interval="1"
          recurrence_byMonthDay="1"
          options="'Google','Apple','iCal'"
          timeZone={"currentBrowser"}
        ></add-to-calendar-button>
      </div>
    )
  );
};

export default AddToCalendar;
