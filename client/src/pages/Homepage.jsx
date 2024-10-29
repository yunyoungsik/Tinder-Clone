import { useAuthStore } from '../store/useAuthStore';

const Homepage = () => {
  const { logout } = useAuthStore();

  return (
    <div>
      <button onClick={logout}>logout</button>
    </div>
  );
};

export default Homepage;
