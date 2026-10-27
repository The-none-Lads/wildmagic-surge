import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import PlayerView from './components/PlayerView/PlayerView';
import AdminView from './components/AdminPanel/AdminView';
import surgeData from './data/surgeData.json';
import { useSurgeStore } from './store/useSurgeStore';

function App() {
  const { entries, loadEntries } = useSurgeStore();
  const [showAdmin, setShowAdmin] = useState(false);

  // Seed the store from surgeData.json on first load (won't overwrite persisted data)
  useEffect(() => {
    if (entries.length === 0) {
      loadEntries(surgeData);
    }
  }, [entries.length, loadEntries]);

  return (
    <Layout>
      {showAdmin ? <AdminView /> : <PlayerView />}
      <button onClick={() => setShowAdmin(v => !v)} style={{
        position: 'fixed', bottom: '20px', right: '20px',
        padding: '10px 16px', background: '#2a2a4a', color: '#fff',
        border: '1px solid #444', borderRadius: '8px', cursor: 'pointer'
      }}>⚙ Admin</button>
    </Layout>
  );
}
export default App;
