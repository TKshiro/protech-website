import os
import glob

frontend_dir = 'frontend'
html_files = glob.glob(f'{frontend_dir}/**/*.html', recursive=True)

search_dropdown = '''<div class="absolute top-full left-0 mt-4 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div class="p-2 flex flex-col space-y-1">'''

# We add `pt-4` to the outer div (no background) and move the background/shadow to the inner div.
# This creates a transparent hoverable "bridge" so the mouse doesn't lose hover.
replace_dropdown = '''<div class="absolute top-full left-0 pt-4 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div class="bg-white rounded-xl shadow-lg border border-gray-100 p-2 flex flex-col space-y-1">'''

success_count = 0
for file_path in html_files:
    if 'admin' in file_path:
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if search_dropdown in content:
        content = content.replace(search_dropdown, replace_dropdown)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        success_count += 1
        
print(f"Fixed dropdown dead-zone in {success_count} files.")
