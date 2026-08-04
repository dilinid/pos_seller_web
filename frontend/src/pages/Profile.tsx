import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import SidebarMenu from '../components/SidebarMenu';
import { useProfile } from '../hooks/useProfile';
import { ProfileHeader } from './profile/ProfileHeader';
import { PersonalInfoSection } from './profile/PersonalInfoSection';
import { CODSection } from '../components/marketplace/CODSection';
import { useMarketplaceStore } from '../stores/marketplace.store';
import { useCODStore } from '../stores/cod.store';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const {
    user, profile, districts, dsDivisions, gnDivisions,
    loading, saveLoading, fileInputRef, profileImg, saveSuccess,
    handleChanges, handleProfileImageChange, handleProfileImageClick, handleProfileSave,
  } = useProfile();

  const orders = useMarketplaceStore((s) => s.orders);
  const codState = useCODStore((s) => s.request);
  const requestCOD = useCODStore((s) => s.requestCOD);

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-secondary)',
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        <SidebarMenu />

        <main style={{
          flex: 1, maxWidth: '680px', margin: '0 auto',
          padding: '32px 28px',
          display: 'flex', flexDirection: 'column', gap: '16px',
          overflowX: 'hidden',
        }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              alignSelf: 'flex-start', background: 'none', border: 'none',
              color: 'var(--primary)', cursor: 'pointer', fontWeight: 700,
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize: '0.88rem', padding: '8px 0',
              fontFamily: 'var(--font-display)',
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>

          <ProfileHeader
            name={profile.name}
            initial={profile?.name?.charAt(0) || 'U'}
            profilePicture={profile?.profilePicture}
            profileImg={profileImg}
            fileInputRef={fileInputRef}
            onImageClick={handleProfileImageClick}
            onImageChange={handleProfileImageChange}
            memberId={user?.memberId}
          />

          <PersonalInfoSection
            name={profile.name}
            phone={profile.phone}
            email={profile.email}
            address={profile.address || ''}
            gender={profile.gender || ''}
            districtId={profile.district?.id || ''}
            dsDivisionId={profile.dsDivision?.id || ''}
            gnDivisionId={profile.gnDivision?.id || ''}
            userDistrict={user?.district}
            userDsDivision={user?.dsDivision}
            userGnDivision={user?.gnDivision}
            districts={districts}
            dsDivisions={dsDivisions}
            gnDivisions={gnDivisions}
            loading={loading}
            saveLoading={saveLoading}
            saveSuccess={saveSuccess}
            onChange={handleChanges}
            onSave={handleProfileSave}
          />

          <CODSection
            user={user}
            orders={orders}
            codState={codState}
            onRequestCOD={requestCOD}
          />
        </main>
      </div>
    </div>
  );
};

export default Profile;
