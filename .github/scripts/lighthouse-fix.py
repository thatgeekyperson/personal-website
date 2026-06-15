#!/usr/bin/env python3
import os
import re
import sys
import argparse

# Default file paths
INDEX_HTML = 'index.html'
INDEX_CSS = 'src/index.css'
ROBOTS_TXT = 'public/robots.txt'

def read_file(path):
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            return f.read()
    return ''

def write_file(path, content):
    # Ensure directory exists
    dir_name = os.path.dirname(path)
    if dir_name and not os.path.exists(dir_name):
        os.makedirs(dir_name, exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def patch_file(path, search, replace):
    src = read_file(path)
    if search not in src:
        return False
    write_file(path, src.replace(search, replace))
    return True

def inject_before(path, anchor, injection):
    src = read_file(path)
    if not src:
        return False
    # Check if the injection is already present (by checking its first line)
    first_line_injection = injection.strip().split('\n')[0]
    if first_line_injection in src:
        return False
    if anchor not in src:
        return False
    write_file(path, src.replace(anchor, injection + anchor))
    return True

# --- Individual fix functions ---

def fix_meta_description():
    return inject_before(INDEX_HTML, '</head>',
        '    <meta name="description" content="Manan Khasgiwale — software engineer specialising in data pipelines. Projects, background, and contact." />\n')

def fix_document_title():
    # Only fix if title is empty as in the original playbook
    return patch_file(INDEX_HTML, '<title></title>', '<title>Manan — Developer</title>')

def fix_html_lang():
    # Only if <html> tag exists without lang
    src = read_file(INDEX_HTML)
    if '<html lang=' in src:
        return False
    return patch_file(INDEX_HTML, '<html>', '<html lang="en">')

def fix_robots_txt():
    if os.path.exists(ROBOTS_TXT):
        return False
    write_file(ROBOTS_TXT, 'User-agent: *\nAllow: /\n')
    return True

def fix_font_display():
    src = read_file(INDEX_HTML)
    if 'fonts.googleapis.com' not in src or 'display=swap' in src:
        return False
    
    new_src = re.sub(
        r'https://fonts\.googleapis\.com/css2\?([^"&]+)(?:&display=swap)?',
        r'https://fonts.googleapis.com/css2?\1&display=swap',
        src
    )
    if new_src != src:
        write_file(INDEX_HTML, new_src)
        return True
    return False

def fix_preconnect():
    return inject_before(INDEX_HTML, '<link rel="preconnect" href="https://fonts.googleapis.com">',
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n    ')

def fix_scroll_padding():
    src = read_file(INDEX_CSS)
    if 'scroll-padding-top' in src:
        return False
    return patch_file(INDEX_CSS,
        'scroll-behavior: smooth;',
        'scroll-behavior: smooth;\n  scroll-padding-top: 64px;')

def fix_viewport_meta():
    return inject_before(INDEX_HTML, '</head>',
        '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n')

# --- Playbook registry ---

PLAYBOOK = {
    'meta-description':        fix_meta_description,
    'document-title':          fix_document_title,
    'html-has-lang':           fix_html_lang,
    'is-crawlable':            fix_robots_txt,
    'robots-txt':              fix_robots_txt,
    'font-display':            fix_font_display,
    'uses-rel-preconnect':     fix_preconnect,
    'scroll-padding':          fix_scroll_padding,
    'viewport':                fix_viewport_meta,
}

def main():
    parser = argparse.ArgumentParser(description='Lighthouse fix utility')
    parser.add_argument('--audit', action='append', help='Audit ID to fix')
    parser.add_argument('--all', action='store_true', help='Apply all known fixes')
    
    args = parser.parse_args()
    
    if not args.audit and not args.all:
        parser.print_help()
        sys.exit(0)
    
    audit_ids = args.audit if args.audit else PLAYBOOK.keys()
    
    any_fixed = False
    for aid in audit_ids:
        if aid in PLAYBOOK:
            if PLAYBOOK[aid]():
                print(f"[playbook] Fixed: {aid}")
                any_fixed = True
    
    if not any_fixed:
        print("[playbook] No changes applied.")

if __name__ == "__main__":
    main()
