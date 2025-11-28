import PyPDF2
import pandas as pd
from pathlib import Path
import io
from PIL import Image
import os

def extract_text_pypdf2(pdf_path: Path) -> str:
    """Extracts text from a PDF using PyPDF2."""
    all_text = ""
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    all_text += text + "\n"
        return all_text
    except Exception as e:
        print(f"Error reading PDF file: {e}")
        raise e

def structure_data_with_pandas(raw_text: str) -> pd.DataFrame:
    """Structures raw text into a DataFrame."""
    # Simple strategy: Split by double newlines (paragraphs)
    # A more advanced strategy might try to detect tables or key-value pairs
    if not raw_text:
        return pd.DataFrame({"Content": ["No text extracted"]})

    blocks = raw_text.split('\n\n')
    # Filter empty blocks
    blocks = [b.strip() for b in blocks if b.strip()]

    data = {'Content': blocks}
    df = pd.DataFrame(data)
    return df

def pdf_to_structured_data(pdf_path: Path, output_path: Path, output_format: str = 'csv'):
    """Converts PDF text to structured data (CSV/Excel)."""
    text = extract_text_pypdf2(pdf_path)
    df = structure_data_with_pandas(text)

    if output_format.lower() == 'csv':
        df.to_csv(str(output_path), index=False)
    elif output_format.lower() in ['xlsx', 'excel']:
        df.to_excel(str(output_path), index=False)
    else:
        # Fallback to text file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)

def extract_images_from_pdf(pdf_path: Path, output_dir: Path) -> list[Path]:
    """Extracts embedded images from a PDF using PyPDF2."""
    image_paths = []
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for page_num, page in enumerate(reader.pages):
                if '/XObject' in page['/Resources']:
                    xObject = page['/Resources']['/XObject'].get_object()
                    for obj in xObject:
                        if xObject[obj]['/Subtype'] == '/Image':
                            size = (xObject[obj]['/Width'], xObject[obj]['/Height'])
                            data = xObject[obj].get_data()

                            # Determine format
                            # This is a bit simplified; filters can be complex
                            if xObject[obj]['/Filter'] == '/FlateDecode':
                                img = Image.frombytes("RGB", size, data)
                                img_path = output_dir / f"p{page_num+1}_{obj[1:]}.png"
                                img.save(str(img_path))
                                image_paths.append(img_path)
                            elif xObject[obj]['/Filter'] == '/DCTDecode':
                                img_path = output_dir / f"p{page_num+1}_{obj[1:]}.jpg"
                                with open(img_path, "wb") as img_file:
                                    img_file.write(data)
                                image_paths.append(img_path)
                            elif xObject[obj]['/Filter'] == '/JPXDecode':
                                img_path = output_dir / f"p{page_num+1}_{obj[1:]}.jp2"
                                with open(img_path, "wb") as img_file:
                                    img_file.write(data)
                                image_paths.append(img_path)
    except Exception as e:
        print(f"Error extracting images: {e}")
        # Non-blocking error for image extraction?
        pass

    return image_paths

def images_to_pdf(image_paths: list[Path], output_path: Path):
    """Converts images to a single PDF using Pillow."""
    if not image_paths:
        return

    images = []
    for path in image_paths:
        try:
            img = Image.open(path)
            if img.mode != 'RGB':
                img = img.convert('RGB')
            images.append(img)
        except Exception as e:
            print(f"Error opening image {path}: {e}")
            continue

    if images:
        images[0].save(
            str(output_path),
            save_all=True,
            append_images=images[1:]
        )

def merge_pdfs(pdf_paths: list[Path], output_path: Path):
    """Merges multiple PDFs using PyPDF2."""
    merger = PyPDF2.PdfMerger()
    try:
        for path in pdf_paths:
            merger.append(str(path))
        merger.write(str(output_path))
    finally:
        merger.close()

def split_pdf(pdf_path: Path, output_dir: Path, split_mode: str = "pages", value: str = "1"):
    """Splits a PDF using PyPDF2."""
    output_files = []

    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        num_pages = len(reader.pages)

        if split_mode == "range":
            # "1-3,5"
            pages_to_keep = set()
            parts = value.split(',')
            for part in parts:
                part = part.strip()
                if '-' in part:
                    try:
                        start, end = map(int, part.split('-'))
                        for p in range(start, end + 1):
                            pages_to_keep.add(p - 1)
                    except: pass
                else:
                    try:
                        pages_to_keep.add(int(part) - 1)
                    except: pass

            valid_pages = sorted([p for p in pages_to_keep if 0 <= p < num_pages])

            if valid_pages:
                writer = PyPDF2.PdfWriter()
                for p in valid_pages:
                    writer.add_page(reader.pages[p])
                out_path = output_dir / "split_range.pdf"
                with open(out_path, 'wb') as f:
                    writer.write(f)
                output_files.append(out_path)

        elif split_mode == "pages":
            try:
                n = int(value)
            except:
                n = 1

            for i in range(0, num_pages, n):
                writer = PyPDF2.PdfWriter()
                end_page = min(i + n, num_pages)
                for p in range(i, end_page):
                    writer.add_page(reader.pages[p])
                out_path = output_dir / f"split_part_{i//n + 1}.pdf"
                with open(out_path, 'wb') as f:
                    writer.write(f)
                output_files.append(out_path)

        # Bookmarks split requires reading outlines which can be complex in PyPDF2
        # Skipping simple bookmark split implementation for now or doing basic one
        elif split_mode == "bookmarks":
            # Basic implementation if outlines exist
            try:
                outlines = reader.outline
                # PyPDF2 outlines are a nested list
                # This is complex to parse recursively without recursion
                # Fallback to no-op or simple
                pass
            except:
                pass

    return output_files

def compress_pdf(pdf_path: Path, output_path: Path, level: int = 2):
    """
    Compress PDF using PyPDF2.
    PyPDF2 compression is limited to stream compression and metadata removal.
    """
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        writer = PyPDF2.PdfWriter()

        for page in reader.pages:
            if level >= 2:
                page.compress_content_streams()  # This is CPU intensive but shrinks file
            writer.add_page(page)

        if level >= 3:
            writer.add_metadata({}) # Strip metadata

        with open(output_path, 'wb') as f:
            writer.write(f)

def create_zip(file_paths: list[Path], output_path: Path):
    import zipfile
    with zipfile.ZipFile(output_path, 'w') as zf:
        for file_path in file_paths:
            zf.write(file_path, arcname=file_path.name)
