
import asyncio
from playwright.async_api import async_playwright, expect

async def verify_accessibility(page):
    # Navigate to conversation page
    await page.goto("http://localhost:3000/conversation")

    # Wait for the page to load
    await page.wait_for_selector('button', state='visible')

    # Verify Close Button has aria-label
    close_button = page.locator('button[aria-label="End conversation"]')
    await expect(close_button).to_be_visible()

    # Verify More Options Button has aria-label and aria-expanded
    more_options = page.locator('button[aria-label="Conversation options"]')
    await expect(more_options).to_be_visible()
    await expect(more_options).to_have_attribute("aria-haspopup", "true")

    # Click more options and check if expanded changes (optional logic check)
    await more_options.click()
    await expect(more_options).to_have_attribute("aria-expanded", "true")

    # Verify Mic Button has aria-label "Start recording" initially
    mic_button = page.locator('button[aria-label="Start recording"]')
    await expect(mic_button).to_be_visible()

    # Verify Type Button has aria-label
    type_button = page.locator('button[aria-label="Type a message"]')
    await expect(type_button).to_be_visible()

    # Verify Show Button has aria-label
    show_button = page.locator('button[aria-label="Show a photo"]')
    await expect(show_button).to_be_visible()

    # Verify Transcript area has role log
    transcript_area = page.locator('div[role="log"]')
    await expect(transcript_area).to_be_visible()

    # Take screenshot
    await page.screenshot(path="verification/accessibility_check.png")
    print("Verification successful!")

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        try:
            await verify_accessibility(page)
        except Exception as e:
            print(f"Verification failed: {e}")
            await page.screenshot(path="verification/error.png")
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
