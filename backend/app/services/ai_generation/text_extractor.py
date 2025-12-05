import io
from typing import Callable, Dict, Union

import docx
from pypdf import PdfReader


def extract_text_from_txt(file_stream: io.BytesIO) -> str:
    """Extracts text from a .txt file stream."""
    return file_stream.read().decode("utf-8")


def extract_text_from_docx(file_stream: io.BytesIO) -> str:
    """Extracts text from a .docx file stream."""
    doc = docx.Document(file_stream)
    return "\n".join([paragraph.text for paragraph in doc.paragraphs])


def extract_text_from_pdf(file_stream: io.BytesIO) -> str:
    """Extracts text from a .pdf file stream."""
    reader = PdfReader(file_stream)
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text


FILE_EXTRACTORS: Dict[str, Callable[[io.BytesIO], str]] = {
    "text/plain": extract_text_from_txt,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": extract_text_from_docx,
    "application/pdf": extract_text_from_pdf,
}


def extract_text_from_file(
    file_content: bytes,
    mime_type: str
) -> Union[str, None]:
    """
    Extracts text from a file based on its mime type.

    Args:
        file_content: The content of the file in bytes.
        mime_type: The mime type of the file.

    Returns:
        The extracted text as a string, or None if the mime type is not supported.
    """
    extractor = FILE_EXTRACTORS.get(mime_type)
    if not extractor:
        # Potentially raise a ValueError for unsupported mime types
        return None

    try:
        file_stream = io.BytesIO(file_content)
        return extractor(file_stream)
    except Exception as e:
        # Log the exception for debugging purposes
        print(f"Error extracting text from file with mime type {mime_type}: {e}")
        # Re-raise or handle as appropriate
        raise
