import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, X } from 'lucide-react';
import { useRoamly } from '../context/RoamlyContext';

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationsModal({ open, onClose }: NotificationsModalProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useRoamly();
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-title"
      className="fixed inset-0 z-50 bg-[#080C10]/55 backdrop-blur-xs flex items-end sm:items-start sm:justify-end p-0 sm:p-4"
    >
      <div className="w-full sm:max-w-md bg-[#FCF9F3] rounded-t-3xl sm:rounded-2xl border border-[#172B3A]/12 shadow-2xl overflow-hidden max-h-[82vh] flex flex-col">
        <div className="px-5 py-4 border-b border-[#172B3A]/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4.5 h-4.5 text-[#FF7043]" />
            <h2 id="notif-title" className="font-display text-lg font-bold text-[#172B3A]">
              Travel Updates
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="min-h-[40px] px-2.5 text-xs font-medium text-[#006A64] hover:bg-[#006A64]/10 rounded-lg inline-flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-full text-[#172B3A]/60 hover:bg-[#172B3A]/5"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto divide-y divide-[#172B3A]/8">
          {notifications.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                markNotificationRead(item.id);
                if (item.destinationId) {
                  onClose();
                  navigate(`/destination/${item.destinationId}`);
                }
              }}
              className={`w-full text-left px-5 py-4 transition-colors hover:bg-white ${
                item.read ? 'opacity-75' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-[#172B3A]">{item.title}</p>
                <span className="text-[11px] text-[#172B3A]/50 whitespace-nowrap shrink-0">
                  {item.time}
                </span>
              </div>
              <p className="mt-1 text-xs text-[#172B3A]/70 leading-relaxed">{item.message}</p>
              {!item.read && (
                <span className="mt-2 inline-block text-[11px] font-semibold text-[#FF7043]">
                  Unread update
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
