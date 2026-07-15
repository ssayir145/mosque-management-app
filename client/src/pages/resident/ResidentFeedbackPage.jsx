import { FeedbackForm } from '../../components/shared/FeedbackForm';
import { FeedbackStatusList } from '../../components/resident/FeedbackStatusList';

export default function ResidentFeedbackPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink-900">Feedback &amp; Suggestions</h2>
        <p className="text-sm text-ink-500">Share ideas or concerns with the mosque committee.</p>
      </div>
      <div className="card p-6">
        <FeedbackForm />
      </div>
      <div>
        <h3 className="mb-4 font-display text-lg font-semibold text-ink-900">Your Submissions</h3>
        <FeedbackStatusList />
      </div>
    </div>
  );
}
