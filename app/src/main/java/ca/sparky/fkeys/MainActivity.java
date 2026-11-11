package ca.sparky.fkeys;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.provider.Settings;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.widget.*;

public class MainActivity extends Activity {
    private TextView log;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        ScrollView scroll = new ScrollView(this);
        LinearLayout box = new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL);
        int pad = (int)(20 * getResources().getDisplayMetrics().density);
        box.setPadding(pad, pad, pad, pad); scroll.addView(box); setContentView(scroll);
        // Respect status/navigation bars on Android 15 and later.
        scroll.setOnApplyWindowInsetsListener((v, insets) -> {
            v.setPadding(insets.getSystemWindowInsetLeft(), insets.getSystemWindowInsetTop(),
                insets.getSystemWindowInsetRight(), insets.getSystemWindowInsetBottom()); return insets;
        });
        text(box, "F Keys", 30);
        text(box, "A simple offline keyboard with F1–F12 and Ctrl, Alt and Shift shortcuts.", 17);
        text(box, "1. Enable F Keys in Android’s keyboard settings.\n2. Choose F Keys from the keyboard picker.\n3. Tap the test field below, then try F1–F12.", 16);
        button(box, "1 · Enable keyboard", () -> startActivity(new Intent(Settings.ACTION_INPUT_METHOD_SETTINGS)));
        button(box, "2 · Choose keyboard", () -> ((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).showInputMethodPicker());
        text(box, "Key-event tester", 21);
        EditText field = new EditText(this); field.setHint("Tap here to open the keyboard");
        field.setSingleLine(false); field.setMinLines(2); box.addView(field);
        log = text(box, "No function keys received yet.", 15);
        field.setOnKeyListener((v, code, event) -> {
            if ((code >= KeyEvent.KEYCODE_F1 && code <= KeyEvent.KEYCODE_F12)
                || event.isCtrlPressed() || event.isAltPressed()) {
                if (event.getAction() == KeyEvent.ACTION_DOWN)
                    log.setText("Received: " + (event.isCtrlPressed() ? "Ctrl + " : "")
                        + (event.isAltPressed() ? "Alt + " : "") + (event.isShiftPressed() ? "Shift + " : "")
                        + KeyEvent.keyCodeToString(code));
                return true;
            }
            return false;
        });
        text(box, "Modifiers apply to the next key, then reset. Shift applies to the next typed letter. Switch opens Android’s keyboard picker.", 15);
        text(box, "Compatibility: F keys work only when the receiving app accepts Android function-key events. This keyboard cannot force games or remote-desktop apps to accept them, open a keyboard where an app offers no input field, or add keys inside Gboard. It is a separate selectable keyboard.", 15);
        text(box, "Privacy: no Internet permission, analytics, account, clipboard access, or typing history. Android displays its standard third-party keyboard warning when you enable it.", 15);
    }
    private TextView text(LinearLayout box, String value, int size) {
        TextView view = new TextView(this); view.setText(value); view.setTextSize(size);
        view.setPadding(0, 12, 0, 12); box.addView(view); return view;
    }
    private void button(LinearLayout box, String label, Runnable action) {
        Button b = new Button(this); b.setText(label); box.addView(b); b.setOnClickListener(v -> action.run());
    }
}
