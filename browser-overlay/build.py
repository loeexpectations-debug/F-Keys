"""Build the unpacked-extension ZIP and the offline mobile setup page."""
import argparse
from html import escape
from pathlib import Path
from urllib.parse import quote
from zipfile import ZIP_DEFLATED, ZipFile

source = Path(__file__).resolve().parent
parser = argparse.ArgumentParser()
parser.add_argument("output", type=Path)
output = parser.parse_args().output.resolve()
output.mkdir(parents=True, exist_ok=True)

# overlay.js uses whole-line comments and explicit semicolons. Keep spaces between
# lines, including CSS rules in template literals, when making a single-line URL.
lines = (source / "extension/overlay.js").read_text(encoding="utf-8").splitlines()
script = " ".join(line.strip() for line in lines if not line.lstrip().startswith("//"))
address = "javascript:" + quote(script, safe="()[]{}:;,=+-*/!.'")
template = (source / "mobile-template.html").read_text(encoding="utf-8")
(output / "F-Keys-Mobile.html").write_text(
    template.replace("{{CODE}}", escape(address, quote=True)), encoding="utf-8"
)
(output / "F-Keys-Bookmark.txt").write_text(address + "\n", encoding="utf-8")
with ZipFile(output / "F-Keys-Chrome.zip", "w", compression=ZIP_DEFLATED) as archive:
    for file in sorted((source / "extension").iterdir()):
        if file.is_file():
            archive.write(file, "F-Keys/" + file.name)
