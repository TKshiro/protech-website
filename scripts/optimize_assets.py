#!/usr/bin/env python3
import os
import shutil
import sys
from PIL import Image

def get_image_references(image_filename, base_name, search_dir):
    """
    Search recursively in search_dir for references to the image.
    Returns a list of files where references were found.
    """
    referenced_files = []
    
    # We look for the exact filename, or the base name
    # Base name matching should be cautious to avoid false positives (though ours are unique)
    for root, dirs, files in os.walk(search_dir):
        # Exclude hidden directories and backup directories
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in ('_originals_backup', '_unused_backup')]
        
        for file in files:
            if file.startswith('.') or not file.lower().endswith(('.html', '.css', '.js')):
                continue
                
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    
                # Search for the full filename or base name in quotes/paths
                # Since we are converting .png to .jpg, also check if they are already referenced as .jpg
                if (image_filename.lower() in content.lower() or 
                    (base_name.lower() + '.jpg') in content.lower() or 
                    (base_name.lower() + '.png') in content.lower()):
                    referenced_files.append(file_path)
            except Exception as e:
                print(f"Error reading file {file_path}: {e}")
                
    return referenced_files

def main():
    target_dir = 'frontend/assets/images'
    backup_dir = 'unused_images_backup'
    search_dir = 'frontend'
    
    if not os.path.exists(target_dir):
        print(f"Error: Target images directory '{target_dir}' not found.")
        sys.exit(1)
        
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        print(f"Created unused images backup directory: {backup_dir}")

    print("=" * 75)
    print("               PROTECH WEB ASSETS OPTIMIZATION & COMPRESSION")
    print("=" * 75)

    # 1. Scan images
    files = sorted([f for f in os.listdir(target_dir) if os.path.isfile(os.path.join(target_dir, f)) and not f.startswith('.')])
    
    image_files = []
    for f in files:
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp')):
            image_files.append(f)
            
    print(f"Found {len(image_files)} image files in '{target_dir}'.")
    
    unused_images = []
    used_images = []
    
    # 2. Analyze references
    print("Scanning codebase for references...")
    for f in image_files:
        base, ext = os.path.splitext(f)
        refs = get_image_references(f, base, search_dir)
        if not refs:
            unused_images.append((f, os.path.getsize(os.path.join(target_dir, f))))
        else:
            used_images.append((f, os.path.getsize(os.path.join(target_dir, f)), refs))
            
    print(f"Analysis complete: {len(used_images)} images in use, {len(unused_images)} images unused.")
    print("-" * 75)
    
    # 3. Move unused images
    if unused_images:
        print("Moving unused images to backup folder:")
        total_unused_size = 0
        for f, size in unused_images:
            src_path = os.path.join(target_dir, f)
            dest_path = os.path.join(backup_dir, f)
            shutil.move(src_path, dest_path)
            total_unused_size += size
            print(f" - {f:<40} ({size/1024/1024:.2f} MB) -> Moved")
        print(f"Saved {total_unused_size/1024/1024:.2f} MB of active asset space by removing unused images.")
    else:
        print("No unused images to clean up.")
    print("-" * 75)

    # 4. Process referenced large images
    # We target images larger than 500 KB that are in use
    large_used_images = [item for item in used_images if item[1] > 500 * 1024]
    
    if not large_used_images:
        print("No large used images (>500KB) found to optimize.")
        return
        
    print(f"Found {len(large_used_images)} large used images to optimize.")
    print(f"{'Image File':<35} | {'Original Size':<15} | {'New Size':<15} | {'Status':<15}")
    print("-" * 85)
    
    for f, orig_size, refs in large_used_images:
        orig_path = os.path.join(target_dir, f)
        base, ext = os.path.splitext(f)
        is_png = ext.lower() == '.png'
        
        # Determine target filename and path
        target_filename = f"{base}.jpg" if is_png else f
        target_path = os.path.join(target_dir, target_filename)
        
        try:
            with Image.open(orig_path) as img:
                width, height = img.size
                
                # Determine max width based on image purpose in filename
                is_hero_or_bg = any(k in f.lower() for k in ['hero', 'bg', 'banner', 'illustration', 'mockup', 'pattern'])
                max_w = 2000 if is_hero_or_bg else 1600
                
                # Resize if width exceeds target limit
                if width > max_w:
                    ratio = max_w / float(width)
                    new_h = int(float(height) * float(ratio))
                    img = img.resize((max_w, new_h), Image.Resampling.LANCZOS)
                    width, height = img.size
                
                # Handle alpha channel (transparency) cleanly for JPEG conversion
                if img.mode in ('RGBA', 'LA') or (img.mode == 'P' and 'transparency' in img.info):
                    bg = Image.new('RGB', img.size, (255, 255, 255))
                    bg.paste(img, mask=img.convert('RGBA').split()[3])
                    img = bg
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Save as highly optimized progressive JPEG
                img.save(target_path, 'JPEG', quality=82, optimize=True, progressive=True)
                
            new_size = os.path.getsize(target_path)
            savings = orig_size - new_size
            savings_pct = (savings / orig_size) * 100
            
            # If we converted PNG to JPG, we must update all references in the HTML files
            if is_png:
                print(f"{f:<35} | {orig_size/1024/1024:7.2f} MB | {new_size/1024:7.1f} KB | Converted to JPG ({savings_pct:.1f}% saved)")
                
                # Update references in all files
                for ref_file in refs:
                    try:
                        with open(ref_file, 'r', encoding='utf-8') as rf:
                            content = rf.read()
                        
                        # Replace service-dianping.png with service-dianping.jpg, case-insensitive if needed
                        # but standard replace is safe for exact filenames
                        updated_content = content.replace(f, target_filename)
                        
                        with open(ref_file, 'w', encoding='utf-8') as rf:
                            rf.write(updated_content)
                        print(f"   [HTML Update] Updated reference in: {os.path.basename(ref_file)}")
                    except Exception as e:
                        print(f"   [Error] Failed to update reference in {ref_file}: {e}")
                
                # Clean up the original large PNG
                os.remove(orig_path)
            else:
                print(f"{f:<35} | {orig_size/1024/1024:7.2f} MB | {new_size/1024:7.1f} KB | Compressed in-place ({savings_pct:.1f}% saved)")
                
        except Exception as e:
            print(f"{f:<35} | Failed to process: {e}")
            
    print("=" * 75)

if __name__ == '__main__':
    main()
