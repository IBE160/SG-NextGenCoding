# backend/app/services/ai_generation/gemini_client.py
import google.generativeai as genai
import asyncio
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings

# Configure the Gemini API client
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
except Exception as e:
    logging.error(f"Error configuring Gemini API: {e}")
    # Handle the case where the API key is not set or invalid
    # Depending on the application's needs, this could raise an exception,
    # or a dummy client could be used.
    genai = None

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define specific exceptions to retry on, if the library provides them.
# For this example, we'll use a generic Exception, but it's better to be specific.
# from google.api_core import exceptions as google_exceptions
# RetryableErrors = (
#     google_exceptions.ResourceExhausted,  # Rate limits
#     google_exceptions.ServiceUnavailable, # Temporary server issues
# )

@retry(
    wait=wait_exponential(multiplier=1, min=4, max=60),
    stop=stop_after_attempt(5),
    # retry=retry_if_exception_type(RetryableErrors),
    before_sleep=lambda retry_state: logger.info(f"Retrying Gemini API call: attempt {retry_state.attempt_number}...")
)
async def call_gemini_summarize(prompt: str, text: str) -> str:
    """
    Calls the Gemini API to generate a summary for the given text.
    Includes retry logic for transient errors.
    """
    if not genai:
        logger.error("Gemini API client is not configured.")
        raise ConnectionError("Gemini API client is not configured.")

    try:
        logger.info("Initializing Gemini model...")
        model = genai.GenerativeModel('models/gemini-2.5-flash')

        logger.info("Generating content from Gemini model...")
        full_prompt = f"{prompt}\n\n{text}"
        response = await asyncio.to_thread(model.generate_content, full_prompt)

        if response and response.text:
            logger.info("Successfully received summary from Gemini.")
            return response.text
        else:
            logger.warning("Gemini API returned an empty response.")
            # This might be a case to not retry, depending on the cause
            return ""

    except Exception as e:
        logger.error(f"An unexpected error occurred during Gemini API call: {e}")
        # Re-raise the exception to trigger the retry mechanism
        raise

if __name__ == '__main__':
    # Example usage for direct testing
    async def main():
        test_prompt = "Summarize the following text in 3 sentences:"
        test_text = (
            "The quick brown fox jumps over the lazy dog. This sentence is a pangram, "
            "a phrase that contains all the letters of the alphabet. Pangrams are used to "
            "test typewriters and keyboards. The five boxing wizards jump quickly. "
            "Jackdaws love my big sphinx of quartz. The quick onyx goblin jumps over the lazy dwarf."
        )
        print("--- Calling Gemini API ---")
        try:
            summary = await call_gemini_summarize(test_prompt, test_text)
            print("\n--- Summary ---")
            print(summary)
        except Exception as e:
            print(f"\n--- Error ---")
            print(f"Failed to get summary: {e}")

    # To run this example, you would need to have your .env file in the backend folder
    # with a valid GEMINI_API_KEY.
    # You can run this file directly using `python -m app.services.ai_generation.gemini_client`
    # from the `backend` directory.
    # Note: Tenacity is not in pyproject.toml yet.
    #       `poetry add tenacity` would be needed.
    # For now, this `if __name__ == '__main__':` block is for documentation.
    pass
