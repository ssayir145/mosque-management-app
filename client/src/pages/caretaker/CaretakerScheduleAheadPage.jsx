import { BulkScheduleForm } from '../../components/caretaker/BulkScheduleForm';

export default function CaretakerScheduleAheadPage() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-xl font-bold text-ink-900">Schedule Ahead</h2>
      <BulkScheduleForm />
    </div>
  );
}
