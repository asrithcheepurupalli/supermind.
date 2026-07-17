import { SavedContent } from '../types';

// Reminders that actually remind. Two honest mechanisms, no server:
// 1. While the app is open, a due-watcher fires a real system notification
//    (with permission) the minute a reminder comes due.
// 2. "Add to calendar" hands the reminder to the device's calendar as a
//    standard .ics event, so the phone does the reminding even when the
//    notebook is closed.

const pad = (n: number) => String(n).padStart(2, '0');

// Floating local time: the reminder means 9am wherever the user is.
const icsStamp = (d: Date) =>
  `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

const icsEscape = (s: string) =>
  s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

export const buildICS = (item: SavedContent): string | null => {
  if (!item.reminderDate) return null;
  const start = item.reminderDate;
  const end = new Date(start.getTime() + 30 * 60 * 1000);
  const title = item.contentText.split('\n')[0].slice(0, 80) || 'A note from supermind';
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//supermind//notebook//EN',
    'BEGIN:VEVENT',
    `UID:${item.id}@supermind.ink`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsEscape(title)}`,
    `DESCRIPTION:${icsEscape(item.contentText.slice(0, 800))}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${icsEscape(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
};

export const downloadICS = (item: SavedContent): boolean => {
  const ics = buildICS(item);
  if (!ics) return false;
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'supermind-reminder.ics';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return true;
};

// Ask once, politely, and only from a settings action the user just took.
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  try {
    return (await Notification.requestPermission()) === 'granted';
  } catch {
    return false;
  }
};

// Fire a system notification for a reminder that just came due. Falls back
// silently when permission is missing; the in-app bell still catches it.
export const notifyReminder = (item: SavedContent) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    const title = item.contentText.split('\n')[0].slice(0, 60) || 'Reminder';
    new Notification('supermind', {
      body: title,
      tag: `reminder-${item.id}`,
      icon: '/icon-192.png',
    });
  } catch {
    // Some platforms (iOS PWA without push) refuse constructor notifications.
  }
};
