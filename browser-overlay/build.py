"""Build the unpacked-extension ZIP and the offline mobile setup page."""
import argparse
import subprocess
from html import escape
from pathlib import Path
from urllib.parse import quote
from zipfile import ZIP_DEFLATED, ZipFile

source = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument("output", type=Path)
output = parser.parse_args().output.resolve()
output.mkdir(parents=True, exist_ok=True)

mobile = subprocess.run(
    ["node", str(source / "minify-bookmark.cjs")], capture_output=True, text=True, check=True
).stdout
address = "javascript:" + quote(mobile, safe="()[]{}:;,=+-*/!.'$&?@~") + "/*FK*/"
if len(address) > 4900:
    raise ValueError(f"Mobile bookmark exceeds the 4900-character budget: {len(address)}")
template = (source / "mobile-template.html").read_text(encoding="utf-8")
(output / "F-Keys-Mobile.html").write_text(
    template.replace("{{CODE}}", escape(address, quote=True)).replace("{{RUN_TOOLBAR}}", mobile),
    encoding="utf-8"
)
(output / "F-Keys-Bookmark.txt").write_text(address + "\n", encoding="utf-8")
bookmark_import = (
    '<!DOCTYPE NETSCAPE-Bookmark-file-1>\n'
    '<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">\n'
    '<TITLE>Bookmarks</TITLE>\n<H1>Bookmarks</H1>\n<DL><p>\n'
    f'    <DT><A HREF="{escape(address, quote=True)}">F Keys Pad</A>\n'
    '</DL><p>\n'
)
(output / "F-Keys-Import.html").write_text(bookmark_import, encoding="utf-8")
with ZipFile(output / "F-Keys-Chrome.zip", "w", compression=ZIP_DEFLATED) as archive:
    for file in sorted((source / "extension").iterdir()):
        if file.is_file():
            archive.write(file, "F-Keys/" + file.name)
