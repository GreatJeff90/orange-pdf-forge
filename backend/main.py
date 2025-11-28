import shutil
import tempfile
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from .converters import (
    pdf_to_structured_data,
    extract_images_from_pdf,
    images_to_pdf,
    merge_pdfs,
    split_pdf,
    compress_pdf,
    create_zip
)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def cleanup_files(temp_dir: Path):
    """Safely remove the temporary directory and its contents."""
    try:
        shutil.rmtree(temp_dir)
    except Exception as e:
        print(f"Error cleaning up temporary directory {temp_dir}: {e}")

@app.post("/convert/to-word")
async def convert_to_word_endpoint(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Converts PDF to structured data (CSV).
    Note: Frontend calls this "PDF to Word", but we now return structured data.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file name provided.")
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    original_filename_stem = Path(file.filename).stem
    temp_dir = Path(tempfile.mkdtemp())
    background_tasks.add_task(cleanup_files, temp_dir)

    pdf_path = temp_dir / f"{uuid.uuid4()}.pdf"
    # Output as CSV for structured data
    output_path = temp_dir / f"{original_filename_stem}.csv"

    try:
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    finally:
        file.file.close()

    try:
        pdf_to_structured_data(pdf_path, output_path, output_format='csv')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to convert PDF: {e}")

    return FileResponse(
        path=str(output_path),
        media_type="text/csv",
        filename=f"{original_filename_stem}.csv"
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
        image_paths = extract_images_from_pdf(pdf_path, temp_dir)
        if not image_paths:
             # If no images found, maybe return a message or empty zip?
             # For now, let's raise an error so user knows
             raise Exception("No embedded images found in PDF")

        # Create ZIP
        zip_path = temp_dir / f"{original_filename_stem}_images.zip"
        create_zip(image_paths, zip_path)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract images: {e}")

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
    return {"message": "PDF Conversion API is running with PyPDF2 and Pandas."}
