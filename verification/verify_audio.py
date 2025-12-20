
import asyncio
from playwright.async_api import async_playwright, expect

async def verify_audio_pipeline():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--use-fake-ui-for-media-stream",
                "--use-fake-device-for-media-stream",
                "--autoplay-policy=no-user-gesture-required"
            ]
        )
        context = await browser.new_context(
            permissions=["microphone"],
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        )
        page = await context.new_page()
        page.on("console", lambda msg: print(f"Console: {msg.text}"))

        try:
            print("Navigating...")
            await page.goto("http://localhost:3000/conversation")

            print("Waiting for greeting...")
            await expect(page.get_by_text("Hello Arthur")).to_be_visible(timeout=10000)

            print("Finding start button by role...")
            # Use specific locator to avoid ambiguity if any
            start_button = page.locator('button[aria-label="Start recording"]')

            if await start_button.count() == 0:
                 print("Start button not found.")
            else:
                 print("Button found. Clicking...")
                 await start_button.click(timeout=5000)

                 print("Checking results...")
                 await page.wait_for_timeout(3000) # Wait a bit longer

                 # Check what the button label is now
                 button = page.locator('button.rounded-full.h-24') # The big button
                 label = await button.get_attribute("aria-label")
                 print(f"Current button label: {label}")

                 if label == "Stop recording":
                     print("Success: Button switched to 'Stop recording'")
                     await page.screenshot(path="verification/listening_state.png")
                 else:
                     print("Failure: Button did not switch state")
                     # Check if we have an error toast
                     toast = page.locator(".fixed.top-20")
                     if await toast.count() > 0:
                         print(f"Toast visible: {await toast.inner_text()}")

                     await page.screenshot(path="verification/failed_click.png")

        except Exception as e:
            print(f"Error: {e}")
            await page.screenshot(path="verification/error_state.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_audio_pipeline())
