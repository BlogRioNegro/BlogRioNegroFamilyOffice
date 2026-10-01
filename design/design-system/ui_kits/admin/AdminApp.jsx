function AdminApp() {
  const { SiteHeader, Button } = window.RioNegroDesignSystem_2f3caf;
  const [view, setView] = React.useState(localStorage.getItem('rn-admin-view') || 'articles');
  const [editing, setEditing] = React.useState(null);
  const [flash, setFlash] = React.useState(null);
  const go = (v) => { setView(v); localStorage.setItem('rn-admin-view', v); };
  const nav = (v) => (e) => { e.preventDefault(); setFlash(null); go(v); };
  const current = view === 'leads' ? 'Leads' : 'Artigos';
  return (
    <div style={{ minHeight: '100vh' }}>
      <SiteHeader logoSrc="../../assets/logo-escuro.png" links={[{ label: 'Artigos', href: '#', onClick: nav('articles') }, { label: 'Leads', href: '#', onClick: nav('leads') }]} current={current} right={<Button variant="ghost" size="sm">Sair</Button>} />
      <main style={{ maxWidth: 'var(--layout-admin)', margin: '0 auto', padding: 'var(--space-8) var(--space-6) var(--space-16)' }}>
        {view === 'leads' ? <LeadsScreen /> : view === 'editor' ? <EditorScreen article={editing} onCancel={() => go('articles')} onSave={(m) => { setFlash(m); go('articles'); }} /> : <ArticlesScreen key={flash || 'x'} flash={flash} onNew={() => { setEditing(null); go('editor'); }} onEdit={(a) => { setEditing(a); go('editor'); }} />}
      </main>
    </div>
  );
}
window.AdminApp = AdminApp;
