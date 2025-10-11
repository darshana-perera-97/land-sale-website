# Chatbot Module

This folder contains all the files needed for the floating chatbot functionality.

## Files

- **`chatbot.css`** - All CSS styles for the chatbot component
- **`chatbot.js`** - JavaScript functionality and chatbot logic
- **`chatbot.html`** - Complete standalone chatbot page with embedded styles and scripts
- **`chatbot-component.html`** - Clean HTML component for easy integration into other pages

## Integration

To add the chatbot to any HTML page:

1. Add CSS link to `<head>`:
   ```html
   <link rel="stylesheet" href="chatbot/chatbot.css">
   ```

2. Add JavaScript before closing `</body>`:
   ```html
   <script src="chatbot/chatbot.js"></script>
   ```

3. Add HTML structure before closing `</body>`:
   ```html
   <!-- Copy content from chatbot-component.html -->
   ```

## Features

- Floating bottom-right position
- Responsive design for all screen sizes
- Minimalistic, clean design
- Real estate focused responses
- Interactive quick action buttons (appear as clickable messages after first bot message)
- Smooth animations
- Notification badge
- Clean chat interface without persistent buttons

## Customization

The chatbot uses the brand colors defined in the CSS:
- Primary: `#dfa974` (golden brown)
- Secondary: `#4ecdc4` (teal)
- Background: `#ffffff` (white)
- Text: `#333333` (dark gray)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Uses vanilla JavaScript (no dependencies)
