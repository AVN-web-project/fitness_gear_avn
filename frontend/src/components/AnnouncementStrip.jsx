
import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AnnouncementStrip = ({ onVisibilityChange }) => {
  const [announcement, setAnnouncement] = useState(null);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        if (!API_BASE_URL) {
          console.error('VITE_API_BASE_URL is not configured');
          return;
        }

        const apiUrl = `${API_BASE_URL.replace(/\/$/, '')}/marketing/announcement-strip`;

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const payload = await response.json();
        const data = payload?.announcementStrip;
        const now = Date.now();
        const messages = (data?.messages?.length ? data.messages : data?.message?.trim() ? [{
          message: data.message,
          isEnabled: true,
          order: 0,
          startAt: null,
          endAt: null,
        }] : [])
          .filter((item) => {
            const startsAfterNow = item.startAt && new Date(item.startAt).getTime() > now;
            const ended = item.endAt && new Date(item.endAt).getTime() <= now;
            return item.isEnabled !== false && !startsAfterNow && !ended && item.message?.trim();
          })
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        const isVisible = messages.length > 0;
        onVisibilityChange?.(isVisible);

        if (isVisible) {
          setAnnouncement({ ...data, messages });
        } else {
          setAnnouncement(null);
        }
      } catch (error) {
        onVisibilityChange?.(false);
        console.error('Failed to load announcement strip:', error);
      }
    };

    fetchAnnouncement();
    const refreshTimer = window.setInterval(fetchAnnouncement, 30000);
    return () => window.clearInterval(refreshTimer);
  }, [onVisibilityChange]);

  if (!announcement) return null;

  const loopMessages = Array.from({ length: 4 }, () => announcement.messages).flat();

  return (
    <>
      <style>{`
        @keyframes avn-announcement-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .avn-announcement-track {
          animation: avn-announcement-scroll 18s linear infinite;
          will-change: transform;
        }

        @media (min-width: 768px) {
          .avn-announcement-track {
            animation-duration: 25s;
          }
        }

        .avn-announcement:hover .avn-announcement-track {
          animation-play-state: paused;
        }

        .avn-announcement {
          border-top: 2px solid transparent;
          border-bottom: 2px solid transparent;
          border-left: 0;
          border-right: 0;
          border-image: none;
        }

        .avn-announcement::before,
        .avn-announcement::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          height: 2px;
          pointer-events: none;
          background: linear-gradient(90deg, #ffffff 0%, rgba(226, 232, 240, 0.85) 15%, rgba(255, 255, 255, 0.12) 40%, rgba(255, 30, 39, 0.2) 70%, #FF1E27 90%, #FF1E27 100%);
        }

        .avn-announcement::before {
          top: 0;
        }

        .avn-announcement::after {
          bottom: 0;
        }

        html.light .avn-announcement::before,
        html.light .avn-announcement::after {
          background: linear-gradient(90deg, #64748b 0%, #cbd5e1 30%, rgba(203, 213, 225, 0.3) 50%, #FF1E27 80%, #FF1E27 100%);
        }

        @media (prefers-reduced-motion: reduce) {
          .avn-announcement-track {
            animation: none;
          }
        }
      `}</style>

      <div className="avn-announcement relative z-30 w-full overflow-hidden bg-transparent">
        <div className="flex h-[75px] items-center overflow-hidden md:h-[80px]">
          <div className="avn-announcement-track flex w-max shrink-0">
            {[0, 1].map((group) => (
              <div
                key={group}
                className="flex shrink-0 items-center gap-32 pl-16 pr-16 md:gap-48 md:pl-24 md:pr-24"
                aria-hidden={group === 1}
              >
                {loopMessages.map((item, index) => (
                  <div
                    key={`${group}-${item._id || index}`}
                    className="flex shrink-0 items-center"
                  >
                    <span className="whitespace-nowrap font-heading text-2xl font-black italic uppercase tracking-wider text-[var(--text-main)] md:text-4xl">
                      {item.message}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnouncementStrip;
