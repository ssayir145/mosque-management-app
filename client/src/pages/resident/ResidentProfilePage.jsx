import { ProfileForm } from '../../components/resident/ProfileForm';

export default function ResidentProfilePage() {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-ink-900">Your Profile</h2>
      <ProfileForm />
    </div>
  );
}
