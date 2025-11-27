import shutil
import tempfile
import uuid
from pathlib import Path
from typing import List, Optional

import fitz  # PyMuPDF
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from .converters import (
    pdf_to_word,
    pdf_to_images,
    images_to_pdf,
    merge_pdfs,
    split_pdf,
    compress_pdf,
    create_zip
)

# --- Constants ---
# If the first 3 pages have less than this many characters, treat as scanned.
SCANNED_TEXT_THRESHOLD = 300

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

def is_scanned_pdf(pdf_path: Path) -> bool:
    """
    Analyzes the first few pages of a PDF to determine if it is scanned.
    """
    total_text_len = 0
    try:
        doc = fitz.open(pdf_path)
        num_pages_to_check = min(len(doc), 3)
        for i in range(num_pages_to_check):
            page = doc.load_page(i)
            total_text_len += len(page.get_text("text"))
        doc.close()
    except Exception:
        return False
    return total_text_len < SCANNED_TEXT_THRESHOLD

def cleanup_files(temp_dir: Path):
    """Safely remove the temporary directory and its contents."""
    try:
        shutil.rmtree(temp_dir)
    except Exception as e:
        print(f"Error cleaning up temporary directory {temp_dir}: {e}")

@app.post("/convert/to-word")
async def convert_to_word_endpoint(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file name provided.")
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    original_filename_stem = Path(file.filename).stem
    temp_dir = Path(tempfile.mkdtemp())
    background_tasks.add_task(cleanup_files, temp_dir)

    pdf_path = temp_dir / f"{uuid.uuid4()}.pdf"
    docx_path = temp_dir / f"{original_filename_stem}.docx"

    try:
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    try:
        is_scanned = is_scanned_pdf(pdf_path)
        pdf_to_word(pdf_path, docx_path, is_scanned)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to convert PDF: {e}")

    return FileResponse(
        path=str(docx_path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"{original_filename_stem}.docx"
    )

@app.post("/convert/to-images")
async def convert_to_images_endpoint(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename or file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file. Please upload a PDF.")

    original_filename_stem = Path(file.filename).stem
    temp_dir = Path(tempfile.mkdtemp())
    background_tasks.add_task(cleanup_files, temp_dir)

    pdf_path = temp_dir / f"{uuid.uuid4()}.pdf"

    try:
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    try:
        image_paths = pdf_to_images(pdf_path, temp_dir)
        if not image_paths:
             raise Exception("No images generated")

        # Create ZIP
        zip_path = temp_dir / f"{original_filename_stem}_images.zip"
        create_zip(image_paths, zip_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to convert PDF to images: {e}")

    return FileResponse(
        path=str(zip_path),
        media_type="application/zip",
        filename=f"{original_filename_stem}_images.zip"
    )

@app.post("/convert/images-to-pdf")
async def images_to_pdf_endpoint(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files provided.")

    temp_dir = Path(tempfile.mkdtemp())
    background_tasks.add_task(cleanup_files, temp_dir)

    image_paths = []
    try:
        for file in files:
            img_path = temp_dir / f"{uuid.uuid4()}_{file.filename}"
            with open(img_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            image_paths.append(img_path)
            file.file.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload files: {e}")

    output_pdf_path = temp_dir / "converted_images.pdf"

    try:
        images_to_pdf(image_paths, output_pdf_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to convert images to PDF: {e}")

    return FileResponse(
        path=str(output_pdf_path),
        media_type="application/pdf",
        filename="converted_images.pdf"
    )

@app.post("/convert/merge")
async def merge_pdfs_endpoint(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    if len(files) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least 2 PDF files.")

    temp_dir = Path(tempfile.mkdtemp())
    background_tasks.add_task(cleanup_files, temp_dir)

    pdf_paths = []
    try:
        for file in files:
            pdf_path = temp_dir / f"{uuid.uuid4()}_{file.filename}"
            with open(pdf_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            pdf_paths.append(pdf_path)
            file.file.close()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload files: {e}")

    output_path = temp_dir / "merged.pdf"

    try:
        merge_pdfs(pdf_paths, output_path)
    except Exception as e:
         raise HTTPException(status_code=500, detail=f"Failed to merge PDFs: {e}")

    return FileResponse(
        path=str(output_path),
        media_type="application/pdf",
        filename="merged.pdf"
    )

@app.post("/convert/split")
async def split_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    split_mode: str = Form("pages"),
    split_value: str = Form("1")
):
    if not file.filename or file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file. Please upload a PDF.")

    original_filename_stem = Path(file.filename).stem
    temp_dir = Path(tempfile.mkdtemp())
    background_tasks.add_task(cleanup_files, temp_dir)

    pdf_path = temp_dir / f"{uuid.uuid4()}.pdf"
    try:
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    try:
        output_files = split_pdf(pdf_path, temp_dir, split_mode, split_value)
        if not output_files:
             raise Exception("No output files generated")

        # If single file, return it
        if len(output_files) == 1:
            return FileResponse(
                path=str(output_files[0]),
                media_type="application/pdf",
                filename=output_files[0].name
            )
        else:
            # Zip multiple files
            zip_path = temp_dir / f"{original_filename_stem}_split.zip"
            create_zip(output_files, zip_path)
            return FileResponse(
                path=str(zip_path),
                media_type="application/zip",
                filename=f"{original_filename_stem}_split.zip"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to split PDF: {e}")

@app.post("/convert/compress")
async def compress_pdf_endpoint(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    level: int = Form(2)
):
    if not file.filename or file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file. Please upload a PDF.")

    original_filename_stem = Path(file.filename).stem
    temp_dir = Path(tempfile.mkdtemp())
    background_tasks.add_task(cleanup_files, temp_dir)

    pdf_path = temp_dir / f"{uuid.uuid4()}.pdf"
    output_path = temp_dir / f"{original_filename_stem}_compressed.pdf"

    try:
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    try:
        compress_pdf(pdf_path, output_path, level)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to compress PDF: {e}")

    return FileResponse(
        path=str(output_path),
        media_type="application/pdf",
        filename=f"{original_filename_stem}_compressed.pdf"
    )

@app.get("/")
def read_root():
    return {"message": "PDF Conversion API is running."}
