/* @ds-bundle: {"format":4,"namespace":"RioNegroDesignSystem_2f3caf","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"LoadMoreButton","sourcePath":"components/actions/LoadMoreButton.jsx"},{"name":"ArticleCard","sourcePath":"components/content/ArticleCard.jsx"},{"name":"FeaturedArticleCard","sourcePath":"components/content/FeaturedArticleCard.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"Pagination","sourcePath":"components/data/Pagination.jsx"},{"name":"Alert","sourcePath":"components/feedback/Alert.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"StatusBadge","sourcePath":"components/feedback/StatusBadge.jsx"},{"name":"TypeBadge","sourcePath":"components/feedback/TypeBadge.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"FieldMessage","sourcePath":"components/forms/FieldMessage.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Label","sourcePath":"components/forms/Label.jsx"},{"name":"PhoneInput","sourcePath":"components/forms/PhoneInput.jsx"},{"name":"SiteFooter","sourcePath":"components/layout/SiteFooter.jsx"},{"name":"SiteHeader","sourcePath":"components/layout/SiteHeader.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"e29992e912d7","components/actions/LoadMoreButton.jsx":"9bfff4dd9213","components/content/ArticleCard.jsx":"a0985678cfef","components/content/FeaturedArticleCard.jsx":"845585f64b43","components/core/Icon.jsx":"4d26ee46288a","components/data/DataTable.jsx":"b7ea1eab673a","components/data/Pagination.jsx":"1e51b3b17b5c","components/feedback/Alert.jsx":"be768b1aba17","components/feedback/Modal.jsx":"34d1cf7f9ff6","components/feedback/StatusBadge.jsx":"7f9c3997cc5e","components/feedback/TypeBadge.jsx":"e4ad50d45458","components/forms/Checkbox.jsx":"6be98089b5a2","components/forms/FieldMessage.jsx":"7353d3dd506b","components/forms/Input.jsx":"038590d473dc","components/forms/Label.jsx":"3006e5e7a221","components/forms/PhoneInput.jsx":"640e4f1438e4","components/layout/SiteFooter.jsx":"bcb163f0f58a","components/layout/SiteHeader.jsx":"fa4c3858ecdc","ui_kits/admin/AdminApp.jsx":"bb3ce6db54e1","ui_kits/admin/ArticlesScreen.jsx":"99b4723edc27","ui_kits/admin/EditorScreen.jsx":"7e76f3dc4ce7","ui_kits/admin/LeadsScreen.jsx":"d4288c7f781d","ui_kits/admin/data.jsx":"c7d8f65be117","ui_kits/blog/ArticleScreen.jsx":"bea1ce10eb50","ui_kits/blog/BlogApp.jsx":"5db78ff47165","ui_kits/blog/LeadModal.jsx":"389b0038a661","ui_kits/blog/ListingScreen.jsx":"ae957acf36a8","ui_kits/blog/data.jsx":"f62c63899919"},"inlinedExternals":[],"unexposedExports":[{"name":"maskPhone","sourcePath":"components/forms/PhoneInput.jsx"}]} */

(() => {

const __ds_ns = (window.RioNegroDesignSystem_2f3caf = window.RioNegroDesignSystem_2f3caf || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Traçados do Lucide (lucide.dev, licença ISC), 24×24, stroke 2.
const PATHS = {
  x: [['path', {
    d: 'M18 6 6 18'
  }], ['path', {
    d: 'm6 6 12 12'
  }]],
  check: [['path', {
    d: 'M20 6 9 17l-5-5'
  }]],
  'chevron-left': [['path', {
    d: 'm15 18-6-6 6-6'
  }]],
  'chevron-right': [['path', {
    d: 'm9 18 6-6-6-6'
  }]],
  'arrow-right': [['path', {
    d: 'M5 12h14'
  }], ['path', {
    d: 'm12 5 7 7-7 7'
  }]],
  'arrow-left': [['path', {
    d: 'm12 19-7-7 7-7'
  }], ['path', {
    d: 'M19 12H5'
  }]],
  'circle-alert': [['circle', {
    cx: 12,
    cy: 12,
    r: 10
  }], ['line', {
    x1: 12,
    x2: 12,
    y1: 8,
    y2: 12
  }], ['line', {
    x1: 12,
    x2: 12.01,
    y1: 16,
    y2: 16
  }]],
  'circle-check': [['circle', {
    cx: 12,
    cy: 12,
    r: 10
  }], ['path', {
    d: 'm9 12 2 2 4-4'
  }]],
  'triangle-alert': [['path', {
    d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3'
  }], ['path', {
    d: 'M12 9v4'
  }], ['path', {
    d: 'M12 17h.01'
  }]],
  loader: [['path', {
    d: 'M21 12a9 9 0 1 1-6.219-8.56'
  }]],
  'file-text': [['path', {
    d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z'
  }], ['path', {
    d: 'M14 2v4a2 2 0 0 0 2 2h4'
  }], ['path', {
    d: 'M10 9H8'
  }], ['path', {
    d: 'M16 13H8'
  }], ['path', {
    d: 'M16 17H8'
  }]],
  'align-left': [['path', {
    d: 'M15 12H3'
  }], ['path', {
    d: 'M17 18H3'
  }], ['path', {
    d: 'M21 6H3'
  }]],
  pencil: [['path', {
    d: 'M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'
  }], ['path', {
    d: 'm15 5 4 4'
  }]],
  trash: [['path', {
    d: 'M3 6h18'
  }], ['path', {
    d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'
  }], ['path', {
    d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'
  }], ['line', {
    x1: 10,
    x2: 10,
    y1: 11,
    y2: 17
  }], ['line', {
    x1: 14,
    x2: 14,
    y1: 11,
    y2: 17
  }]],
  download: [['path', {
    d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'
  }], ['polyline', {
    points: '7 10 12 15 17 10'
  }], ['line', {
    x1: 12,
    x2: 12,
    y1: 15,
    y2: 3
  }]],
  'external-link': [['path', {
    d: 'M15 3h6v6'
  }], ['path', {
    d: 'M10 14 21 3'
  }], ['path', {
    d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6'
  }]],
  send: [['path', {
    d: 'M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z'
  }], ['path', {
    d: 'm21.854 2.147-10.94 10.939'
  }]],
  plus: [['path', {
    d: 'M5 12h14'
  }], ['path', {
    d: 'M12 5v14'
  }]],
  search: [['circle', {
    cx: 11,
    cy: 11,
    r: 8
  }], ['path', {
    d: 'm21 21-4.3-4.3'
  }]],
  eye: [['path', {
    d: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0'
  }], ['circle', {
    cx: 12,
    cy: 12,
    r: 3
  }]],
  'rotate-ccw': [['path', {
    d: 'M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8'
  }], ['path', {
    d: 'M3 3v5h5'
  }]]
};
function Icon({
  name,
  size = 20,
  className = '',
  label,
  ...rest
}) {
  const parts = PATHS[name] || [];
  return /*#__PURE__*/React.createElement("svg", _extends({
    className: 'rn-icon ' + (name === 'loader' ? 'rn-spinner ' : '') + className,
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    role: label ? 'img' : undefined,
    "aria-label": label,
    "aria-hidden": label ? undefined : true
  }, rest), parts.map(([tag, attrs], i) => React.createElement(tag, {
    key: i,
    ...attrs
  })));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  block = false,
  iconLeft,
  iconRight,
  iconOnly,
  label,
  href,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const cls = ['rn-btn', 'rn-btn--' + variant, size === 'sm' ? 'rn-btn--sm' : '', block ? 'rn-btn--block' : '', iconOnly ? 'rn-btn--icon' : '', className].filter(Boolean).join(' ');
  const iconSize = size === 'sm' ? 16 : 20;
  const content = /*#__PURE__*/React.createElement(React.Fragment, null, loading ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "loader",
    size: iconSize
  }) : iconOnly || iconLeft ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconOnly || iconLeft,
    size: iconSize
  }) : null, iconOnly ? /*#__PURE__*/React.createElement("span", {
    className: "rn-visually-hidden"
  }, label) : children, !loading && iconRight && !iconOnly ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: iconSize
  }) : null);
  if (href && !disabled) {
    return /*#__PURE__*/React.createElement("a", _extends({
      className: cls,
      href: href,
      "aria-label": iconOnly ? label : undefined
    }, rest), content);
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    disabled: disabled,
    "aria-busy": loading || undefined,
    "aria-label": iconOnly ? label : undefined,
    onClick: loading ? e => e.preventDefault() : rest.onClick
  }, rest, loading ? {
    onClick: e => e.preventDefault()
  } : {}), content);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/LoadMoreButton.jsx
