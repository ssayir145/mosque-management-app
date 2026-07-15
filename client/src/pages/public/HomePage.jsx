import { useState } from 'react';
import { PrayerTimesWidget } from '../../components/shared/PrayerTimesWidget';
import { WeeklyPrayerSchedule } from '../../components/shared/WeeklyPrayerSchedule';
import { AnnouncementsFeed } from '../../components/shared/AnnouncementsFeed';
import { FeedbackForm } from '../../components/shared/FeedbackForm';

export default function HomePage() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-2">
        <PrayerTimesWidget />
        <WeeklyPrayerSchedule />
      </section>

      <section>
        <h2 className="mb-4 font-display text-2xl font-bold text-ink-900">Announcements &amp; Community News</h2>
        <AnnouncementsFeed />
      </section>

      <section className="card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold text-ink-900">Share Your Feedback</h2>
          <button className="btn-secondary" type="button" onClick={() => setFeedbackOpen((o) => !o)}>
            {feedbackOpen ? 'Hide form' : 'Give Feedback'}
          </button>
        </div>
        {feedbackOpen ? (
          <FeedbackForm onSubmitted={() => setFeedbackOpen(false)} />
        ) : (
          <p className="text-sm text-ink-500">
            Have an idea or concern for the committee? Anyone can submit feedback — no login required.
          </p>
        )}
      </section>
    </div>
  );
}
