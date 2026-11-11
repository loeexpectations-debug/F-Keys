package ca.sparky.fkeys;

import android.inputmethodservice.InputMethodService;
import android.graphics.Color;
import android.os.SystemClock;
import android.view.KeyEvent;
import android.view.KeyCharacterMap;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.view.inputmethod.InputConnection;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.util.Locale;

/** Offline IME. Text uses commitText; special keys use Android down/up events. */
public class FKeyService extends InputMethodService {
    private boolean shift, ctrl, alt, symbols;
    private LinearLayout panel;
    private TextView status;
    private int dp(int n) { return (int)(n * getResources().getDisplayMetrics().density + .5f); }
    @Override public boolean onEvaluateFullscreenMode() { return false; }
    @Override public View onCreateInputView() {
        panel = new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);
        panel.setBackgroundColor(Color.rgb(19, 25, 36));
        panel.setPadding(dp(3), dp(5), dp(3), dp(8));
        render(); return panel;
    }
    @Override public void onStartInput(EditorInfo info, boolean restarting) {
        super.onStartInput(info, restarting);
        shift = ctrl = alt = symbols = false;
        if (panel != null) render();
    }
    @Override public void onFinishInput() {
        shift = ctrl = alt = false;
        super.onFinishInput();
    }
    private LinearLayout row() {
        LinearLayout r = new LinearLayout(this);
        panel.addView(r, new LinearLayout.LayoutParams(-1, dp(44)));
        return r;
    }
    private void key(LinearLayout r, String label, float weight, Runnable action) {
        Button b = new Button(this);
        b.setText(label); b.setTextSize(13); b.setAllCaps(false);
        b.setTextColor(Color.WHITE); b.setBackgroundTintList(android.content.res.ColorStateList.valueOf(
            label.startsWith("F") ? Color.rgb(30, 91, 115) : Color.rgb(44, 54, 70)));
        b.setMinWidth(0); b.setMinimumWidth(0); b.setPadding(0, 0, 0, 0);
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(0, -1, weight);
        p.setMargins(dp(1), dp(1), dp(1), dp(1)); r.addView(b, p);
        b.setOnClickListener(v -> action.run());
    }
    private void render() {
        panel.removeAllViews();
        status = new TextView(this); status.setTextColor(Color.LTGRAY); status.setTextSize(12);
        status.setPadding(dp(6), 0, 0, dp(4)); panel.addView(status); updateStatus(null);
        for (int start : new int[]{1,7}) {
            LinearLayout r = row();
            for (int i = start; i < start + 6; i++) {
                final int f = i; key(r, "F" + f, 1, () -> send(KeyEvent.KEYCODE_F1 + f - 1));
            }
        }
        String[] rows = symbols ? new String[]{"1234567890", "!@#$%&*()", "-_=+[]{}", ";:'\",./?"}
                                : new String[]{"1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm"};
        for (String text : rows) {
            LinearLayout r = row();
            for (char c : text.toCharArray()) {
                final char value = c;
                key(r, shift ? (""+c).toUpperCase(Locale.ROOT) : ""+c, 1, () -> type(value));
            }
        }
        LinearLayout mods = row();
        key(mods, shift ? "Shift ●" : "Shift", 1, () -> { shift = !shift; render(); });
        key(mods, ctrl ? "Ctrl ●" : "Ctrl", 1, () -> { ctrl = !ctrl; render(); });
        key(mods, alt ? "Alt ●" : "Alt", 1, () -> { alt = !alt; render(); });
        key(mods, "Esc", 1, () -> send(KeyEvent.KEYCODE_ESCAPE));
        key(mods, "Tab", 1, () -> send(KeyEvent.KEYCODE_TAB));
        key(mods, "⌫", 1, () -> {
            InputConnection ic = getCurrentInputConnection(); if (ic == null) return;
            if (ctrl || alt || shift) { send(KeyEvent.KEYCODE_DEL); return; }
            CharSequence selected = ic.getSelectedText(0);
            if (selected != null && selected.length() > 0) ic.commitText("", 1);
            else ic.deleteSurroundingTextInCodePoints(1, 0);
        });
        LinearLayout bottom = row();
        key(bottom, "ABC/#+", 1.3f, () -> { symbols = !symbols; render(); });
        key(bottom, "Switch", 1.2f, () -> ((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).showInputMethodPicker());
        key(bottom, "Space", 2, () -> type(' '));
        key(bottom, "←", .8f, () -> send(KeyEvent.KEYCODE_DPAD_LEFT));
        key(bottom, "→", .8f, () -> send(KeyEvent.KEYCODE_DPAD_RIGHT));
        key(bottom, "↵", 1, () -> {
            InputConnection ic = getCurrentInputConnection(); if (ic == null) return;
            EditorInfo info = getCurrentInputEditorInfo();
            int action = info == null ? 0 : info.imeOptions & EditorInfo.IME_MASK_ACTION;
            if (!ctrl && !alt && !shift && info != null && (info.imeOptions & EditorInfo.IME_FLAG_NO_ENTER_ACTION) == 0
                && action != EditorInfo.IME_ACTION_NONE && action != EditorInfo.IME_ACTION_UNSPECIFIED) ic.performEditorAction(action);
            else send(KeyEvent.KEYCODE_ENTER);
        });
    }
    private void updateStatus(String message) {
        if (status != null) status.setText(message != null ? message : "F KEYS  •  " +
            (ctrl ? "Ctrl + " : "") + (alt ? "Alt + " : "") + (shift ? "Shift + " : "") + "Ready");
    }
    private int meta() {
        return (shift ? KeyEvent.META_SHIFT_ON | KeyEvent.META_SHIFT_LEFT_ON : 0)
            | (ctrl ? KeyEvent.META_CTRL_ON | KeyEvent.META_CTRL_LEFT_ON : 0)
            | (alt ? KeyEvent.META_ALT_ON | KeyEvent.META_ALT_LEFT_ON : 0);
    }
    private void type(char c) {
        InputConnection ic = getCurrentInputConnection(); if (ic == null) return;
        if (ctrl || alt) {
            KeyEvent[] events = KeyCharacterMap.load(KeyCharacterMap.VIRTUAL_KEYBOARD).getEvents(new char[]{c});
            if (events != null) for (KeyEvent e : events) {
                if (e.getAction() == KeyEvent.ACTION_DOWN && !KeyEvent.isModifierKey(e.getKeyCode())) { send(e.getKeyCode()); return; }
            }
            updateStatus("This character has no shortcut key mapping"); return;
        }
        ic.commitText(shift ? (""+c).toUpperCase(Locale.ROOT) : ""+c, 1);
        shift = false; render();
    }
    private void send(int code) {
        InputConnection ic = getCurrentInputConnection(); if (ic == null) return;
        long time = SystemClock.uptimeMillis();
        int flags = KeyEvent.FLAG_SOFT_KEYBOARD | KeyEvent.FLAG_KEEP_TOUCH_MODE;
        boolean down = ic.sendKeyEvent(new KeyEvent(time, time, KeyEvent.ACTION_DOWN, code, 0, meta(),
            KeyCharacterMap.VIRTUAL_KEYBOARD, 0, flags));
        boolean up = ic.sendKeyEvent(new KeyEvent(time, SystemClock.uptimeMillis(), KeyEvent.ACTION_UP, code, 0, meta(),
            KeyCharacterMap.VIRTUAL_KEYBOARD, 0, flags));
        shift = ctrl = alt = false; render();
        updateStatus(down && up ? "Sent " + KeyEvent.keyCodeToString(code) + " • app support varies" : "App did not accept the key event");
    }
}
