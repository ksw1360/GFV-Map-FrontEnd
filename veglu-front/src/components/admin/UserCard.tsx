import type { UserResponseDto } from '@/types/user'

export default function UserCard({ user }: { user: UserResponseDto }) {
    return (
        <div className="flex items-center px-4 py-3 border border-gray-200 rounded-xl bg-white">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {user.profileImageUrl ? (
                        <img src={user.profileImageUrl} alt={user.nickname} className="w-full h-full object-cover" />
                    ) : (
                        <UserIcon />
                    )}
                </div>
                <div>
                    <p className="text-sm text-gray-800">{user.nickname}</p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                </div>
            </div>
        </div>
    )
}

function UserIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
    )
}