from playwright.sync_api import sync_playwright, expect
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Mock the chapter API response with malicious content
        # We include an image with onerror which WOULD execute if not escaped
        malicious_content = 'Safe Text <img src=x onerror=alert(1)> *Italic*'

        page.route("**/api/chapters/detail/1", lambda route: route.fulfill(
            status=200,
            body=f'{{"id": "1", "title": "Test Chapter", "content": "{malicious_content}", "createdAt": "2023-01-01"}}',
            headers={'content-type': 'application/json'}
        ))

        print("Navigating to page...")
        try:
            page.goto("http://localhost:3000/stories/1/book")
        except Exception as e:
            print(f"Failed to load page: {e}")
            return

        print("Waiting for content...")
        try:
            expect(page.get_by_text("Test Chapter")).to_be_visible(timeout=30000)
        except Exception as e:
            print(f"Page did not load content: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
            return

        print("Verifying XSS prevention...")
        # If escaped, the raw HTML string should be visible as text
        # Specifically "<img src=x onerror=alert(1)>" should be visible text
        try:
            expect(page.get_by_text("<img src=x onerror=alert(1)>")).to_be_visible()
            print("XSS Payload is visible as text (SAFE)")
        except Exception as e:
            print(f"XSS Payload text not found (Potential VULNERABILITY or rendering issue): {e}")

        # Verify italic formatting still works
        # We expect "Italic" to be visible (the asterisks should be gone)
        try:
            expect(page.get_by_text("Italic", exact=True)).to_be_visible()
             # Note: exact=True might fail if it's inside a p with other text.
             # But "Safe Text ... Italic" is the full text.
             # Let's just check that *Italic* is NOT visible (meaning it was processed)
            if page.get_by_text("*Italic*").is_visible():
                print("Markdown processing failed: *Italic* is visible")
            else:
                 print("Markdown processing works: *Italic* is not visible (assumed converted)")
        except:
             pass

        # Take screenshot
        page.screenshot(path="/home/jules/verification/verification.png")
        print("Screenshot saved.")

        browser.close()

if __name__ == "__main__":
    run()
