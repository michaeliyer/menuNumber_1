# 🔊 Voice & Audio Accessibility System

## Overview

The menu system now includes comprehensive voice and audio accessibility features that allow users to hear menu items read aloud. This system supports both built-in text-to-speech and custom recorded audio files.

## 🎯 Features

### ✅ **Built-in Text-to-Speech (Web Speech API)**

- Click any menu item, section header, or main header to hear it read aloud
- Adjustable voice settings (voice selection, speed, pitch)
- Visual feedback during speech with pulsing animations
- Works offline once page is loaded
- Supports multiple languages and voices

### ✅ **Custom Recorded Audio Support**

- Upload your own voice recordings for personalized experience
- Automatic fallback to text-to-speech if custom audio fails
- Professional branding opportunity for restaurants

### ✅ **Accessibility Features**

- Keyboard accessible controls
- Clear visual indicators for clickable elements
- Speaking animations with blue pulsing effect
- Audio icons appear on hover
- WCAG 2.1 compliant design

## 🚀 How to Use

### **Basic Usage**

1. Open any menu in the system
2. Click the hamburger menu (☰) in the top-right
3. Enter your access code when prompted
4. Click "Voice Controls" to open the voice panel
5. Click "Enable Voice" to activate the system
6. Click any menu item or header to hear it read aloud

### **Voice Controls**

- **Voice Selection**: Choose from available system voices
- **Speed Control**: Adjust reading speed (0.5x to 2.0x)
- **Pitch Control**: Modify voice pitch (0.5 to 2.0)
- **Test Voice**: Preview current voice settings

## 📁 Custom Audio Setup

### **1. Create Audio Directory Structure**

```
your-project/
├── audio/
│   ├── menu-audio-mappings.json
│   ├── grilled-salmon.mp3
│   ├── chicken-caesar-salad.mp3
│   └── chocolate-cake.mp3
```

### **2. Create Audio Mapping File**

Create `audio/menu-audio-mappings.json`:

```json
{
  "Grilled Salmon - $28": "grilled-salmon.mp3",
  "Chicken Caesar Salad - $16": "chicken-caesar-salad.mp3",
  "Chocolate Cake - $9": "chocolate-cake.mp3",
  "Menu section: Appetizers": "appetizers-header.mp3",
  "Lunch Menu for 2024-01-15": "lunch-menu-intro.mp3"
}
```

### **3. Recording Tips**

- **Format**: MP3, WAV, or OGG (MP3 recommended for compatibility)
- **Quality**: 44.1kHz, 128kbps minimum
- **Duration**: Keep recordings concise (under 30 seconds per item)
- **Content**: Match the exact text that appears in the menu
- **Tone**: Clear, professional, consistent pacing

### **4. File Naming Convention**

- Use lowercase with hyphens: `grilled-salmon.mp3`
- Avoid spaces and special characters
- Keep names descriptive but short

## 🛠️ Technical Details

### **Browser Support**

- ✅ **Chrome/Edge**: Full support for all features
- ✅ **Firefox**: Full support for all features
- ✅ **Safari**: Full support for all features
- ✅ **Mobile Safari (iOS)**: Full support
- ✅ **Chrome Mobile (Android)**: Full support

### **API Usage**

The system uses the Web Speech API's `SpeechSynthesisUtterance` interface:

```javascript
// Basic usage example
const utterance = new SpeechSynthesisUtterance(
  "Hello, welcome to our restaurant"
);
utterance.rate = 1.0;
utterance.pitch = 1.0;
speechSynthesis.speak(utterance);
```

### **Custom Audio Integration**

```javascript
// Load custom audio mappings
await loadCustomAudio();

// The system automatically checks for custom audio first,
// then falls back to text-to-speech if not found
```

## 🎨 Visual Indicators

### **Hover States**

- Blue highlight background on hover
- Audio icon (🔊) appears in top-right corner
- Slight scale animation (1.02x) for feedback

### **Speaking States**

- Blue pulsing animation during speech
- Consistent visual feedback across all elements
- Animation stops when speech completes

### **Click Feedback**

- Brief scale-down animation (0.98x) on click
- Immediate visual response for better UX

## 🔧 Advanced Configuration

### **Voice Settings Persistence**

Voice preferences are saved in browser session and persist across page reloads.

### **Multiple Language Support**

The system automatically detects and supports all voices installed on the user's system, including multiple languages.

### **Performance Optimization**

- Audio files are loaded on-demand
- Text-to-speech uses minimal resources
- Graceful fallbacks prevent system failures

## 🚨 Troubleshooting

### **Voice Not Working**

1. Check browser console for error messages
2. Ensure voice mode is enabled in controls
3. Try the "Test Voice" button
4. Check if browser supports Web Speech API

### **Custom Audio Issues**

1. Verify file paths in `menu-audio-mappings.json`
2. Check audio file formats (MP3 recommended)
3. Ensure files are accessible via web server
4. Check browser console for loading errors

### **iOS Specific Issues**

1. Ensure user interaction before speech (required by iOS)
2. Check Safari settings for media autoplay
3. Use debug mode: add `?debug=true` to URL

## 🎯 Best Practices

### **Content Strategy**

1. **Complete Descriptions**: Include ingredients and descriptions in speech
2. **Natural Language**: Write menu descriptions that sound natural when spoken
3. **Consistent Formatting**: Use consistent price and description formats

### **Voice Recording**

1. **Professional Quality**: Use good microphone and quiet environment
2. **Consistent Speaker**: Use same voice talent for all recordings
3. **Clear Pronunciation**: Speak clearly and at moderate pace
4. **Background Music**: Consider subtle background music for ambiance

### **Accessibility**

1. **Keyboard Navigation**: Ensure all features work with keyboard only
2. **Screen Reader Compatibility**: Test with screen readers
3. **High Contrast**: Use clear visual indicators
4. **Multiple Methods**: Provide both audio and visual information

## 📊 Analytics & Insights

### **Usage Tracking**

Monitor voice system usage to understand customer preferences:

- Most frequently clicked items
- Voice setting preferences
- Session duration with voice enabled

### **Customer Feedback**

Gather feedback on:

- Voice quality and speed preferences
- Usefulness of custom recordings vs. text-to-speech
- Accessibility improvements needed

## 🔮 Future Enhancements

### **Potential Additions**

- **Voice Commands**: "Read me the appetizers"
- **Auto-Reading**: Automatically read sections when scrolled to
- **Multilingual Support**: Custom recordings in multiple languages
- **Voice Ordering**: Integration with ordering systems
- **Personalization**: User preference storage across visits

### **Advanced Features**

- **AI Voice Cloning**: Generate consistent voice across all items
- **Dynamic Descriptions**: Read daily specials or modifications
- **Interactive Voice**: Answer questions about ingredients or allergens

---

## 🆘 Support

For technical support or questions about the voice system:

1. Check the browser console for detailed error messages
2. Use debug mode (`?debug=true`) for troubleshooting
3. Verify Web Speech API support in browser
4. Test with simple text before custom audio implementation

**Remember**: The voice system enhances accessibility and provides a premium experience for visually impaired customers and anyone who prefers audio information!
