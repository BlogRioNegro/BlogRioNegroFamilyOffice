function BlogApp() {
  const { SiteHeader, SiteFooter } = window.RioNegroDesignSystem_2f3caf;
  const [article, setArticle] = React.useState(() => { const id = localStorage.getItem('rn-blog-article'); return window.RN_ARTICLES.find((a) => a.id === id) || null; });
  const open = (a) => { setArticle(a); a ? localStorage.setItem('rn-blog-article', a.id) : localStorage.removeItem('rn-blog-article'); window.scrollTo(0, 0); };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SiteHeader logoSrc="../../assets/logo-escuro.png" links={[{ label: 'Artigos', href: '#', onClick: (e) => { e.preventDefault(); open(null); } }]} current={article ? '' : 'Artigos'} />
      <div style={{ flex: 1 }}>{article ? <ArticleScreen article={article} onBack={() => open(null)} /> : <ListingScreen onOpen={open} />}</div>
      <SiteFooter logoSrc="../../assets/logo-escuro.png" year={2026} />
    </div>
  );
}
window.BlogApp = BlogApp;
