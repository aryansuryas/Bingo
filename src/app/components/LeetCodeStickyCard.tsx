'use client';

import React, { useState } from 'react';

interface ProfileCard {
  title: string;
  meta: string;
  handle?: string;
  description: string;
  href: string;
  image: string;
  imageAlt: string;
  background: string;
  fallback: string;
}

const PROFILE_CARDS: ProfileCard[] = [
  {
    title: 'LeetCode',
    meta: 'DATA STRUCTURES & ALGORITHMS',
    handle: '@aryansuryas',
    description: 'Algorithmic problem solving and competitive programming.',
    href: 'https://leetcode.com/u/aryansuryas/',
    image: '/leetcode-profile.png',
    imageAlt: 'LeetCode profile screenshot for aryansuryas',
    background: '#f4f0ea',
    fallback: 'Add the real LeetCode screenshot at public/leetcode-profile.png.',
  },
  {
    title: 'LinkedIn',
    meta: 'PROFESSIONAL NETWORK',
    description: 'Computer Science, software development and technology.',
    href: 'https://www.linkedin.com/in/aryansuryas/',
    image: '/linkedin-profile.png',
    imageAlt: 'LinkedIn profile artwork',
    background: '#ffe600',
    fallback: 'Add your LinkedIn artwork at public/linkedin-profile.png.',
  },
  {
    title: 'YouTube',
    meta: 'VIDEO CONTENT',
    description: 'Technology projects, experiments and creative development.',
    href: 'https://www.youtube.com/@aryansuryas',
    image: '/youtube-channel.png',
    imageAlt: 'YouTube channel artwork',
    background: '#e9e8e4',
    fallback: 'Add your channel artwork at public/youtube-channel.png.',
  },
  {
    title: 'GitHub',
    meta: 'OPEN SOURCE & PROJECTS',
    handle: 'aryansuryas',
    description: 'Selected source code and software projects.',
    href: 'https://github.com/aryansuryas',
    image: '/github-profile.png',
    imageAlt: 'GitHub profile contribution graph',
    background: '#f4f0ea',
    fallback: 'Add your GitHub profile image at public/github-profile.png.',
  },
];

function ProfileImage({ card }: { card: ProfileCard }) {
  const [available, setAvailable] = useState(true);

  if (!available) {
    return (
      <div className="profile-folder-fallback" role="img" aria-label={card.fallback}>
        <span>{card.fallback}</span>
      </div>
    );
  }

  return (
    <img
      src={card.image}
      alt={card.imageAlt}
      width={1600}
      height={1000}
      loading="lazy"
      decoding="async"
      className="profile-folder-image"
      onError={() => setAvailable(false)}
    />
  );
}

export default function LeetCodeStickyCard() {
  return (
    <section id="leetcode" className="profile-folder-section">
      <div className="content-shell">
        <div className="profile-folder-stack">
          <ul className="profile-folder-list">
            {PROFILE_CARDS.map((card, index) => (
              <li
                key={card.title}
                className="profile-folder-card"
                style={
                  {
                    '--folder-index': index,
                    '--folder-background': card.background,
                  } as React.CSSProperties
                }
              >
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${card.title} profile in a new tab`}
                  className="profile-folder-link"
                >
                  <span className="profile-folder-tab">
                    PROFILE {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="profile-folder-content">
                    <span className="profile-folder-title-row">
                      <span className="profile-folder-title">{card.title}</span>
                      <span className="profile-folder-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </span>

                    <span className="profile-folder-meta">
                      <span>{card.meta}</span>
                      {card.handle && <span>{card.handle}</span>}
                    </span>

                    <span className="profile-folder-divider" />
                    <span className="profile-folder-image-wrap">
                      <ProfileImage card={card} />
                    </span>
                    <span className="profile-folder-description">{card.description}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