try { (() => {
function LoadMoreButton({
  loading = false,
  done = false,
  error = false,
  onClick,
  doneText = 'Você viu todos os artigos.'
}) {
  if (done) return /*#__PURE__*/React.createElement("div", {
    className: "rn-loadmore"
  }, /*#__PURE__*/React.createElement("p", {
    className: "rn-msg"
  }, doneText));
  return /*#__PURE__*/React.createElement("div", {
    className: "rn-loadmore"
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    loading: loading,
    onClick: onClick,
    iconLeft: error ? 'rotate-ccw' : undefined
  }, loading ? 'Carregando…' : error ? 'Tentar novamente' : 'Carregar mais'), error ? /*#__PURE__*/React.createElement("p", {
    className: "rn-msg rn-msg--error",
    role: "alert"
  }, "N\xE3o foi poss\xEDvel carregar mais artigos.") : null, /*#__PURE__*/React.createElement("span", {
    className: "rn-visually-hidden",
    "aria-live": "polite"
  }, loading ? 'Carregando mais artigos' : ''));
}
Object.assign(__ds_scope, { LoadMoreButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/LoadMoreButton.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
function DataTable({
  columns = [],
  rows = [],
  loading = false,
  emptyMessage = 'Nenhum item encontrado.',
  caption,
  footer,
  rowKey = 'id',
  hoverRow
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "rn-table-wrap"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rn-table-scroll"
  }, /*#__PURE__*/React.createElement("table", {
    className: "rn-table"
  }, caption ? /*#__PURE__*/React.createElement("caption", {
    className: "rn-visually-hidden"
  }, caption) : null, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    scope: "col",
    style: {
      width: c.width,
      textAlign: c.align || 'left'
    }
  }, c.label)))), /*#__PURE__*/React.createElement("tbody", {
    "aria-busy": loading || undefined
  }, loading ? [0, 1, 2].map(i => /*#__PURE__*/React.createElement("tr", {
    key: 's' + i
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key
  }, /*#__PURE__*/React.createElement("span", {
    className: "rn-skel",
    style: {
      height: 16,
      width: c.align === 'right' ? 64 : '70%',
      marginLeft: c.align === 'right' ? 'auto' : 0
    }
  }))))) : rows.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    className: "rn-table__empty",
    colSpan: columns.length
  }, emptyMessage)) : rows.map((r, i) => /*#__PURE__*/React.createElement("tr", {
    key: r[rowKey] ?? i,
    className: hoverRow === i ? 'is-hover' : undefined
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    className: c.muted ? 'rn-table__muted' : undefined,
    style: {
      textAlign: c.align || 'left'
    }
  }, c.render ? c.render(r) : r[c.key]))))))), footer ? /*#__PURE__*/React.createElement("div", {
    className: "rn-table-foot"
  }, footer) : null);
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/Pagination.jsx
try { (() => {
function pages(cur, total) {
  if (total <= 7) return Array.from({
    length: total
  }, (_, i) => i + 1);
  const s = new Set([1, total, cur - 1, cur, cur + 1]);
  const arr = [...s].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  arr.forEach((p, i) => {
    if (i && p - arr[i - 1] > 1) out.push('…' + i);
    out.push(p);
  });
  return out;
}
function Pagination({
  page = 1,
  totalPages = 1,
  total,
  pageSize = 10,
  onChange = () => {}
}) {
  const from = (page - 1) * pageSize + 1;
  const to = total ? Math.min(page * pageSize, total) : page * pageSize;
  return /*#__PURE__*/React.createElement(React.Fragment, null, total != null ? /*#__PURE__*/React.createElement("span", {
    className: "rn-pager__info"
  }, "Mostrando ", from, "\u2013", to, " de ", total) : /*#__PURE__*/React.createElement("span", null), /*#__PURE__*/React.createElement("nav", {
    className: "rn-pager",
    "aria-label": "Pagina\xE7\xE3o"
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    size: "sm",
    iconOnly: "chevron-left",
    label: "P\xE1gina anterior",
    disabled: page <= 1,
    onClick: () => onChange(page - 1)
  }), pages(page, totalPages).map(p => typeof p === 'string' ? /*#__PURE__*/React.createElement("span", {
    key: p,
    className: "rn-pager__gap",
    "aria-hidden": "true"
  }, "\u2026") : /*#__PURE__*/React.createElement(__ds_scope.Button, {
    key: p,
    variant: "ghost",
    size: "sm",
    className: "rn-pager__page",
    "aria-current": p === page ? 'page' : undefined,
    onClick: () => onChange(p)
  }, p)), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    size: "sm",
    iconOnly: "chevron-right",
    label: "Pr\xF3xima p\xE1gina",
    disabled: page >= totalPages,
    onClick: () => onChange(page + 1)
  })));
}
Object.assign(__ds_scope, { Pagination });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Pagination.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Alert.jsx
try { (() => {
const ICONS = {
  success: 'circle-check',
  error: 'circle-alert',
  warning: 'triangle-alert'
};
function Alert({
  variant = 'success',
  title,
  children,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: 'rn-alert rn-alert--' + variant + ' ' + className,
    role: variant === 'error' ? 'alert' : 'status'
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ICONS[variant],
    size: 20
  }), /*#__PURE__*/React.createElement("div", {
    className: "rn-alert__body"
  }, title ? /*#__PURE__*/React.createElement("strong", {
    className: "rn-alert__title"
  }, title) : null, children ? /*#__PURE__*/React.createElement("div", null, children) : null));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Alert.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
const {
  useEffect,
  useRef
} = React;
function Modal({
  open = true,
  onClose,
  title,
  children,
  footer,
  inline = false,
  mobile = false,
  className = ''
}) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open || inline) return;
    const prev = document.activeElement;
    const onKey = e => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', onKey);
    const t = setTimeout(() => {
      const el = ref.current && ref.current.querySelector('input,button:not(.rn-modal__close),a,select,textarea');
      (el || ref.current)?.focus();
    }, 0);
    const ov = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = ov;
      prev && prev.focus && prev.focus();
    };
  }, [open, inline]);
  if (!open) return null;
  const tid = 'modal-title';
  const dialog = /*#__PURE__*/React.createElement("div", {
    ref: ref,
    className: 'rn-modal ' + (mobile ? 'rn-modal--mobile ' : '') + className,
    role: "dialog",
    "aria-modal": inline ? undefined : true,
    "aria-labelledby": tid,
    tabIndex: -1
  }, /*#__PURE__*/React.createElement("div", {
    className: "rn-modal__head"
  }, /*#__PURE__*/React.createElement("h2", {
    id: tid,
    className: "rn-modal__title"
  }, title), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "ghost",
    iconOnly: "x",
    label: "Fechar",
    className: "rn-modal__close",
    onClick: onClose
  })), /*#__PURE__*/React.createElement("div", {
    className: "rn-modal__body"
  }, children), footer ? /*#__PURE__*/React.createElement("div", {
    className: "rn-modal__foot"
  }, footer) : null);
  if (inline) return dialog;
  return /*#__PURE__*/React.createElement("div", {
    className: "rn-overlay",
    onMouseDown: e => {
      if (e.target === e.currentTarget && onClose) onClose();
    }
  }, dialog);
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/feedback/StatusBadge.jsx
try { (() => {
const MAP = {
  disabled: ['rn-badge--disabled', 'Desativado'],
  pending: ['rn-badge--pending', 'Pendente'],
  sent: ['rn-badge--sent', 'Enviado'],
  failed: ['rn-badge--failed', 'Falhou']
};
function StatusBadge({
  status = 'pending',
  children
}) {
  const [cls, text] = MAP[status] || MAP.pending;
  return /*#__PURE__*/React.createElement("span", {
    className: 'rn-badge ' + cls
  }, /*#__PURE__*/React.createElement("span", {
    className: "rn-badge__dot",
    "aria-hidden": "true"
  }), children || text);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/feedback/TypeBadge.jsx
try { (() => {
function TypeBadge({
  type = 'pdf'
}) {
  const pdf = type === 'pdf';
  return /*#__PURE__*/React.createElement("span", {
    className: 'rn-badge ' + (pdf ? 'rn-badge--pdf' : 'rn-badge--text')
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: pdf ? 'file-text' : 'align-left',
    size: 14
  }), pdf ? 'PDF' : 'Texto');
}
Object.assign(__ds_scope, { TypeBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/TypeBadge.jsx", error: String((e && e.message) || e) }); }

// components/content/ArticleCard.jsx
try { (() => {
function ArticleCard({
  href = '#',
  title,
  date,
  type = 'pdf',
  cover,
  coverAlt = '',
  loading = false,
  className = ''
}) {
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      className: 'rn-card rn-card--loading ' + className,
      "aria-busy": "true",
      "aria-label": "Carregando artigo"
    }, /*#__PURE__*/React.createElement("div", {
      className: "rn-card__media"
    }), /*#__PURE__*/React.createElement("div", {
      className: "rn-card__body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "rn-skel",
      style: {
        width: 96,
        height: 16
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "rn-skel",
      style: {
        width: '92%',
        height: 20
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "rn-skel",
      style: {
        width: '64%',
        height: 20
      }
    })));
  }
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    className: 'rn-card ' + className
  }, /*#__PURE__*/React.createElement("div", {
    className: "rn-card__media"
  }, cover ? /*#__PURE__*/React.createElement("img", {
    src: cover,
    alt: coverAlt,
    loading: "lazy"
  }) : null), /*#__PURE__*/React.createElement("div", {
    className: "rn-card__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rn-card__meta"
  }, /*#__PURE__*/React.createElement(__ds_scope.TypeBadge, {
    type: type
  }), /*#__PURE__*/React.createElement("time", null, date)), /*#__PURE__*/React.createElement("h3", {
    className: "rn-card__title"
  }, title)));
}
Object.assign(__ds_scope, { ArticleCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/ArticleCard.jsx", error: String((e && e.message) || e) }); }

// components/content/FeaturedArticleCard.jsx
try { (() => {
function FeaturedArticleCard({
  href = '#',
  title,
  excerpt,
  date,
  type = 'pdf',
  cover,
  coverAlt = '',
  loading = false,
  className = ''
}) {
  if (loading) {
    return /*#__PURE__*/React.createElement("div", {
      className: 'rn-card rn-card--featured rn-card--loading ' + className,
      "aria-busy": "true",
      "aria-label": "Carregando destaque"
    }, /*#__PURE__*/React.createElement("div", {
      className: "rn-card__media"
    }), /*#__PURE__*/React.createElement("div", {
      className: "rn-card__body"
    }, /*#__PURE__*/React.createElement("span", {
      className: "rn-skel",
      style: {
        width: 120,
        height: 16
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "rn-skel",
      style: {
        width: '90%',
        height: 28
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "rn-skel",
      style: {
        width: '70%',
        height: 28
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "rn-skel",
      style: {
        width: '100%',
        height: 16,
        marginTop: 8
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "rn-skel",
      style: {
        width: '85%',
        height: 16
      }
    })));
  }
  return /*#__PURE__*/React.createElement("a", {
    href: href,
    className: 'rn-card rn-card--featured ' + className
  }, /*#__PURE__*/React.createElement("div", {
    className: "rn-card__media"
  }, cover ? /*#__PURE__*/React.createElement("img", {
    src: cover,
    alt: coverAlt
  }) : null), /*#__PURE__*/React.createElement("div", {
    className: "rn-card__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rn-card__meta"
  }, /*#__PURE__*/React.createElement(__ds_scope.TypeBadge, {
    type: type
  }), /*#__PURE__*/React.createElement("time", null, date)), /*#__PURE__*/React.createElement("h2", {
    className: "rn-card__title"
  }, title), excerpt ? /*#__PURE__*/React.createElement("p", {
    className: "rn-card__excerpt"
  }, excerpt) : null));
}
Object.assign(__ds_scope, { FeaturedArticleCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/FeaturedArticleCard.jsx", error: String((e && e.message) || e) }); }

// components/forms/FieldMessage.jsx
try { (() => {
function FieldMessage({
  id,
  variant = 'help',
  children
}) {
  if (variant === 'error') {
    return /*#__PURE__*/React.createElement("p", {
      id: id,
      className: "rn-msg rn-msg--error"
    }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "circle-alert",
      size: 16
    }), children);
  }
  return /*#__PURE__*/React.createElement("p", {
    id: id,
    className: "rn-msg"
  }, children);
}
Object.assign(__ds_scope, { FieldMessage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FieldMessage.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useId
} = React;
function Checkbox({
  id,
  checked,
  defaultChecked,
  onChange,
  disabled = false,
  error,
  className = '',
  children,
  ...rest
}) {
  const auto = useId();
  const fid = id || 'c' + auto.replace(/:/g, '');
  return /*#__PURE__*/React.createElement("div", {
    className: ['rn-check', disabled ? 'rn-check--disabled' : '', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("label", {
    className: "rn-check__row",
    htmlFor: fid
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    type: "checkbox",
    className: "rn-check__input",
    checked: checked,
    defaultChecked: defaultChecked,
    onChange: onChange,
    disabled: disabled,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? fid + '-msg' : undefined
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "rn-check__box",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: 14
  })), /*#__PURE__*/React.createElement("span", null, children)), error ? /*#__PURE__*/React.createElement(__ds_scope.FieldMessage, {
    id: fid + '-msg',
    variant: "error"
  }, error) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Label.jsx
try { (() => {
function Label({
  htmlFor,
  optional = false,
  children,
  className = ''
}) {
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    className: 'rn-label ' + className
  }, children, optional ? /*#__PURE__*/React.createElement("span", {
    className: "rn-label__opt"
  }, " (opcional)") : null);
}
Object.assign(__ds_scope, { Label });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Label.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useId
} = React;
function Input({
  label,
  help,
  error,
  optional = false,
  id,
  className = '',
  inputClassName = '',
  ...rest
}) {
  const auto = useId();
  const fid = id || 'f' + auto.replace(/:/g, '');
  const msgId = fid + '-msg';
  return /*#__PURE__*/React.createElement("div", {
    className: 'rn-field ' + className
  }, label ? /*#__PURE__*/React.createElement(__ds_scope.Label, {
    htmlFor: fid,
    optional: optional
  }, label) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: fid,
    className: 'rn-input ' + inputClassName,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error || help ? msgId : undefined
  }, rest)), error ? /*#__PURE__*/React.createElement(__ds_scope.FieldMessage, {
    id: msgId,
    variant: "error"
  }, error) : help ? /*#__PURE__*/React.createElement(__ds_scope.FieldMessage, {
    id: msgId
  }, help) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/PhoneInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
function maskPhone(v) {
  const d = String(v || '').replace(/\D/g, '').slice(0, 11);
  if (!d.length) return '';
  if (d.length <= 2) return '(' + d;
  if (d.length <= 7) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
  return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
}
function PhoneInput({
  label = 'Celular',
  value,
  defaultValue = '',
  onChange,
  help = 'Com DDD. Ex.: (11) 91234-5678',
  ...rest
}) {
  const [inner, setInner] = useState(maskPhone(defaultValue));
  const shown = value !== undefined ? maskPhone(value) : inner;
  return /*#__PURE__*/React.createElement(__ds_scope.Input, _extends({
    label: label,
    type: "tel",
    inputMode: "numeric",
    autoComplete: "tel-national",
    placeholder: "(99) 99999-9999",
    maxLength: 15,
    help: help,
    value: shown,
    onChange: e => {
      const m = maskPhone(e.target.value);
      if (value === undefined) setInner(m);
      onChange && onChange(m, m.replace(/\D/g, ''));
    }
  }, rest));
}
Object.assign(__ds_scope, { maskPhone, PhoneInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/PhoneInput.jsx", error: String((e && e.message) || e) }); }

// components/layout/SiteFooter.jsx
try { (() => {
const DEFAULT_LEGAL = ['A Rio Negro Assessoria de Investimentos é uma empresa de assessoria de investimento registrada na Comissão de Valores Mobiliários (CVM), na forma da Resolução CVM 178/23, e atua como parceira da XP Investimentos CCTVM S.A. Na forma da legislação da CVM, o assessor de investimento pode exercer atividades complementares relacionadas aos mercados financeiro, securitário, de previdência e capitalização, desde que não conflitantes com a atividade de assessoria.', 'Os conteúdos publicados neste blog têm caráter exclusivamente informativo e não constituem oferta, solicitação de compra ou venda nem recomendação de investimento. Rentabilidade obtida no passado não representa garantia de rentabilidade futura. Investimentos envolvem riscos, inclusive de perda do capital investido. Leia o material técnico e o regulamento antes de investir.'];
function SiteFooter({
  logoSrc,
  ctaHref = 'https://www.rionegroinvestimentos.com.br',
  privacyHref = '/privacidade',
  legal = DEFAULT_LEGAL,
  year = new Date().getFullYear()
}) {
  return /*#__PURE__*/React.createElement("footer", {
    className: "rn-footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rn-footer__inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rn-footer__top"
  }, logoSrc ? /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "Rio Negro Investimentos"
  }) : /*#__PURE__*/React.createElement("span", {
    className: "rn-wordmark"
  }, "Rio Negro"), /*#__PURE__*/React.createElement("a", {
    className: "rn-footer__cta",
    href: ctaHref
  }, "Conhe\xE7a a Rio Negro ", /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "arrow-right",
    size: 16
  }))), /*#__PURE__*/React.createElement("div", {
    className: "rn-footer__legal"
  }, legal.map((p, i) => /*#__PURE__*/React.createElement("p", {
    key: i
  }, p))), /*#__PURE__*/React.createElement("div", {
    className: "rn-footer__bottom"
  }, /*#__PURE__*/React.createElement("span", null, "\xA9 ", year, " Rio Negro Assessoria de Investimentos"), /*#__PURE__*/React.createElement("a", {
    href: privacyHref
  }, "Privacidade"))));
}
Object.assign(__ds_scope, { SiteFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/SiteFooter.jsx", error: String((e && e.message) || e) }); }

// components/layout/SiteHeader.jsx
try { (() => {
function SiteHeader({
  logoSrc,
  homeHref = '/',
  links = [{
    label: 'Artigos',
    href: '/artigos'
  }],
  current = 'Artigos',
  right
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: "rn-header"
  }, /*#__PURE__*/React.createElement("div", {
    className: "rn-header__inner"
  }, /*#__PURE__*/React.createElement("a", {
    className: "rn-header__brand",
    href: homeHref,
    "aria-label": "Rio Negro \u2014 p\xE1gina inicial"
  }, logoSrc ? /*#__PURE__*/React.createElement("img", {
    src: logoSrc,
    alt: "Rio Negro Investimentos"
  }) : /*#__PURE__*/React.createElement("span", {
    className: "rn-wordmark"
  }, "Rio Negro")), /*#__PURE__*/React.createElement("nav", {
    className: "rn-header__nav",
    "aria-label": "Principal"
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    className: "rn-header__link",
    href: l.href,
    "aria-current": l.label === current ? 'page' : undefined,
    onClick: l.onClick
  }, l.label)), right)));
}
Object.assign(__ds_scope, { SiteHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/SiteHeader.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/AdminApp.jsx
try { (() => {
function AdminApp() {
  const {
    SiteHeader,
    Button
  } = window.RioNegroDesignSystem_2f3caf;
  const [view, setView] = React.useState(localStorage.getItem('rn-admin-view') || 'articles');
  const [editing, setEditing] = React.useState(null);
  const [flash, setFlash] = React.useState(null);
  const go = v => {
    setView(v);
    localStorage.setItem('rn-admin-view', v);
  };
  const nav = v => e => {
    e.preventDefault();
    setFlash(null);
    go(v);
  };
  const current = view === 'leads' ? 'Leads' : 'Artigos';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh'
    }
  }, /*#__PURE__*/React.createElement(SiteHeader, {
    logoSrc: "../../assets/logo-escuro.png",
    links: [{
      label: 'Artigos',
      href: '#',
      onClick: nav('articles')
    }, {
      label: 'Leads',
      href: '#',
      onClick: nav('leads')
    }],
    current: current,
    right: /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm"
    }, "Sair")
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 'var(--layout-admin)',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-6) var(--space-16)'
    }
  }, view === 'leads' ? /*#__PURE__*/React.createElement(LeadsScreen, null) : view === 'editor' ? /*#__PURE__*/React.createElement(EditorScreen, {
    article: editing,
    onCancel: () => go('articles'),
    onSave: m => {
      setFlash(m);
      go('articles');
    }
  }) : /*#__PURE__*/React.createElement(ArticlesScreen, {
    key: flash || 'x',
    flash: flash,
    onNew: () => {
      setEditing(null);
      go('editor');
    },
    onEdit: a => {
      setEditing(a);
      go('editor');
    }
  })));
}
window.AdminApp = AdminApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/AdminApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/ArticlesScreen.jsx
try { (() => {
function ArticlesScreen({
  onEdit,
  onNew,
  flash
}) {
  const {
    DataTable,
    Pagination,
    Button,
    TypeBadge,
    StatusBadge,
    Modal,
    Alert
  } = window.RioNegroDesignSystem_2f3caf;
  const [rows, setRows] = React.useState(window.RN_ADMIN_ARTICLES);
  const [page, setPage] = React.useState(1);
  const [del, setDel] = React.useState(null);
  const [msg, setMsg] = React.useState(flash);
  const cols = [{
    key: 'title',
    label: 'Título',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: 500
      }
    }, r.title)
  }, {
    key: 'type',
    label: 'Tipo',
    render: r => /*#__PURE__*/React.createElement(TypeBadge, {
      type: r.type
    })
  }, {
    key: 'status',
    label: 'Envio do PDF',
    render: r => /*#__PURE__*/React.createElement(StatusBadge, {
      status: r.status
    })
  }, {
    key: 'leads',
    label: 'Leads',
    align: 'right',
    muted: true
  }, {
    key: 'date',
    label: 'Publicado',
    muted: true
  }, {
    key: 'a',
    label: /*#__PURE__*/React.createElement("span", {
      className: "rn-visually-hidden"
    }, "A\xE7\xF5es"),
    align: 'right',
    render: r => /*#__PURE__*/React.createElement("div", {
      className: "rn-table__actions"
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconOnly: "eye",
      label: 'Ver ' + r.title
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconOnly: "pencil",
      label: 'Editar ' + r.title,
      onClick: () => onEdit(r)
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost",
      size: "sm",
      iconOnly: "trash",
      label: 'Excluir ' + r.title,
      onClick: () => setDel(r)
    }))
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-4)',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--font-size-2xl)',
      lineHeight: 'var(--line-height-2xl)',
      fontWeight: 600
    }
  }, "Artigos"), /*#__PURE__*/React.createElement(Button, {
    iconLeft: "plus",
    onClick: onNew
  }, "Novo artigo")), msg ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Alert, {
    variant: "success",
    title: msg
  })) : null, /*#__PURE__*/React.createElement(DataTable, {
    caption: "Artigos publicados",
    columns: cols,
    rows: rows,
    footer: /*#__PURE__*/React.createElement(Pagination, {
      page: page,
      totalPages: 5,
      total: 48,
      pageSize: 10,
      onChange: setPage
    })
  }), del ? /*#__PURE__*/React.createElement(Modal, {
    title: "Excluir artigo?",
    onClose: () => setDel(null),
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: () => setDel(null)
    }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
      onClick: () => {
        setRows(rows.filter(x => x.id !== del.id));
        setMsg('Artigo excluído.');
        setDel(null);
      }
    }, "Excluir"))
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0
    }
  }, "\u201C", del.title, "\u201D sair\xE1 do blog. Os leads captados por ele continuam dispon\xEDveis em Leads.")) : null);
}
window.ArticlesScreen = ArticlesScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/ArticlesScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/EditorScreen.jsx
try { (() => {
function EditorScreen({
  article,
  onCancel,
  onSave
}) {
  const {
    Input,
    Button,
    Checkbox,
    Alert,
    Label,
    FieldMessage
  } = window.RioNegroDesignSystem_2f3caf;
  const [title, setTitle] = React.useState(article ? article.title : '');
  const [type, setType] = React.useState(article ? article.type : 'pdf');
  const [err, setErr] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const save = e => {
    e.preventDefault();
    if (!title.trim()) {
      setErr('Informe o título do artigo.');
      return;
    }
    setErr('');
    setSaving(true);
    setTimeout(() => onSave(article ? 'Alterações salvas.' : 'Artigo publicado.'), 800);
  };
  const box = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-card)',
    boxShadow: 'var(--shadow-card)',
    padding: 'var(--space-6)',
    display: 'grid',
    gap: 'var(--space-6)'
  };
  const seg = (v, l) => /*#__PURE__*/React.createElement(Button, {
    variant: type === v ? 'primary' : 'secondary',
    size: "sm",
    onClick: () => setType(v),
    "aria-pressed": type === v
  }, l);
  return /*#__PURE__*/React.createElement("form", {
    onSubmit: save,
    noValidate: true,
    style: {
      maxWidth: 'var(--layout-reading)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    iconLeft: "arrow-left",
    onClick: onCancel
  }, "Artigos"), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 'var(--space-4) 0 var(--space-6)',
      fontSize: 'var(--font-size-2xl)',
      lineHeight: 'var(--line-height-2xl)',
      fontWeight: 600
    }
  }, article ? 'Editar artigo' : 'Novo artigo'), /*#__PURE__*/React.createElement("div", {
    style: box
  }, /*#__PURE__*/React.createElement(Input, {
    label: "T\xEDtulo",
    value: title,
    error: err,
    onChange: e => setTitle(e.target.value),
    placeholder: "Ex.: Renda fixa em 2026"
  }), /*#__PURE__*/React.createElement("div", {
    className: "rn-field"
  }, /*#__PURE__*/React.createElement(Label, null, "Tipo"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)'
    }
  }, seg('pdf', 'PDF'), seg('text', 'Texto'))), /*#__PURE__*/React.createElement(Input, {
    label: "Data de publica\xE7\xE3o",
    type: "date",
    defaultValue: "2026-09-24"
  }), /*#__PURE__*/React.createElement("div", {
    className: "rn-field"
  }, /*#__PURE__*/React.createElement(Label, {
    htmlFor: "ex"
  }, "Pr\xE9via"), /*#__PURE__*/React.createElement("textarea", {
    id: "ex",
    className: "rn-input",
    rows: "3",
    style: {
      height: 'auto',
      padding: 'var(--space-3)',
      fontFamily: 'var(--font-serif)',
      fontSize: 'var(--font-size-md)',
      lineHeight: 1.6
    },
    defaultValue: article ? 'Juros, câmbio e bolsa: como a equipe da Rio Negro está posicionando as carteiras.' : ''
  }), /*#__PURE__*/React.createElement(FieldMessage, null, "Aparece no card de destaque. At\xE9 160 caracteres.")), type === 'pdf' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Input, {
    label: "Arquivo PDF",
    type: "file",
    accept: "application/pdf",
    help: "M\xE1ximo de 20 MB."
  }), /*#__PURE__*/React.createElement(Alert, {
    variant: "warning",
    title: "O envio autom\xE1tico est\xE1 desativado."
  }, "Os leads ser\xE3o salvos, mas o PDF s\xF3 ser\xE1 enviado quando o envio for ativado abaixo."), /*#__PURE__*/React.createElement(Checkbox, null, "Enviar o PDF por e-mail automaticamente para quem preencher o formul\xE1rio.")) : null, /*#__PURE__*/React.createElement(Checkbox, {
    defaultChecked: true
  }, "Destacar no topo da listagem.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      justifyContent: 'flex-end',
      marginTop: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    onClick: onCancel,
    disabled: saving
  }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    loading: saving
  }, saving ? 'Salvando…' : article ? 'Salvar alterações' : 'Publicar')));
}
window.EditorScreen = EditorScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/EditorScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/LeadsScreen.jsx
try { (() => {
function LeadsScreen() {
  const {
    DataTable,
    Pagination,
    Button,
    StatusBadge,
    Input
  } = window.RioNegroDesignSystem_2f3caf;
  const [page, setPage] = React.useState(1);
  const [q, setQ] = React.useState('');
  const rows = window.RN_ADMIN_LEADS.filter(r => (r.name + r.email).toLowerCase().includes(q.toLowerCase()));
  const cols = [{
    key: 'name',
    label: 'Nome',
    render: r => /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontWeight: 500
      }
    }, r.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-text-muted)'
      }
    }, r.email))
  }, {
    key: 'phone',
    label: 'Celular',
    muted: true
  }, {
    key: 'article',
    label: 'Artigo'
  }, {
    key: 'status',
    label: 'Envio',
    render: r => /*#__PURE__*/React.createElement(StatusBadge, {
      status: r.status
    })
  }, {
    key: 'date',
    label: 'Recebido em',
    muted: true
  }, {
    key: 'a',
    label: /*#__PURE__*/React.createElement("span", {
      className: "rn-visually-hidden"
    }, "A\xE7\xF5es"),
    align: 'right',
    render: r => /*#__PURE__*/React.createElement("div", {
      className: "rn-table__actions"
    }, r.status === 'failed' ? /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      size: "sm",
      iconLeft: "send"
    }, "Reenviar") : null)
  }];
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 'var(--space-4)',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      marginBottom: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--font-size-2xl)',
      lineHeight: 'var(--line-height-2xl)',
      fontWeight: 600
    }
  }, "Leads"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 280
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Buscar",
    placeholder: "Nome ou e-mail",
    value: q,
    onChange: e => setQ(e.target.value)
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    iconLeft: "download"
  }, "Exportar CSV"))), /*#__PURE__*/React.createElement(DataTable, {
    caption: "Leads",
    columns: cols,
    rows: rows,
    emptyMessage: "Nenhum lead encontrado para essa busca.",
    footer: /*#__PURE__*/React.createElement(Pagination, {
      page: page,
      totalPages: 12,
      total: 117,
      pageSize: 10,
      onChange: setPage
    })
  }));
}
window.LeadsScreen = LeadsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/LeadsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/admin/data.jsx
try { (() => {
window.RN_ADMIN_ARTICLES = [{
  id: 1,
  title: 'Carta mensal: cenário e alocação para o 4º trimestre',
  type: 'pdf',
  status: 'sent',
  date: '20/09/2026',
  leads: 212
}, {
  id: 2,
  title: 'Renda fixa em 2026: o que muda com a Selic',
  type: 'pdf',
  status: 'pending',
  date: '12/09/2026',
  leads: 148
}, {
  id: 3,
  title: 'Previdência privada: PGBL ou VGBL?',
  type: 'text',
  status: 'disabled',
  date: '05/09/2026',
  leads: 0
}, {
  id: 4,
  title: 'Como montar sua reserva de emergência',
  type: 'text',
  status: 'disabled',
  date: '29/08/2026',
  leads: 0
}, {
  id: 5,
  title: 'Fundos imobiliários: panorama do segundo semestre',
  type: 'pdf',
  status: 'failed',
  date: '22/08/2026',
  leads: 97
}, {
  id: 6,
  title: 'Investir em dólar: caminhos para diversificar',
  type: 'pdf',
  status: 'sent',
  date: '15/08/2026',
  leads: 131
}];
window.RN_ADMIN_LEADS = [{
  id: 1,
  name: 'Maria Souza',
  email: 'maria.souza@exemplo.com.br',
  phone: '(11) 98765-4321',
  article: 'Carta mensal — setembro',
  status: 'sent',
  date: '21/09/2026 09:14'
}, {
  id: 2,
  name: 'João Pereira',
  email: 'joao.p@exemplo.com.br',
  phone: '(21) 99123-4567',
  article: 'Renda fixa em 2026',
  status: 'pending',
  date: '21/09/2026 08:52'
}, {
  id: 3,
  name: 'Ana Lima',
  email: 'ana.lima@exemplo.com.br',
  phone: '(31) 98888-1122',
  article: 'Fundos imobiliários',
  status: 'failed',
  date: '20/09/2026 18:03'
}, {
  id: 4,
  name: 'Carlos Mendes',
  email: 'carlos.m@exemplo.com.br',
  phone: '(11) 97777-3344',
  article: 'Carta mensal — setembro',
  status: 'sent',
  date: '20/09/2026 16:40'
}, {
  id: 5,
  name: 'Beatriz Rocha',
  email: 'bia.rocha@exemplo.com.br',
  phone: '(41) 99666-5566',
  article: 'Investir em dólar',
  status: 'sent',
  date: '20/09/2026 11:27'
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/admin/data.jsx", error: String((e && e.message) || e) }); }

// ui_kits/blog/ArticleScreen.jsx
try { (() => {
function ArticleScreen({
  article,
  onBack
}) {
  const {
    Button,
    TypeBadge,
    Alert
  } = window.RioNegroDesignSystem_2f3caf;
  const [modal, setModal] = React.useState(false);
  const [sent, setSent] = React.useState(null);
  const pdf = article.type === 'pdf';
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 'var(--layout-reading)',
      margin: '0 auto',
      padding: 'var(--space-8) var(--space-4) var(--space-16)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "link",
    iconLeft: "arrow-left",
    onClick: onBack
  }, "Todos os artigos"), /*#__PURE__*/React.createElement("header", {
    style: {
      margin: 'var(--space-8) 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      alignItems: 'center',
      fontSize: 'var(--font-size-xs)',
      color: 'var(--color-text-muted)',
      marginBottom: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(TypeBadge, {
    type: article.type
  }), /*#__PURE__*/React.createElement("time", null, article.date), pdf ? /*#__PURE__*/React.createElement("span", null, "\xB7 ", article.pages, " p\xE1ginas") : /*#__PURE__*/React.createElement("span", null, "\xB7 5 min de leitura")), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontSize: 'var(--font-size-h1)',
      lineHeight: 'var(--line-height-tight)',
      fontWeight: 700,
      textWrap: 'balance'
    }
  }, article.title)), /*#__PURE__*/React.createElement("div", {
    style: {
      aspectRatio: '16/9',
      background: 'var(--color-surface-muted)',
      borderRadius: 'var(--radius-card)',
      marginBottom: 'var(--space-8)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "rn-article"
  }, /*#__PURE__*/React.createElement("p", null, article.excerpt), pdf ? /*#__PURE__*/React.createElement("p", null, "Neste material, a equipe da Rio Negro re\xFAne os dados mais recentes, explica o contexto e mostra como isso se traduz em decis\xF5es pr\xE1ticas para diferentes perfis de investidor.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("p", null, "Antes de escolher, vale entender como cada modalidade \xE9 tributada e em que situa\xE7\xE3o ela faz mais sentido. A decis\xE3o depende principalmente do modelo de declara\xE7\xE3o do Imposto de Renda e do seu horizonte de investimento."), /*#__PURE__*/React.createElement("h2", null, "Quem declara pelo modelo completo"), /*#__PURE__*/React.createElement("p", null, "O PGBL permite deduzir as contribui\xE7\xF5es da base de c\xE1lculo do IR, at\xE9 o limite de 12% da renda bruta tribut\xE1vel. Em contrapartida, o imposto no resgate incide sobre o valor total acumulado."), /*#__PURE__*/React.createElement("h2", null, "Quem declara pelo modelo simplificado"), /*#__PURE__*/React.createElement("p", null, "Para quem usa o modelo simplificado ou j\xE1 ultrapassou o limite de 12%, o VGBL costuma ser mais adequado: o imposto no resgate incide apenas sobre os rendimentos."), /*#__PURE__*/React.createElement("blockquote", null, "Previd\xEAncia \xE9 um investimento de longo prazo. A escolha do regime de tributa\xE7\xE3o \u2014 progressivo ou regressivo \u2014 pesa tanto quanto a modalidade."), /*#__PURE__*/React.createElement("p", null, "Converse com seu assessor para simular os dois cen\xE1rios com os seus n\xFAmeros."))), pdf ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'var(--space-8)',
      padding: 'var(--space-6)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-card)',
      boxShadow: 'var(--shadow-card)',
      display: 'grid',
      gap: 'var(--space-4)'
    }
  }, sent ? /*#__PURE__*/React.createElement(Alert, {
    variant: "success",
    title: "Pronto! O PDF foi enviado."
  }, "Enviamos o artigo para ", sent.email, ". Confira sua caixa de entrada em alguns minutos.") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", {
    style: {
      fontSize: 'var(--font-size-md)'
    }
  }, "Leia o artigo completo"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 'var(--space-1) 0 0',
      color: 'var(--color-text-muted)'
    }
  }, "PDF com ", article.pages, " p\xE1ginas, enviado gratuitamente para o seu e-mail.")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Button, {
    iconRight: "download",
    onClick: () => setModal(true)
  }, "Receber PDF")))) : null, modal ? /*#__PURE__*/React.createElement(LeadModal, {
    article: article,
    onClose: () => setModal(false),
    onDone: v => {
      setModal(false);
      setSent(v);
    }
  }) : null);
}
window.ArticleScreen = ArticleScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/blog/ArticleScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/blog/BlogApp.jsx
try { (() => {
function BlogApp() {
  const {
    SiteHeader,
    SiteFooter
  } = window.RioNegroDesignSystem_2f3caf;
  const [article, setArticle] = React.useState(() => {
    const id = localStorage.getItem('rn-blog-article');
    return window.RN_ARTICLES.find(a => a.id === id) || null;
  });
  const open = a => {
    setArticle(a);
    a ? localStorage.setItem('rn-blog-article', a.id) : localStorage.removeItem('rn-blog-article');
    window.scrollTo(0, 0);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(SiteHeader, {
    logoSrc: "../../assets/logo-escuro.png",
    links: [{
      label: 'Artigos',
      href: '#',
      onClick: e => {
        e.preventDefault();
        open(null);
      }
    }],
    current: article ? '' : 'Artigos'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, article ? /*#__PURE__*/React.createElement(ArticleScreen, {
    article: article,
    onBack: () => open(null)
  }) : /*#__PURE__*/React.createElement(ListingScreen, {
    onOpen: open
  })), /*#__PURE__*/React.createElement(SiteFooter, {
    logoSrc: "../../assets/logo-escuro.png",
    year: 2026
  }));
}
window.BlogApp = BlogApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/blog/BlogApp.jsx", error: String((e && e.message) || e) }); }

// ui_kits/blog/LeadModal.jsx
try { (() => {
function LeadModal({
  article,
  onClose,
  onDone
}) {
  const {
    Modal,
    Button,
    Input,
    PhoneInput,
    Checkbox,
    Alert
  } = window.RioNegroDesignSystem_2f3caf;
  const [v, setV] = React.useState({
    name: '',
    email: '',
    phone: '',
    ok: false
  });
  const [err, setErr] = React.useState({});
  const [sending, setSending] = React.useState(false);
  const [fail, setFail] = React.useState(false);
  const submit = e => {
    e.preventDefault();
    const x = {};
    if (!v.name.trim()) x.name = 'Informe seu nome.';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email)) x.email = 'Informe um e-mail válido, como nome@exemplo.com.br.';
    if (v.phone.replace(/\D/g, '').length !== 11) x.phone = 'Informe um celular com DDD, 11 dígitos.';
    if (!v.ok) x.ok = 'Você precisa aceitar a Política de Privacidade para continuar.';
    setErr(x);
    if (Object.keys(x).length) return;
    setSending(true);
    setFail(false);
    setTimeout(() => {
      setSending(false);
      if (v.email.includes('erro')) setFail(true);else onDone(v);
    }, 900);
  };
  return /*#__PURE__*/React.createElement(Modal, {
    title: "Receba o artigo completo",
    onClose: onClose,
    footer: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
      variant: "secondary",
      onClick: onClose,
      disabled: sending
    }, "Cancelar"), /*#__PURE__*/React.createElement(Button, {
      type: "submit",
      form: "lead",
      loading: sending
    }, sending ? 'Enviando…' : 'Receber PDF'))
  }, /*#__PURE__*/React.createElement("form", {
    id: "lead",
    onSubmit: submit,
    noValidate: true,
    style: {
      display: 'grid',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      color: 'var(--color-text-muted)'
    }
  }, "Enviaremos \u201C", article.title, "\u201D para o seu e-mail."), fail ? /*#__PURE__*/React.createElement(Alert, {
    variant: "error",
    title: "N\xE3o foi poss\xEDvel enviar."
  }, "Verifique sua conex\xE3o e tente novamente.") : null, /*#__PURE__*/React.createElement(Input, {
    label: "Nome",
    autoComplete: "name",
    value: v.name,
    error: err.name,
    onChange: e => setV({
      ...v,
      name: e.target.value
    })
  }), /*#__PURE__*/React.createElement(Input, {
    label: "E-mail",
    type: "email",
    autoComplete: "email",
    value: v.email,
    error: err.email,
    onChange: e => setV({
      ...v,
      email: e.target.value
    })
  }), /*#__PURE__*/React.createElement(PhoneInput, {
    value: v.phone,
    error: err.phone,
    onChange: m => setV({
      ...v,
      phone: m
    })
  }), /*#__PURE__*/React.createElement(Checkbox, {
    checked: v.ok,
    error: err.ok,
    onChange: e => setV({
      ...v,
      ok: e.target.checked
    })
  }, "Li e concordo com a ", /*#__PURE__*/React.createElement("a", {
    href: "#privacidade",
    onClick: e => e.preventDefault()
  }, "Pol\xEDtica de Privacidade"), " e autorizo a Rio Negro Assessoria de Investimentos a entrar em contato por e-mail, telefone e WhatsApp com conte\xFAdos sobre investimentos.")));
}
window.LeadModal = LeadModal;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/blog/LeadModal.jsx", error: String((e && e.message) || e) }); }

// ui_kits/blog/ListingScreen.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function ListingScreen({
  onOpen
}) {
  const {
    FeaturedArticleCard,
    ArticleCard,
    LoadMoreButton
  } = window.RioNegroDesignSystem_2f3caf;
  const all = window.RN_ARTICLES;
  const [count, setCount] = React.useState(4);
  const [loading, setLoading] = React.useState(false);
  const rest = all.slice(1, 1 + count);
  const more = () => {
    setLoading(true);
    setTimeout(() => {
      setCount(c => c + 4);
      setLoading(false);
    }, 700);
  };
  const go = a => e => {
    e.preventDefault();
    onOpen(a);
  };
  return /*#__PURE__*/React.createElement("main", {
    style: {
      maxWidth: 'var(--layout-admin)',
      margin: '0 auto',
      padding: 'var(--space-12) var(--space-4) var(--space-16)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: '0 0 var(--space-2)',
      fontSize: 'var(--font-size-h1)',
      lineHeight: 'var(--line-height-tight)',
      fontWeight: 700
    }
  }, "Artigos"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 var(--space-8)',
      color: 'var(--color-text-muted)',
      fontSize: 'var(--font-size-md)',
      maxWidth: '60ch'
    }
  }, "An\xE1lises e guias da equipe da Rio Negro sobre investimentos, mercado e planejamento financeiro."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 'var(--space-8)'
    },
    onClick: go(all[0])
  }, /*#__PURE__*/React.createElement(FeaturedArticleCard, _extends({
    href: '#' + all[0].id
  }, all[0]))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
      gap: 'var(--space-6)',
      marginBottom: 'var(--space-12)'
    }
  }, rest.map(a => /*#__PURE__*/React.createElement("div", {
    key: a.id,
    onClick: go(a),
    style: {
      display: 'grid'
    }
  }, /*#__PURE__*/React.createElement(ArticleCard, _extends({
    href: '#' + a.id
  }, a)))), loading ? [0, 1, 2].map(i => /*#__PURE__*/React.createElement(ArticleCard, {
    key: 'l' + i,
    loading: true
  })) : null), /*#__PURE__*/React.createElement(LoadMoreButton, {
    loading: loading,
    done: 1 + count >= all.length,
    onClick: more
  }));
}
window.ListingScreen = ListingScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/blog/ListingScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/blog/data.jsx
try { (() => {
window.RN_ARTICLES = [{
  id: 'carta-setembro',
  type: 'pdf',
  date: '20 set. 2026',
  title: 'Carta mensal: cenário e alocação para o 4º trimestre',
  excerpt: 'Juros, câmbio e bolsa: como a equipe da Rio Negro está posicionando as carteiras para o fim do ano.',
  pages: 14
}, {
  id: 'renda-fixa-2026',
  type: 'pdf',
  date: '12 set. 2026',
  title: 'Renda fixa em 2026: o que muda com a Selic',
  excerpt: 'Pós-fixados, prefixados e IPCA+: onde estão as oportunidades com os juros em patamar restritivo.',
  pages: 9
}, {
  id: 'pgbl-vgbl',
  type: 'text',
  date: '5 set. 2026',
  title: 'Previdência privada: PGBL ou VGBL?',
  excerpt: 'A escolha depende de como você declara o Imposto de Renda. Entenda a diferença em poucos minutos.'
}, {
  id: 'reserva',
  type: 'text',
  date: '29 ago. 2026',
  title: 'Como montar sua reserva de emergência',
  excerpt: 'Quanto guardar, onde deixar o dinheiro e por que liquidez importa mais do que rentabilidade aqui.'
}, {
  id: 'fiis',
  type: 'pdf',
  date: '22 ago. 2026',
  title: 'Fundos imobiliários: panorama do segundo semestre',
  excerpt: 'Tijolo, papel e fundos de fundos: o que acompanhar nos relatórios gerenciais.',
  pages: 11
}, {
  id: 'dolar',
  type: 'pdf',
  date: '15 ago. 2026',
  title: 'Investir em dólar: caminhos para diversificar',
  excerpt: 'BDRs, fundos cambiais e conta global: custos, tributação e riscos de cada alternativa.',
  pages: 8
}, {
  id: 'tesouro',
  type: 'text',
  date: '8 ago. 2026',
  title: 'Tesouro Direto para iniciantes',
  excerpt: 'Os tipos de título, como comprar e o que acontece se você precisar vender antes do vencimento.'
}, {
  id: 'isencao',
  type: 'pdf',
  date: '1 ago. 2026',
  title: 'LCI, LCA, CRI e CRA: guia dos isentos de IR',
  excerpt: 'Quando a isenção compensa e como comparar com um CDB tributado.',
  pages: 6
}, {
  id: 'rebalanceamento',
  type: 'text',
  date: '25 jul. 2026',
  title: 'Rebalanceamento: quando e como ajustar a carteira',
  excerpt: 'Uma rotina simples para manter o risco da carteira alinhado ao seu perfil.'
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/blog/data.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.LoadMoreButton = __ds_scope.LoadMoreButton;

__ds_ns.ArticleCard = __ds_scope.ArticleCard;

__ds_ns.FeaturedArticleCard = __ds_scope.FeaturedArticleCard;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Pagination = __ds_scope.Pagination;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.TypeBadge = __ds_scope.TypeBadge;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.FieldMessage = __ds_scope.FieldMessage;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Label = __ds_scope.Label;

__ds_ns.PhoneInput = __ds_scope.PhoneInput;

__ds_ns.SiteFooter = __ds_scope.SiteFooter;

__ds_ns.SiteHeader = __ds_scope.SiteHeader;

})();
