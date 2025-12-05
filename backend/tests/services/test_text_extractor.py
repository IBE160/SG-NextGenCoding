import io
import pytest
from pathlib import Path
from app.services.ai_generation.text_extractor import (
    extract_text_from_txt,
    extract_text_from_docx,
    extract_text_from_pdf,
    extract_text_from_file,
)

# Define the path to the test files
TEST_FILES_DIR = Path(__file__).parent.parent / "test_files"


def test_extract_text_from_txt():
    """Tests extracting text from a .txt file."""
    file_path = TEST_FILES_DIR / "test.txt"
    with open(file_path, "rb") as f:
        file_stream = io.BytesIO(f.read())
    text = extract_text_from_txt(file_stream)
    assert "This is a test text file." in text


def test_extract_text_from_docx():
    """Tests extracting text from a .docx file."""
    file_path = TEST_FILES_DIR / "test.docx"
    with open(file_path, "rb") as f:
        file_stream = io.BytesIO(f.read())
    text = extract_text_from_docx(file_stream)
    assert "This is a test docx file." in text


def test_extract_text_from_pdf():
    """Tests extracting text from a .pdf file."""
    file_path = TEST_FILES_DIR / "test.pdf"
    with open(file_path, "rb") as f:
        file_stream = io.BytesIO(f.read())
    text = extract_text_from_pdf(file_stream)
    assert "This is a test pdf file." in text


def test_extract_text_from_file_txt():
    """Tests the main extractor function with a .txt file."""
    file_path = TEST_FILES_DIR / "test.txt"
    with open(file_path, "rb") as f:
        content = f.read()
    text = extract_text_from_file(content, "text/plain")
    assert "This is a test text file." in text


def test_extract_text_from_file_docx():
    """Tests the main extractor function with a .docx file."""
    file_path = TEST_FILES_DIR / "test.docx"
    with open(file_path, "rb") as f:
        content = f.read()
    text = extract_text_from_file(
        content, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )
    assert "This is a test docx file." in text


def test_extract_text_from_file_pdf():
    """Tests the main extractor function with a .pdf file."""
    file_path = TEST_FILES_DIR / "test.pdf"
    with open(file_path, "rb") as f:
        content = f.read()
    text = extract_text_from_file(content, "application/pdf")
    assert "This is a test pdf file." in text


def test_extract_text_from_unsupported_file():
    """Tests the main extractor with an unsupported file type."""
    text = extract_text_from_file(b"some content", "image/jpeg")
    assert text is None


def test_extract_text_from_corrupted_file():
    """Tests the main extractor with a corrupted file."""
    with pytest.raises(Exception):
        extract_text_from_file(b"corrupted content", "application/pdf")

