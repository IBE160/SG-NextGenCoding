from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class Profile(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    user_id: UUID = Field(foreign_key="auth.users.id", unique=True, nullable=False)
    # Add other profile-related columns here if needed e.g.,
    # username: str = Field(index=True, unique=True)
    # avatar_url: Optional[str] = None


class Document(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="profile.user_id", nullable=False) # Referencing profile.user_id as per context
    filename: str = Field(nullable=False)
    file_type: str = Field(nullable=False) # e.g., 'application/pdf', 'text/plain'
    storage_path: str = Field(nullable=False) # Path in Supabase Storage
    status: str = Field(default="uploaded", nullable=False) # 'uploaded', 'processing', 'summarized', 'failed'
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
