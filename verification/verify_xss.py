import json
from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    # Intercept API call to mock chapter data
    def handle_route(route):
        data = {
            "id": "test-id",
            "title": "XSS Verification Story",
            "content": "This is *italic* text.\n\nAnd this is <script>alert('XSS')</script> malicious code.",
            "createdAt": "2023-01-01T00:00:00.000Z"
        }
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(data)
        )

    # Route interception
    page.route("**/api/chapters/detail/test-id", handle_route)

    try:
        # Navigate to the book page
        # Note: We use 3000 as default nextjs port
        page.goto("http://localhost:3000/stories/test-id/book", timeout=60000)

        # Wait for the story to load (title should be visible)
        page.wait_for_selector("h1:has-text('XSS Verification Story')", timeout=60000)

        # Verify 'italic' is emphasized
        italic_loc = page.locator("em", has_text="italic")
        expect(italic_loc).to_be_visible()

        # Verify <script> tag is rendered as text and NOT as a tag
        # The text visible should literally be "<script>alert('XSS')</script>"
        # If it was executed/parsed as HTML, it wouldn't be visible as text (script tags are hidden)
        script_text_loc = page.locator("p", has_text="<script>alert('XSS')</script>")
        expect(script_text_loc).to_be_visible()

        # Take screenshot
        page.screenshot(path="verification/xss_verification.png", full_page=True)
        print("Verification successful! Screenshot saved.")

    except Exception as e:
        print(f"Verification failed: {e}")
        # Take screenshot on failure too if possible
        try:
            page.screenshot(path="verification/xss_failure.png")
        except:
            pass
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
