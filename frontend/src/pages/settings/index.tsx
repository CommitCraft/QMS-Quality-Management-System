import { useState } from 'react';
import toast from 'react-hot-toast';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';

const SettingsPage = () => {
	const { user } = useAuth();
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');

	const handlePasswordChange = async () => {
		try {
			await authService.changePassword(currentPassword, newPassword);
			toast.success('Password updated');
		} catch {
			toast.error('Unable to update password');
		}
	};

	return (
		<div className="space-y-6">
			<PageHeader title="Settings" description="Profile access, security actions, and session preferences." />
			<div className="grid gap-6 xl:grid-cols-2">
				<div className="panel p-5">
					<h3 className="panel-title">Profile</h3>
					<div className="mt-4 space-y-3 text-sm text-steel-300">
						<div>Name: <span className="text-white">{user?.name}</span></div>
						<div>Username: <span className="text-white">{user?.username}</span></div>
						<div>Email: <span className="text-white">{user?.email}</span></div>
						<div>Role: <span className="text-white">{user?.roleName}</span></div>
					</div>
				</div>
				<div className="panel p-5">
					<h3 className="panel-title">Change Password</h3>
					<div className="mt-4 space-y-4">
						<input className="input" type="password" placeholder="Current password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
						<input className="input" type="password" placeholder="New password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
						<button className="btn-primary" onClick={() => void handlePasswordChange()}>Update Password</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SettingsPage;
