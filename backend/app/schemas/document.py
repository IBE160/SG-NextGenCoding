# backend/app/schemas/document.py

from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field

# This schema is for any additional fields that come with the multipart/form-data request,
# apart from the file itself.
class DocumentUploadRequestFields(BaseModel):
    user_id: Optional[UUID] = Field(None, description="User ID if logged in, optional for guest users")

class DocumentUploadResponse(BaseModel):
    document_id: UUID
    message: str
