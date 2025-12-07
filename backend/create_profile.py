from dotenv import load_dotenv
load_dotenv()

import asyncio
from uuid import UUID
from app.db.session import engine
from app.db.models import Profile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

async def create_profile():
    user_id = UUID('33867788-7031-4e58-8b0f-8ec47cfc2f69')
    
    async with AsyncSession(engine) as session:
        # Check if profile exists using raw SQL to avoid model issues
        result = await session.execute(
            text("SELECT id, user_id FROM profiles WHERE user_id = :user_id"),
            {"user_id": user_id}
        )
        existing = result.first()
        
        if existing:
            print(f"Profile already exists for user_id: {user_id}")
            print(f"  Profile ID: {existing[0]}")
        else:
            # Create new profile using raw SQL
            await session.execute(
                text("INSERT INTO profiles (user_id) VALUES (:user_id)"),
                {"user_id": user_id}
            )
            await session.commit()
            print(f"Created profile for user_id: {user_id}")

asyncio.run(create_profile())
