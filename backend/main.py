import shutil
import tempfile
import uuid
from pathlib import Path

import fitz  # PyMuPDF
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pdf2docx import Converter

# --- Constants ---
# If the first 3 pages have less than this many characters, treat as scanned.
SCANNED_TEXT_THRESHOLD = 300

app = FastAPI()

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
async def convert_to_word(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
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

        # Initialize the converter with the PDF path
        cv = Converter(str(pdf_path))

        if is_scanned:
            # For scanned PDFs, pdf2docx handles the image processing internally.
            # We let it use its default settings for best results on image-based layouts.
            cv.convert(str(docx_path))
        else:
            # For born-digital PDFs, we enable the multi_column_tables option
            # as requested for better layout preservation.
            cv.convert(str(docx_path), multi_column_tables=True)

        cv.close()

    except Exception as e:
        # If any error occurs during conversion, return a 500 error.
        raise HTTPException(status_code=500, detail=f"Failed to convert PDF: {e}")

    return FileResponse(
        path=str(docx_path),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename=f"{original_filename_stem}.docx"
    )

@app.get("/")
def read_root():
    return {"message": "PDF Conversion API is running."}
