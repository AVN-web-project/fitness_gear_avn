
import { useEffect, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AnnouncementStrip = () => {
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

        if (data?.isEnabled && data?.message?.trim()) {
          setAnnouncement(data);
        } else {
          setAnnouncement(null);
        }
      } catch (error) {
        console.error('Failed to load announcement strip:', error);
      }
    };

    fetchAnnouncement();
  }, []);

  if (!announcement) return null;

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
          animation: avn-announcement-scroll 24s linear infinite;
          will-change: transform;
        }

        .avn-announcement:hover .avn-announcement-track {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .avn-announcement-track {
            animation: none;
          }
        }
      `}</style>

      <div className="avn-announcement relative z-30 w-full overflow-hidden border-y-2 border-x-0 border-[#FF1E27] bg-[var(--bg-main)] red-corner-border">
        <div className="flex h-[88px] items-center overflow-hidden md:h-[105px]">
          <div className="avn-announcement-track flex w-max shrink-0">
            {[0, 1].map((group) => (
              <div
                key={group}
                className="flex shrink-0 items-center"
                aria-hidden={group === 1}
              >
                {[0, 1, 2].map((item) => (
                  <div
                    key={item}
                    className="flex shrink-0 items-center gap-10 px-8 md:gap-16 md:px-12"
                  >
                    <span className="whitespace-nowrap font-heading text-2xl font-black italic uppercase tracking-wider text-[var(--text-main)] md:text-4xl">
                      {announcement.message}
                    </span>

                    <span className="text-2xl font-black text-[#FF1E27] md:text-3xl">
                      ✦
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
