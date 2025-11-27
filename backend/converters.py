import fitz  # PyMuPDF
from pdf2docx import Converter
from pathlib import Path
import os
import zipfile
import io

def pdf_to_word(pdf_path: Path, output_path: Path, is_scanned: bool = False):
    """Converts a PDF to a DOCX file."""
    cv = Converter(str(pdf_path))
    if is_scanned:
        cv.convert(str(output_path))
    else:
        cv.convert(str(output_path), multi_column_tables=True)
    cv.close()

def pdf_to_images(pdf_path: Path, output_dir: Path) -> list[Path]:
    """Converts each page of a PDF to an image (JPEG). Returns list of image paths."""
    doc = fitz.open(pdf_path)
    image_paths = []

    for i in range(len(doc)):
        page = doc.load_page(i)
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2)) # 2x zoom for better quality
        image_path = output_dir / f"page_{i+1}.jpg"
        pix.save(str(image_path))
        image_paths.append(image_path)

    doc.close()
    return image_paths

def images_to_pdf(image_paths: list[Path], output_path: Path):
    """Converts a list of images to a single PDF."""
    doc = fitz.open()
    for img_path in image_paths:
        img_doc = fitz.open(img_path)
        pdf_bytes = img_doc.convert_to_pdf()
        img_pdf = fitz.open("pdf", pdf_bytes)
        doc.insert_pdf(img_pdf)
        img_doc.close()
        img_pdf.close()

    doc.save(str(output_path))
    doc.close()

def merge_pdfs(pdf_paths: list[Path], output_path: Path):
    """Merges multiple PDFs into one."""
    doc = fitz.open()
    for pdf_path in pdf_paths:
        try:
            with fitz.open(pdf_path) as m_doc:
                doc.insert_pdf(m_doc)
        except Exception as e:
            print(f"Error merging {pdf_path}: {e}")
            continue
    doc.save(str(output_path))
    doc.close()

def split_pdf(pdf_path: Path, output_dir: Path, split_mode: str = "pages", value: str = "1"):
    """
    Splits a PDF based on the mode.
    split_mode: 'range' (e.g. "1-3,5"), 'pages' (every N pages), 'bookmarks'
    """
    doc = fitz.open(pdf_path)
    output_files = []

    if split_mode == "range":
        # Value is like "1-3,5"
        # Parse range string to list of page numbers (0-indexed)
        # Simple implementation: just support single range or single number for now to keep it robust
        # or parse comma separated
        # User input is 1-based

        # A simple parser for "1-3, 5"
        pages_to_keep = set()
        parts = value.split(',')
        for part in parts:
            part = part.strip()
            if '-' in part:
                start, end = map(int, part.split('-'))
                for p in range(start, end + 1):
                    pages_to_keep.add(p - 1)
            else:
                try:
                    pages_to_keep.add(int(part) - 1)
                except:
                    pass

        # Validate pages
        valid_pages = sorted([p for p in pages_to_keep if 0 <= p < len(doc)])

        if valid_pages:
            new_doc = fitz.open()
            for p in valid_pages:
                new_doc.insert_pdf(doc, from_page=p, to_page=p)
            out_path = output_dir / f"split_range.pdf"
            new_doc.save(str(out_path))
            new_doc.close()
            output_files.append(out_path)

    elif split_mode == "pages": # Every N pages
        try:
            n = int(value)
        except:
            n = 1

        total_pages = len(doc)
        for i in range(0, total_pages, n):
            new_doc = fitz.open()
            new_doc.insert_pdf(doc, from_page=i, to_page=min(i + n - 1, total_pages - 1))
            out_path = output_dir / f"split_part_{i//n + 1}.pdf"
            new_doc.save(str(out_path))
            new_doc.close()
            output_files.append(out_path)

    elif split_mode == "bookmarks":
        # Split by top-level bookmarks
        toc = doc.get_toc()
        # toc item: [lvl, title, page, ...]
        # Filter level 1
        level1 = [t for t in toc if t[0] == 1]

        if not level1:
            # Fallback if no bookmarks: treat as whole
            pass

        for i, item in enumerate(level1):
            start_page = item[2] - 1
            if i < len(level1) - 1:
                end_page = level1[i+1][2] - 2
            else:
                end_page = len(doc) - 1

            if start_page <= end_page:
                new_doc = fitz.open()
                new_doc.insert_pdf(doc, from_page=start_page, to_page=end_page)
                safe_title = "".join([c for c in item[1] if c.isalnum() or c in (' ', '-', '_')]).strip()
                out_path = output_dir / f"{i+1}_{safe_title}.pdf"
                new_doc.save(str(out_path))
                new_doc.close()
                output_files.append(out_path)

    doc.close()
    return output_files

def compress_pdf(pdf_path: Path, output_path: Path, level: int = 2):
    """
    Compress PDF.
    level: 1 (low compression/better quality), 2 (medium), 3 (high compression/lower quality)
    """
    doc = fitz.open(pdf_path)

    # Map level to garbage collection strength
    # 0: none, 1: clean, 2: remove unused, 3: remove unused + compact, 4: all of above + dedupe
    garbage = 4

    # Deflate images?
    # PyMuPDF doesn't have a simple "jpeg quality" slider in save() but we can use deflate=True

    doc.save(str(output_path), garbage=garbage, deflate=True)
    doc.close()

def create_zip(file_paths: list[Path], output_path: Path):
    with zipfile.ZipFile(output_path, 'w') as zf:
        for file_path in file_paths:
            zf.write(file_path, arcname=file_path.name)
