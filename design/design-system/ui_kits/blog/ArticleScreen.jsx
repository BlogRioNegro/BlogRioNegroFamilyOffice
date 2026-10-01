function ArticleScreen({ article, onBack }) {
  const { Button, TypeBadge, Alert } = window.RioNegroDesignSystem_2f3caf;
  const [modal, setModal] = React.useState(false);
  const [sent, setSent] = React.useState(null);
  const pdf = article.type === 'pdf';
  return (
    <main style={{ maxWidth: 'var(--layout-reading)', margin: '0 auto', padding: 'var(--space-8) var(--space-4) var(--space-16)' }}>
      <Button variant="link" iconLeft="arrow-left" onClick={onBack}>Todos os artigos</Button>
      <header style={{ margin: 'var(--space-8) 0' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-3)' }}>
          <TypeBadge type={article.type} /><time>{article.date}</time>{pdf ? <span>· {article.pages} páginas</span> : <span>· 5 min de leitura</span>}
        </div>
        <h1 style={{ margin: 0, fontSize: 'var(--font-size-h1)', lineHeight: 'var(--line-height-tight)', fontWeight: 700, textWrap: 'balance' }}>{article.title}</h1>
      </header>
      <div style={{ aspectRatio: '16/9', background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-card)', marginBottom: 'var(--space-8)' }} />
      <div className="rn-article">
        <p>{article.excerpt}</p>
        {pdf ? <p>Neste material, a equipe da Rio Negro reúne os dados mais recentes, explica o contexto e mostra como isso se traduz em decisões práticas para diferentes perfis de investidor.</p> : <>
          <p>Antes de escolher, vale entender como cada modalidade é tributada e em que situação ela faz mais sentido. A decisão depende principalmente do modelo de declaração do Imposto de Renda e do seu horizonte de investimento.</p>
          <h2>Quem declara pelo modelo completo</h2>
          <p>O PGBL permite deduzir as contribuições da base de cálculo do IR, até o limite de 12% da renda bruta tributável. Em contrapartida, o imposto no resgate incide sobre o valor total acumulado.</p>
          <h2>Quem declara pelo modelo simplificado</h2>
          <p>Para quem usa o modelo simplificado ou já ultrapassou o limite de 12%, o VGBL costuma ser mais adequado: o imposto no resgate incide apenas sobre os rendimentos.</p>
          <blockquote>Previdência é um investimento de longo prazo. A escolha do regime de tributação — progressivo ou regressivo — pesa tanto quanto a modalidade.</blockquote>
          <p>Converse com seu assessor para simular os dois cenários com os seus números.</p></>}
      </div>
      {pdf ? (
        <div style={{ marginTop: 'var(--space-8)', padding: 'var(--space-6)', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', display: 'grid', gap: 'var(--space-4)' }}>
          {sent ? <Alert variant="success" title="Pronto! O PDF foi enviado.">Enviamos o artigo para {sent.email}. Confira sua caixa de entrada em alguns minutos.</Alert> : <>
            <div><strong style={{ fontSize: 'var(--font-size-md)' }}>Leia o artigo completo</strong><p style={{ margin: 'var(--space-1) 0 0', color: 'var(--color-text-muted)' }}>PDF com {article.pages} páginas, enviado gratuitamente para o seu e-mail.</p></div>
            <div><Button iconRight="download" onClick={() => setModal(true)}>Receber PDF</Button></div></>}
        </div>) : null}
      {modal ? <LeadModal article={article} onClose={() => setModal(false)} onDone={(v) => { setModal(false); setSent(v); }} /> : null}
    </main>
  );
}
window.ArticleScreen = ArticleScreen;
