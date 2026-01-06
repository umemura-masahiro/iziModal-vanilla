# iziModal Vanilla

[![npm version](https://img.shields.io/npm/v/izimodal-vanilla.svg)](https://www.npmjs.com/package/izimodal-vanilla)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

Elegant, responsive, flexible and lightweight modal plugin with **Vanilla JavaScript** (no jQuery required).

This is a complete rewrite of the original [iziModal](https://github.com/marcelodolza/iziModal) without jQuery dependency, using modern ES6+ JavaScript.

![iziModal Demo](http://i.imgur.com/UneCF3L.gif)

## ✨ Features

- 🚀 **Fast** - Lightweight and optimized
- 📱 **Responsive** - Works on all devices
- 🎨 **Animated** - Beautiful transitions
- 🪶 **Lightweight** - Only ~23KB minified (vs 50KB jQuery version)
- ⚙️ **Customizable** - Extensive options
- 📜 **History** - Browser history support
- 👥 **Group Mode** - Navigate between modals
- 🎯 **No Dependencies** - Pure Vanilla JavaScript

## 📦 Installation

### npm

```bash
npm install izimodal-vanilla
```

### CDN

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/izimodal-vanilla@2/css/iziModal.min.css" />
<script type="module">
  import iziModal from 'https://cdn.jsdelivr.net/npm/izimodal-vanilla@2/dist/iziModal.esm.min.js';
</script>
```

## 🚀 Usage

### Basic Example

```html
<!DOCTYPE html>
<html>
  <head>
    <link rel="stylesheet" href="node_modules/izimodal-vanilla/css/iziModal.css" />
  </head>
  <body>
    <button data-iziModal-open="#myModal">Open Modal</button>

    <div id="myModal">
      <h2>Hello!</h2>
      <p>This is a modal.</p>
    </div>

    <script type="module">
      import iziModal from './node_modules/izimodal-vanilla/dist/iziModal.esm.js';

      iziModal('#myModal', {
        title: 'Welcome',
        subtitle: 'This is a subtitle',
        headerColor: '#88A0B9',
        width: 600,
        onOpened: (modal) => {
          console.log('Modal opened!');
        },
      });
    </script>
  </body>
</html>
```

### Programmatic Usage

```javascript
import iziModal from 'izimodal-vanilla';

// Create modal instance
const modal = iziModal('#myModal', {
  title: 'My Modal',
  subtitle: 'Subtitle here',
  width: 600,
});

// Open modal
modal.open();

// Close modal
modal.close();

// Set title dynamically
modal.setTitle('New Title');

// Destroy modal
modal.destroy();
```

### Method Calls (jQuery-like syntax)

```javascript
// Open
iziModal('#myModal', 'open');

// Close
iziModal('#myModal', 'close');

// Set title
iziModal('#myModal', 'setTitle', 'New Title');

// Get state
const state = iziModal('#myModal', 'getState');
```

## ⚙️ Options

```javascript
iziModal('#modal', {
  title: '', // Modal title
  subtitle: '', // Modal subtitle
  headerColor: '#88A0B9', // Header background color
  background: null, // Modal background
  theme: '', // Theme: 'light' or custom class
  icon: null, // Icon class
  iconText: null, // Icon text
  iconColor: '', // Icon color
  rtl: false, // Right to left
  width: 600, // Modal width
  top: null, // Top margin
  bottom: null, // Bottom margin
  borderBottom: true, // Border bottom
  padding: 0, // Content padding
  radius: 3, // Border radius
  zindex: 999, // Z-index
  iframe: false, // Enable iframe
  iframeHeight: 400, // Iframe height
  iframeURL: null, // Iframe URL
  focusInput: true, // Focus first input
  group: '', // Group name
  loop: false, // Loop navigation
  arrowKeys: true, // Arrow key navigation
  navigateCaption: true, // Show navigation caption
  navigateArrows: true, // Show navigation arrows
  history: false, // Browser history
  restoreDefaultContent: false, // Restore content on close
  autoOpen: 0, // Auto open (ms or true)
  bodyOverflow: false, // Hide body overflow
  fullscreen: false, // Enable fullscreen button
  openFullscreen: false, // Open in fullscreen
  closeOnEscape: true, // Close on ESC key
  closeButton: true, // Show close button
  appendTo: 'body', // Append to element
  appendToOverlay: 'body', // Append overlay to element
  overlay: true, // Show overlay
  overlayClose: true, // Close on overlay click
  overlayColor: 'rgba(0, 0, 0, 0.4)', // Overlay color
  timeout: false, // Auto close timeout
  timeoutProgressbar: false, // Show progress bar
  pauseOnHover: false, // Pause on hover
  timeoutProgressbarColor: 'rgba(255,255,255,0.5)',
  transitionIn: 'comingIn', // Open transition
  transitionOut: 'comingOut', // Close transition
  transitionInOverlay: 'fadeIn',
  transitionOutOverlay: 'fadeOut',

  // Callbacks
  onFullscreen: function () {},
  onResize: function () {},
  onOpening: function () {},
  onOpened: function () {},
  onClosing: function () {},
  onClosed: function () {},
  afterRender: function () {},
});
```

## 📚 Methods

```javascript
const modal = iziModal('#myModal');

modal.open(); // Open modal
modal.close(); // Close modal
modal.toggle(); // Toggle modal
modal.destroy(); // Destroy modal
modal.getState(); // Get current state
modal.getGroup(); // Get group info
modal.next(); // Next modal in group
modal.prev(); // Previous modal in group
modal.setTitle('Title'); // Set title
modal.setSubtitle('Subtitle'); // Set subtitle
modal.setContent('Content'); // Set content
modal.setIcon('icon-class'); // Set icon
modal.setIconText('Text'); // Set icon text
modal.setHeaderColor('#color'); // Set header color
modal.setBackground('#color'); // Set background
modal.setZindex(1000); // Set z-index
modal.setWidth(800); // Set width
modal.setTop(50); // Set top margin
modal.setBottom(50); // Set bottom margin
modal.setFullscreen(true); // Set fullscreen
modal.startLoading(); // Show loader
modal.stopLoading(); // Hide loader
modal.startProgress(3000); // Start progress bar
modal.pauseProgress(); // Pause progress
modal.resumeProgress(); // Resume progress
modal.resetProgress(); // Reset progress
```

## 🎯 Events

```javascript
iziModal('#modal', {
  onOpening: function (modal) {
    console.log('Opening...');
  },
  onOpened: function (modal) {
    console.log('Opened!');
  },
  onClosing: function (modal) {
    console.log('Closing...');
  },
  onClosed: function (modal) {
    console.log('Closed!');
  },
  onFullscreen: function (modal) {
    console.log('Fullscreen toggled');
  },
  onResize: function (modal) {
    console.log('Resized');
  },
  afterRender: function (modal) {
    console.log('Rendered');
  },
});
```

## 🔄 Migration from jQuery version (v1.x)

### Main Differences

1. **No jQuery Required** - Pure Vanilla JavaScript
2. **ES6 Modules** - Use `import` instead of `<script>` tags
3. **Smaller Size** - ~23KB vs ~50KB (54% reduction)
4. **Modern Browsers** - Targets ES6+ browsers (no IE11)

### Migration Example

**Before (jQuery v1.x):**

```javascript
$('#modal').iziModal({
  title: 'Hello',
});
$('#modal').iziModal('open');
```

**After (Vanilla v2.x):**

```javascript
import iziModal from 'izimodal-vanilla';

const modal = iziModal('#modal', {
  title: 'Hello',
});
modal.open();

// Or jQuery-like syntax still works:
iziModal('#modal', 'open');
```

## 📊 File Size Comparison

| Version       | Size (min) | Size (gzip) |
| ------------- | ---------- | ----------- |
| jQuery v1.x   | ~50KB      | ~15KB       |
| Vanilla v2.x  | ~23KB      | ~8KB        |
| **Reduction** | **54%**    | **47%**     |

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Opera (latest)

**Note:** IE11 is not supported. Use v1.x if you need IE11 support.

## 📝 License

Apache-2.0 License

Copyright (c) Marcelo Dolza

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📮 Links

- [Original iziModal (jQuery)](https://github.com/marcelodolza/iziModal)
- [Demo](demo.html)
- [npm Package](https://www.npmjs.com/package/izimodal-vanilla)

## 👨‍💻 Author

**Marcelo Dolza**

- Website: [https://dolza.dev](https://dolza.dev)
- Email: marcelodolza@gmail.com

---

Made with ❤️ using Vanilla JavaScript
