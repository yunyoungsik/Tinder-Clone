import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useMatchStore } from '../store/useMatcheStore';

const HomePage = () => {
  const { isLoadingUserProfiles, getUserProfiles, userProfiles } = useMatchStore();

  useEffect(() => {
    getUserProfiles();
  }, [getUserProfiles]);

  console.log(userProfiles)

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
      <Sidebar />
    </div>
  );
};

export default HomePage;
