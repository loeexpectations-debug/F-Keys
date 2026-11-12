(() => {
  "use strict";
  const id = "f-keys-overlay-5cc9";
  const previous = document.getElementById(id);
  if (previous) {
    previous.dispatchEvent(new Event("f-keys-close"));
    return;
  }

  const host = document.createElement("div");
  host.id = id;
  const root = host.attachShadow({ mode: "open" });
  const panel = document.createElement("section");
  panel.setAttribute("aria-label", "F Keys toolbar");
  const header = document.createElement("header");
  const title = document.createElement("strong");
  title.textContent = "F Keys";
  const keys = document.createElement("div");
  keys.className = "keys";
  const status = document.createElement("output");
  status.setAttribute("aria-live", "polite");
  header.append(title);
  panel.append(header, keys, status);
  root.append(panel);

  const sheet = new CSSStyleSheet();
  sheet.replaceSync(`
    :host { all: initial !important; position:fixed !important; z-index:2147483647 !important;
      inset:auto !important; left:50% !important; transform:translateX(-50%) !important;
      bottom:max(8px,env(safe-area-inset-bottom)) !important; width:max-content !important;
      max-width:calc(100% - 16px) !important; padding:0 !important; margin:0 !important;
      background:transparent !important; border:0 !important; color-scheme:dark; }
    :host([data-top]) { top:max(8px,env(safe-area-inset-top)) !important; bottom:auto !important; }
    :host([data-folded]) { left:auto !important; right:max(8px,env(safe-area-inset-right)) !important;
      transform:none !important; }
    .launcher { display:none; min-height:44px; padding:0 15px; background:#172332;
      color:#baf7e7; border-radius:18px; box-shadow:0 4px 18px #08122055; }
    :host([data-folded]) .launcher { display:block; }
    :host([data-folded]) section { display:none; }
    section { box-sizing:border-box; padding:8px; border:1px solid #42566b; border-radius:14px;
      background:#172332; color:#fff; box-shadow:0 6px 24px #08122055;
      font:500 15px/1.2 system-ui,sans-serif; direction:ltr; text-align:left; }
    header { display:flex; gap:4px; align-items:center; margin-bottom:5px; }
    strong { margin-right:auto; padding-left:6px; font-size:15px; }
    button { box-sizing:border-box; min-width:0; min-height:44px; cursor:pointer; touch-action:manipulation;
      border:1px solid #4b6076; border-bottom-width:2px; border-radius:7px; background:#2d4054;
      color:#fff; font:600 15px/1 system-ui,sans-serif; }
    header button { padding:0 10px; min-height:32px; font:500 13px/1 system-ui,sans-serif;
      border:0; background:transparent; color:#c7d9eb; }
    .keys { display:grid; grid-template-columns:repeat(12,44px) 76px; gap:4px; }
    .enter { background:#9eead8; border-color:#6bb6a7; color:#102e2a; }
    button:active { filter:brightness(1.3); }
    button:focus-visible { outline:2px solid white; outline-offset:1px; }
    output { display:block; max-width:32em; font:500 13px/1.35 system-ui,sans-serif; margin:6px 4px 0; }
    output:empty { display:none; }
    @media(max-width:710px) {
      .keys { grid-template-columns:repeat(6,minmax(0,1fr)); }
      section { width:min(342px,calc(100vw - 18px)); }
      .enter { grid-column:1 / -1; }
    }
    @media(max-height:400px) and (min-width:430px) {
      .keys { grid-template-columns:repeat(7,minmax(0,1fr)); }
      section { width:min(480px,calc(100vw - 18px)); }
      .enter { grid-column:span 2; }
    }
  `);
  root.adoptedStyleSheets = [sheet];

  function button(label, parent, onClick) {
    const control = document.createElement("button");
    control.type = "button";
    control.textContent = label;
    control.addEventListener("click", onClick);
    parent.append(control);
    return control;
  }

  const move = button("Move to top", header, () => {
    host.toggleAttribute("data-top");
    updateMoveLabel();
  });
  function updateMoveLabel() {
    move.textContent = host.hasAttribute("data-top") ? "Move to bottom" : "Move to top";
  }
  host.toggleAttribute("data-top", matchMedia("(max-width:710px)").matches);
  updateMoveLabel();

  // Follow focus into ordinary frames and open shadow trees without crossing origins.
  function pageTarget() {
    let node = document.activeElement || document.body;
    while (node) {
      if (node === host) return lastTarget?.isConnected ? lastTarget : document.body;
      if (node.localName === "iframe" || node.localName === "frame") {
        if (!node.contentDocument) return null;
        node = node.contentDocument.activeElement || node.contentDocument.body;
      } else if (node.shadowRoot?.activeElement) {
        node = node.shadowRoot.activeElement;
      } else {
        return node;
      }
    }
    return null;
  }
  let lastTarget = null;
  lastTarget = pageTarget();
  function rememberFocus(event) {
    if (event.target !== host) lastTarget = pageTarget();
  }
  document.addEventListener("focusin", rememberFocus, true);
  function close() {
    document.removeEventListener("focusin", rememberFocus, true);
    host.remove();
  }
  host.addEventListener("f-keys-close", close, { once: true });
  const launcher = button("F Keys", root, () => setFolded(false));
  launcher.className = "launcher";
  launcher.setAttribute("aria-label", "Open F Keys toolbar");
  const fold = button("Minimize", header, () => setFolded(true));
  function setFolded(folded) {
    const toolbarHadFocus = document.activeElement === host;
    host.toggleAttribute("data-folded", folded);
    if (toolbarHadFocus) (folded ? launcher : fold).focus({ preventScroll: true });
  }
  button("Close", header, close);

  // A pointer tap should preserve the site's focus, caret and selection.
  for (const type of ["pointerdown", "mousedown"]) {
    root.addEventListener(type, event => {
      event.preventDefault();
      event.stopPropagation();
    });
  }
  for (const type of ["click", "keydown", "keyup", "keypress"]) {
    root.addEventListener(type, event => event.stopPropagation());
  }

  const blockingInputTypes = new Set([
    "text", "search", "url", "tel", "email", "password", "date", "month",
    "week", "time", "datetime-local", "number"
  ]);

  function enterDefault(target) {
    if (target.matches("a[href],button:not(:disabled),input:is([type=submit],[type=reset],[type=button],[type=image]):not(:disabled),summary")) {
      target.click();
      return;
    }
    const doc = target.ownerDocument;
    if (target.isContentEditable || (target.localName === "textarea" && !target.readOnly && !target.disabled)) {
      target.focus({ preventScroll: true });
      doc.execCommand(target.isContentEditable ? "insertParagraph" : "insertText", false, "\n");
      return;
    }
    const form = target.form;
    if (target.localName !== "input" || !form || !blockingInputTypes.has(target.type) || target.disabled) return;
    // Include submit/image buttons associated via a form attribute outside the form.
    const controls = target.getRootNode().querySelectorAll("button,input");
    const submitter = Array.from(controls).find(node =>
      node.form === form && (node.type === "submit" || node.type === "image"));
    if (submitter) {
      if (!submitter.matches(":disabled")) submitter.click();
    } else {
      const blockers = Array.from(form.elements).filter(node =>
        node.localName === "input" && blockingInputTypes.has(node.type));
      if (blockers.length === 1) form.requestSubmit();
    }
  }

  function sendKey(key, keyCode) {
    status.textContent = "";
    const target = pageTarget();
    if (!target) {
      status.textContent = "This embedded page is on a different site. Open it in its own tab to use F Keys.";
      return;
    }
    lastTarget = target;
    const doc = target.ownerDocument;
    const view = doc.defaultView;
    const fire = (type, node = target) => node.dispatchEvent(new view.KeyboardEvent(type, {
      key, code: key, keyCode, which: keyCode, charCode: type === "keypress" ? 13 : 0,
      bubbles: true, cancelable: true, composed: true, view
    }));
    if (key !== "Enter") {
      fire("keydown");
      fire("keyup", pageTarget() || target);
      return;
    }
    // Some pages implement their own Enter action. Respect cancellation and avoid
    // repeating synchronous clicks/submissions a page already made during keydown.
    let acted = false;
    const markActed = () => { acted = true; };
    const scope = target.getRootNode();
    for (const type of ["click", "submit", "invalid"]) scope.addEventListener(type, markActed, true);
    try {
      if (fire("keydown") && target.isConnected && pageTarget() === target &&
          fire("keypress") && !acted && target.isConnected && pageTarget() === target) {
        enterDefault(target);
      }
    } finally {
      for (const type of ["click", "submit", "invalid"]) scope.removeEventListener(type, markActed, true);
      fire("keyup", pageTarget() || target);
    }
  }

  for (let i = 1; i <= 12; i++) {
    button("F" + i, keys, () => sendKey("F" + i, 111 + i));
  }
  button("Enter", keys, () => sendKey("Enter", 13)).className = "enter";
  if ("showPopover" in host) host.popover = "manual";
  document.documentElement.append(host);
  if (host.popover) host.showPopover();
})();
