from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, Text
from sqlmodel import Field, SQLModel


class Profile(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    user_id: UUID = Field(unique=True, nullable=False)  # Don't use foreign key to auth.users since it's external
    # Add other profile-related columns here if needed e.g.,
    # username: str = Field(index=True, unique=True)
    # avatar_url: Optional[str] = None


class Document(SQLModel, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: Optional[UUID] = Field(nullable=True)  # Optional for guest users, no foreign key
    filename: str = Field(nullable=False)
    file_type: str = Field(nullable=False) # e.g., 'application/pdf', 'text/plain'
    storage_path: str = Field(nullable=False) # Path in Supabase Storage
    raw_content: Optional[str] = Field(default=None, sa_column=Column(Text))
    status: str = Field(default="uploaded", nullable=False) # 'uploaded', 'processing', 'summarized', 'failed'
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
