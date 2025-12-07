from dotenv import load_dotenv
load_dotenv()

import asyncio
from app.db.session import engine
from sqlalchemy import text

async def check_schema():
    async with engine.begin() as conn:
        result = await conn.execute(text(
            "SELECT column_name, data_type, is_nullable "
            "FROM information_schema.columns "
            "WHERE table_name = 'documents' "
            "ORDER BY ordinal_position"
        ))
        rows = result.fetchall()
        print("Documents table schema:")
        for row in rows:
            print(f"  {row[0]}: {row[1]} (nullable: {row[2]})")

asyncio.run(check_schema())
