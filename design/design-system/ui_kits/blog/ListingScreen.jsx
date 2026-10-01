function ListingScreen({ onOpen }) {
  const { FeaturedArticleCard, ArticleCard, LoadMoreButton } = window.RioNegroDesignSystem_2f3caf;
  const all = window.RN_ARTICLES;
  const [count, setCount] = React.useState(4);
  const [loading, setLoading] = React.useState(false);
  const rest = all.slice(1, 1 + count);
  const more = () => { setLoading(true); setTimeout(() => { setCount((c) => c + 4); setLoading(false); }, 700); };
  const go = (a) => (e) => { e.preventDefault(); onOpen(a); };
  return (
    <main style={{ maxWidth: 'var(--layout-admin)', margin: '0 auto', padding: 'var(--space-12) var(--space-4) var(--space-16)' }}>
      <h1 style={{ margin: '0 0 var(--space-2)', fontSize: 'var(--font-size-h1)', lineHeight: 'var(--line-height-tight)', fontWeight: 700 }}>Artigos</h1>
      <p style={{ margin: '0 0 var(--space-8)', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-md)', maxWidth: '60ch' }}>Análises e guias da equipe da Rio Negro sobre investimentos, mercado e planejamento financeiro.</p>
      <div style={{ marginBottom: 'var(--space-8)' }} onClick={go(all[0])}>
        <FeaturedArticleCard href={'#' + all[0].id} {...all[0]} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-12)' }}>
        {rest.map((a) => <div key={a.id} onClick={go(a)} style={{ display: 'grid' }}><ArticleCard href={'#' + a.id} {...a} /></div>)}
        {loading ? [0, 1, 2].map((i) => <ArticleCard key={'l' + i} loading />) : null}
      </div>
      <LoadMoreButton loading={loading} done={1 + count >= all.length} onClick={more} />
    </main>
  );
}
window.ListingScreen = ListingScreen;
