from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlalchemy import Column, Text
from sqlmodel import Field, SQLModel


class Profile(SQLModel, table=True):
    __tablename__ = "profiles"  # Match existing database table name
    
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: UUID = Field(unique=True, nullable=False)  # Don't use foreign key to auth.users since it's external
    # Add other profile-related columns here if needed e.g.,
    # username: str = Field(index=True, unique=True)
    # avatar_url: Optional[str] = None


class Document(SQLModel, table=True):
    __tablename__ = "documents"  # Match existing database table name
    
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: Optional[UUID] = Field(default=None)  # Optional for guest users, no foreign key
    filename: str = Field(sa_column=Column(Text, nullable=False))
    file_type: str = Field(sa_column=Column(Text, nullable=False))
    storage_path: str = Field(sa_column=Column(Text, nullable=False))
    raw_content: Optional[str] = Field(default=None, sa_column=Column(Text))
    status: str = Field(default="uploaded", sa_column=Column(Text, nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
