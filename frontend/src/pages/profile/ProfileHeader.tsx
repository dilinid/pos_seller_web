import { Camera, Trash2, Calendar, Hash, BadgeCheck } from 'lucide-react';

interface ProfileHeaderProps {
  name: string;
  initial: string;
  profilePicture?: string | null;
  profileImg?: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageClick: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  memberId?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  initial,
  profilePicture,
  profileImg,
  fileInputRef,
  onImageClick,
  onImageChange,
  memberId,
}) => {
  const hasImage = !!(profilePicture || profileImg);

  return (
    <div className="premium-card animate-fade-in" style={{
      padding: '24px 28px', background: '#fff',
      display: 'flex', alignItems: 'center', gap: '20px',
      flexWrap: 'wrap',
    }}>
      {/* Avatar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: '68px', height: '68px', borderRadius: '50%',
          background: 'var(--primary-light)',
          border: '2px solid var(--primary-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--primary)', fontWeight: 800, fontSize: '1.6rem',
          overflow: 'hidden',
        }}>
          {hasImage ? (
            <img
              src={
                profileImg
                  ? URL.createObjectURL(profileImg)
                  : `data:image/jpeg;base64,${profilePicture}`
              }
              alt="profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            initial
          )}
        </div>
        <button
          type="button"
          onClick={onImageClick}
          style={{
            position: 'absolute', bottom: '-2px', right: '-2px',
            width: '28px', height: '28px', borderRadius: '50%',
            border: '2px solid #fff', background: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            padding: 0,
          }}
        >
          {profileImg ? (
            <Trash2 size={13} color="var(--primary)" />
          ) : (
            <Camera size={13} color="var(--primary)" />
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={onImageChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Name + Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{
          fontSize: '1.25rem', fontFamily: 'var(--font-display)',
          margin: 0, fontWeight: 800, color: 'var(--text-primary)',
        }}>
          {name}
        </h1>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px',
        }}>
          <BadgeCheck size={14} color="var(--primary)" />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Cooperative Member
          </span>
        </div>
      </div>

      {/* Badges */}
      <div style={{
        display: 'flex', gap: '12px', flexWrap: 'wrap',
        marginLeft: 'auto',
      }}>
        {memberId && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '8px',
            background: 'var(--bg-secondary)', fontSize: '0.75rem',
          }}>
            <Hash size={13} color="var(--text-muted)" />
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
              {memberId}
            </span>
          </div>
        )}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 12px', borderRadius: '8px',
          background: 'var(--bg-secondary)', fontSize: '0.75rem',
        }}>
          <Calendar size={13} color="var(--text-muted)" />
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            Member since 2024
          </span>
        </div>
      </div>
    </div>
  );
};
