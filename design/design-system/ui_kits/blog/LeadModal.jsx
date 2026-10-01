function LeadModal({ article, onClose, onDone }) {
  const { Modal, Button, Input, PhoneInput, Checkbox, Alert } = window.RioNegroDesignSystem_2f3caf;
  const [v, setV] = React.useState({ name: '', email: '', phone: '', ok: false });
  const [err, setErr] = React.useState({});
  const [sending, setSending] = React.useState(false);
  const [fail, setFail] = React.useState(false);
  const submit = (e) => {
    e.preventDefault();
    const x = {};
    if (!v.name.trim()) x.name = 'Informe seu nome.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) x.email = 'Informe um e-mail válido, como nome@exemplo.com.br.';
    if (v.phone.replace(/\D/g, '').length !== 11) x.phone = 'Informe um celular com DDD, 11 dígitos.';
    if (!v.ok) x.ok = 'Você precisa aceitar a Política de Privacidade para continuar.';
    setErr(x);
    if (Object.keys(x).length) return;
    setSending(true); setFail(false);
    setTimeout(() => { setSending(false); if (v.email.includes('erro')) setFail(true); else onDone(v); }, 900);
  };
  return (
    <Modal title="Receba o artigo completo" onClose={onClose}
      footer={<><Button variant="secondary" onClick={onClose} disabled={sending}>Cancelar</Button><Button type="submit" form="lead" loading={sending}>{sending ? 'Enviando…' : 'Receber PDF'}</Button></>}>
      <form id="lead" onSubmit={submit} noValidate style={{ display: 'grid', gap: 'var(--space-4)' }}>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Enviaremos “{article.title}” para o seu e-mail.</p>
        {fail ? <Alert variant="error" title="Não foi possível enviar.">Verifique sua conexão e tente novamente.</Alert> : null}
        <Input label="Nome" autoComplete="name" value={v.name} error={err.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        <Input label="E-mail" type="email" autoComplete="email" value={v.email} error={err.email} onChange={(e) => setV({ ...v, email: e.target.value })} />
        <PhoneInput value={v.phone} error={err.phone} onChange={(m) => setV({ ...v, phone: m })} />
        <Checkbox checked={v.ok} error={err.ok} onChange={(e) => setV({ ...v, ok: e.target.checked })}>
          Li e concordo com a <a href="#privacidade" onClick={(e) => e.preventDefault()}>Política de Privacidade</a> e autorizo a Rio Negro Assessoria de Investimentos a entrar em contato por e-mail, telefone e WhatsApp com conteúdos sobre investimentos.
        </Checkbox>
      </form>
    </Modal>
  );
}
window.LeadModal = LeadModal;
