# PDF Conversion API

This is a FastAPI backend for converting PDF files to DOCX format.

## Running Locally

1.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

2.  **Run the server:**
    ```bash
    uvicorn main:app --host 0.0.0.0 --port 8000
    ```

## Deployment on Render

Render can automatically deploy this application. When setting up the service on Render:

1.  Connect your repository.
2.  Set the **Start Command** to: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3.  Render will automatically detect `requirements.txt` and install the dependencies.

The API will be live at the URL provided by Render.
