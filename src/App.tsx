import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { useDocuments, useSettings } from './hooks/useDocuments';
import { Dashboard } from './pages/Dashboard';
import { NewDocument } from './pages/NewDocument';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { documents, save, remove } = useDocuments();
  const { settings, update } = useSettings();

  return (
    <AppShell
      mobileOpen={mobileOpen}
      onCloseMobile={() => setMobileOpen(false)}
      onToggleMobile={() => setMobileOpen((v) => !v)}
    >
      <Routes>
        <Route path="/" element={<Dashboard documents={documents} onDelete={remove} />} />
        <Route path="/novy" element={<NewDocument onSave={save} />} />
        <Route path="/sablony" element={<Templates />} />
        <Route path="/nastaveni" element={<Settings settings={settings} onUpdate={update} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
