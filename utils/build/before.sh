# Should be run from main directory.
rm -rf dist/*

# Generate template.htm.ts files.
python3 utils/build/make_template_html_files.py
