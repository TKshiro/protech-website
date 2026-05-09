import os
import glob

frontend_dir = 'frontend'
html_files = glob.glob(f'{frontend_dir}/**/*.html', recursive=True)

success_count = 0
for file_path in html_files:
    if 'admin' in file_path:
        continue
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace favicon.ico with favicon.png and image/x-icon with image/png
    new_content = content.replace('href="assets/images/favicon.ico"', 'href="assets/images/favicon.png"')
    new_content = new_content.replace('href="../assets/images/favicon.ico"', 'href="../assets/images/favicon.png"')
    new_content = new_content.replace('href="../../assets/images/favicon.ico"', 'href="../../assets/images/favicon.png"')
    new_content = new_content.replace('href="/assets/images/favicon.ico"', 'href="/assets/images/favicon.png"')
    
    new_content = new_content.replace('type="image/x-icon"', 'type="image/png"')
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        success_count += 1
        
print(f"Updated favicon to .png in {success_count} HTML files.")
