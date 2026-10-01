function EditorScreen({ article, onCancel, onSave }) {
  const { Input, Button, Checkbox, Alert, Label, FieldMessage } = window.RioNegroDesignSystem_2f3caf;
  const [title, setTitle] = React.useState(article ? article.title : '');
  const [type, setType] = React.useState(article ? article.type : 'pdf');
  const [err, setErr] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const save = (e) => { e.preventDefault(); if (!title.trim()) { setErr('Informe o título do artigo.'); return; } setErr(''); setSaving(true); setTimeout(() => onSave(article ? 'Alterações salvas.' : 'Artigo publicado.'), 800); };
  const box = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-card)', boxShadow: 'var(--shadow-card)', padding: 'var(--space-6)', display: 'grid', gap: 'var(--space-6)' };
  const seg = (v, l) => <Button variant={type === v ? 'primary' : 'secondary'} size="sm" onClick={() => setType(v)} aria-pressed={type === v}>{l}</Button>;
  return (
    <form onSubmit={save} noValidate style={{ maxWidth: 'var(--layout-reading)' }}>
      <Button variant="link" iconLeft="arrow-left" onClick={onCancel}>Artigos</Button>
      <h1 style={{ margin: 'var(--space-4) 0 var(--space-6)', fontSize: 'var(--font-size-2xl)', lineHeight: 'var(--line-height-2xl)', fontWeight: 600 }}>{article ? 'Editar artigo' : 'Novo artigo'}</h1>
      <div style={box}>
        <Input label="Título" value={title} error={err} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Renda fixa em 2026" />
        <div className="rn-field"><Label>Tipo</Label><div style={{ display: 'flex', gap: 'var(--space-2)' }}>{seg('pdf', 'PDF')}{seg('text', 'Texto')}</div></div>
        <Input label="Data de publicação" type="date" defaultValue="2026-09-24" />
        <div className="rn-field"><Label htmlFor="ex">Prévia</Label><textarea id="ex" className="rn-input" rows="3" style={{ height: 'auto', padding: 'var(--space-3)', fontFamily: 'var(--font-serif)', fontSize: 'var(--font-size-md)', lineHeight: 1.6 }} defaultValue={article ? 'Juros, câmbio e bolsa: como a equipe da Rio Negro está posicionando as carteiras.' : ''} /><FieldMessage>Aparece no card de destaque. Até 160 caracteres.</FieldMessage></div>
        {type === 'pdf' ? <><Input label="Arquivo PDF" type="file" accept="application/pdf" help="Máximo de 20 MB." /><Alert variant="warning" title="O envio automático está desativado.">Os leads serão salvos, mas o PDF só será enviado quando o envio for ativado abaixo.</Alert><Checkbox>Enviar o PDF por e-mail automaticamente para quem preencher o formulário.</Checkbox></> : null}
        <Checkbox defaultChecked>Destacar no topo da listagem.</Checkbox>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end', marginTop: 'var(--space-6)' }}>
        <Button variant="secondary" onClick={onCancel} disabled={saving}>Cancelar</Button>
        <Button type="submit" loading={saving}>{saving ? 'Salvando…' : article ? 'Salvar alterações' : 'Publicar'}</Button>
      </div>
    </form>
  );
}
window.EditorScreen = EditorScreen;
