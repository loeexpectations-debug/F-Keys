# F Keys browser overlay

Show F1 through F12 and Enter on the page you are using. On a phone the pad starts at the top, clear of the on-screen keyboard. Use Move to switch edges, Minimize to leave an F Keys tab at the edge of the page, or Close to remove it.

## Desktop Chrome

1. Extract F-Keys-Chrome.zip.
2. Open chrome://extensions and turn on Developer mode.
3. Choose **Load unpacked** and select the F-Keys folder containing manifest.json.
4. Visit your webpage. Open the Extensions menu and click **F Keys**. Pin it for one-click access.
5. Click a key. On pages with an embedded terminal, click the terminal first. Click the extension again to hide the pad. Reopen it after a full navigation.

## Chrome on a phone

1. Open F-Keys-Mobile.html in a browser and choose **Copy bookmark address**. You can also copy the entire line in F-Keys-Bookmark.txt, starting with javascript:.
2. Bookmark any regular webpage in Chrome, edit the bookmark, name it **F Keys Pad**, and replace its URL with the copied address.
3. Open the page where you need the keys. Type **F Keys Pad** in the address bar and tap the bookmark suggestion.
4. Tap a toolbar key. Pages that handle keys on the document can receive them without a text box. If the page has an embedded terminal, tap the terminal area once. Relaunch the bookmark after a full reload or when you change documents.

If you use desktop Chrome with bookmarks synced to your phone, open Bookmark Manager on the computer. In its menu choose **Import bookmarks** and select F-Keys-Import.html. This adds the same F Keys Pad bookmark. On your phone, start at step 3.

F-Keys-Mobile.html includes a local toolbar test with no text boxes. It displays the name of each key received by the page.

## What the keys do

The keypad sends key events to the focused webpage element, including legacy key codes used by terminal-style sites. Enter also follows the focused link or button, submits ordinary single-line forms when appropriate, and adds a new line in editable text. Webpages can cancel Enter to supply their own behavior.

Browser commands such as opening DevTools are outside the scope of the overlay. Sites that require trusted hardware events can ignore simulated keys. Some sites block JavaScript bookmarks. For an embedded page on a different origin, open the embedded page directly if the site allows it.

## Build

From this directory run `python3 build.py dist`. The desktop extension also loads directly from the extension directory. The browser and bookmark versions share overlay.js and have no external dependencies.
