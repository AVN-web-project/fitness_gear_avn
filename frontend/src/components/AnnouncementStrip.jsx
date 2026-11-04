import { useEffect, useState } from 'react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const REPEATS_PER_GROUP = 4;

const getActiveMessages = (data) => {
  if (!data) return [];

  const now = Date.now();
  const sourceMessages =
    Array.isArray(data.messages) && data.messages.length > 0
      ? data.messages
      : data.message?.trim()
        ? [{ message: data.message, isEnabled: true, order: 0 }]
        : [];

  return sourceMessages
    .filter((item) => {
      // The storefront uses each message's own enabled status.
      // The top-level announcementStrip.isEnabled flag is intentionally ignored.
      if (item?.isEnabled === false || !item?.message?.trim()) return false;

      const startAt = item.startAt ? new Date(item.startAt).getTime() : null;
      const endAt = item.endAt ? new Date(item.endAt).getTime() : null;

      return (
        (!startAt || (!Number.isNaN(startAt) && now >= startAt)) &&
        (!endAt || (!Number.isNaN(endAt) && now <= endAt))
      );
    })
    .sort(
      (left, right) =>
        (Number(left.order) || 0) - (Number(right.order) || 0),
    );
};

const AnnouncementStrip = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const apiUrl = `${API_BASE_URL.replace(/\/$/, '')}/marketing/announcement-strip`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`API request failed: ${response.status}`);
        }

        const payload = await response.json();
        setMessages(getActiveMessages(payload?.announcementStrip));
      } catch (error) {
        console.error('Failed to load announcement strip:', error);
      }
    };

    fetchAnnouncement();
  }, []);

  if (messages.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes avn-announcement-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .avn-announcement-track {
          animation: avn-announcement-scroll 30s linear infinite;
          will-change: transform;
        }

        .avn-announcement {
          background: #FF1E27;
          color: #FFFFFF;
        }

        .avn-announcement:hover .avn-announcement-track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .avn-announcement-track { animation: none; }
        }
      `}</style>

      <div className="avn-announcement relative z-30 w-full overflow-hidden">
        <div className="flex h-8 items-center overflow-hidden">
          <div className="avn-announcement-track flex w-max shrink-0">
            {[0, 1].map((groupIndex) => (
              <div
                key={groupIndex}
                className="flex shrink-0 items-center gap-12 px-6 md:gap-16 md:px-8"
                aria-hidden={groupIndex === 1}
              >
                {Array.from({ length: REPEATS_PER_GROUP }).map((_, repeatIndex) => (
                  <div
                    key={repeatIndex}
                    className="flex shrink-0 items-center gap-12 md:gap-16"
                  >
                    {messages.map((item, messageIndex) => (
                      <span
                        key={item._id || `${repeatIndex}-${messageIndex}`}
                        className="shrink-0 whitespace-nowrap font-heading text-[11px] font-extrabold uppercase tracking-[0.12em] text-white md:text-xs"
                      >
                        {item.message}
                      </span>
                    ))}
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
