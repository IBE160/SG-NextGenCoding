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
