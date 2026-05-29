#!/usr/bin/env python3
import os
import sys
from PIL import Image

def main():
    backup_dir = 'frontend/assets/images/_originals_backup'
    target_dir = 'frontend/assets/images'
    
    if not os.path.exists(backup_dir):
        print(f"Error: Original backup directory '{backup_dir}' not found.")
        sys.exit(1)
        
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)

    print("=" * 60)
    print("           PROTECH IMAGE COMPRESSION & OPTIMIZATION")
    print("=" * 60)
    
    files = sorted([f for f in os.listdir(backup_dir) if not f.startswith('.')])
    if not files:
        print("No files found in originals backup directory.")
        return

    total_orig_size = 0
    total_new_size = 0
    optimized_count = 0
    deleted_count = 0

    print(f"{'File Name':<35} | {'Original':<10} | {'Optimized':<10} | {'Savings':<8}")
    print("-" * 75)

    for f in files:
        orig_path = os.path.join(backup_dir, f)
        if not os.path.isfile(orig_path):
            continue
            
        base, ext = os.path.splitext(f)
        target_filename = f"{base}.jpg"
        target_path = os.path.join(target_dir, target_filename)
        
        orig_size = os.path.getsize(orig_path)
        total_orig_size += orig_size
        
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
                    # Paste onto white background to avoid black background artifacts
                    bg = Image.new('RGB', img.size, (255, 255, 255))
                    bg.paste(img, mask=img.convert('RGBA').split()[3])
                    img = bg
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Save as highly optimized progressive JPEG
                img.save(target_path, 'JPEG', quality=82, optimize=True, progressive=True)
                
            new_size = os.path.getsize(target_path)
            total_new_size += new_size
            optimized_count += 1
            
            savings = orig_size - new_size
            savings_pct = (savings / orig_size) * 100
            
            print(f"{target_filename:<35} | {orig_size/1024:>7.1f} KB | {new_size/1024:>7.1f} KB | {savings_pct:>5.1f}%")
            
            # Delete the original file as requested by the user since a compressed duplicate has been successfully created
            if os.path.exists(target_path) and os.path.getsize(target_path) > 0:
                os.remove(orig_path)
                deleted_count += 1
                
        except Exception as e:
            print(f"Failed to process {f}: {e}")

    print("=" * 60)
    total_saved = total_orig_size - total_new_size
    saved_mb = total_saved / (1024 * 1024)
    orig_mb = total_orig_size / (1024 * 1024)
    new_mb = total_new_size / (1024 * 1024)
    
    print(f"Total Images Optimized: {optimized_count}")
    print(f"Original Total Size:    {orig_mb:.2f} MB")
    print(f"Optimized Total Size:   {new_mb:.2f} MB")
    print(f"Disk Space Saved:       {saved_mb:.2f} MB ({ (total_saved/total_orig_size * 100) if total_orig_size else 0:.1f}%)")
    print(f"Redundant Originals Deleted: {deleted_count}")
    print("=" * 60)

if __name__ == '__main__':
    main()
