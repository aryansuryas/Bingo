'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface EducationMilestone {
  year: string;
  degree: string;
  institution: string;
  score: string;
  scoreLabel: string;
}

const EDUCATION_HISTORY: EducationMilestone[] = [
  {
    year: '2024 - 2028',
    degree: 'Bachelor of Technology (B.Tech CSE)',
    institution: 'Dayananda Sagar University',
    score: '8.56 CGPA',
    scoreLabel: 'Current CGPA',
  },
  {
    year: '2022 - 2024',
    degree: 'Pre-University College (PUC)',
    institution: 'Deeksha CFL PU College',
    score: '93%',
    scoreLabel: 'Final Percentage',
  },
  {
    year: '2021 - 2022',
    degree: 'Secondary School Education (10th)',
    institution: 'Jain Vidyaniketan',
    score: '96.96%',
    scoreLabel: 'Board Score',
  },
];

function EducationCard({ item, index }: { item: EducationMilestone; index: number }) {
  return (
    <motion.div
      initial={{ x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative pl-12 pb-16 last:pb-0"
    >
      <div className="absolute left-[10px] top-2 bottom-0 w-px bg-[var(--paper-line)] group-last:hidden" />
      <div className="absolute left-0 top-2 w-[21px] h-[21px] rounded-full bg-[var(--ink)] border-4 border-[var(--background)] shadow-[0_0_0_2px_var(--wine)] z-10" />

      <div className="bg-[var(--paper-panel)] border border-[var(--paper-line)] rounded-2xl p-8 hover:border-[var(--wine)] hover:shadow-xl hover:shadow-[var(--wine-glow)] transition-all duration-500 group">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <span className="font-mono text-sm font-bold text-[var(--brass)] tracking-widest">
            {item.year}
          </span>
          <div className="bg-[var(--wine-glow)] text-[var(--wine)] px-4 py-1.5 rounded-full text-xs font-bold border border-[var(--wine)]/10">
            <span className="opacity-70 mr-2 font-medium">{item.scoreLabel}:</span>
            {item.score}
          </div>
        </div>

        <h3 className="section-subhead text-2xl font-bold text-[var(--ink)] mb-1 leading-tight">
          {item.degree}
        </h3>
        <h4 className="text-[var(--wine)] font-semibold mb-4 tracking-wide">{item.institution}</h4>
      </div>
    </motion.div>
  );
}

export default function EducationSection() {
  return (
    <section id="education" className="section border-t border-[var(--paper-line)]">
      <div className="content-shell">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-16">
          <div>
            <p className="eyebrow">04 / Journey</p>
            <h2 className="sec-head mb-6">Education</h2>
          </div>

          <div className="relative">
            {EDUCATION_HISTORY.map((item, index) => (
              <EducationCard key={item.institution} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
