# Wedding Photos - Share Your Moments

A simple, mobile-first web application that allows wedding guests to easily take photos on their smartphones and have them automatically collected. No app downloads, no logins, no manual sharing—just point, shoot, and share the moment.

## ✨ Features

- **Mobile-First Design**: Optimized for smartphone use with elegant, intuitive interface
- **Native Camera Access**: Direct access to device camera through web browser
- **One-Click Photo Sharing**: Simple tap-to-capture and automatic upload
- **No Authentication Required**: Guests can start taking photos immediately
- **PWA Support**: Can be installed as a home screen app
- **Offline Capability**: Basic functionality works without internet connection
- **Responsive Design**: Works on all device sizes and orientations

## 🚀 Quick Start

### Option 1: Local Development

1. **Clone or download** the project files
2. **Open** `index.html` in a modern web browser
3. **Test** the camera functionality (requires HTTPS for camera access)

### Option 2: Local Server (Recommended for Development)

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

### Option 3: Deploy to Web Server

1. Upload all files to your web hosting service
2. Ensure HTTPS is enabled (required for camera access)
3. Share the URL with your wedding guests

## 📱 How It Works

### For Wedding Guests:
1. **Scan QR Code** or click link from wedding website
2. **Tap "Take a Photo"** button
3. **Allow camera access** when prompted
4. **Take photo** using the large capture button
5. **Preview and confirm** the photo
6. **Photo automatically uploads** to the couple's collection
7. **Success confirmation** appears
8. **Option to take another photo**

### For the Wedding Couple:
1. **Set up the app** on your web server
2. **Configure Google Drive integration** (see setup instructions below)
3. **Share the app URL** with guests via QR codes, wedding website, etc.
4. **Photos automatically appear** in your designated Google Drive folder

## ⚙️ Setup & Configuration

### Basic Setup
The app works out-of-the-box for demonstration purposes. Photos are simulated as uploaded successfully.

### Google Drive Integration (Production Use)

To enable actual photo uploads to Google Drive:

1. **Set up Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google Drive API

2. **Create Service Account**:
   - Go to IAM & Admin > Service Accounts
   - Create new service account
   - Download JSON key file

3. **Set up Backend Server**:
   - Create a simple backend (Node.js, Python, etc.)
   - Use Google Drive API to upload photos
   - Update the `uploadToServer()` function in `script.js`

4. **Configure Upload Endpoint**:
   ```javascript
   // In script.js, replace the uploadToServer function:
   async uploadToServer(photoBlob) {
       const formData = new FormData();
       formData.append('photo', photoBlob, `wedding_photo_${Date.now()}.jpg`);
       
       const response = await fetch('/api/upload', {
           method: 'POST',
           body: formData
       });
       
       if (!response.ok) {
           throw new Error('Upload failed');
       }
       
       return response.json();
   }
   ```

### Customization

#### Change Wedding Couple Names
Edit the `index.html` file:
```html
<h1>Welcome to [Your Names]'s Wedding!</h1>
```

#### Modify Colors and Styling
Edit the `style.css` file:
```css
body {
    background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
}
```

#### Add Custom Logo
Replace the emoji logo in `index.html`:
```html
<div class="logo">
    <img src="your-logo.png" alt="Wedding Logo">
</div>
```

## 🔧 Technical Details

### Browser Requirements
- **Modern browsers** with camera API support
- **HTTPS required** for camera access (except localhost)
- **Mobile browsers** recommended for best experience

### Supported Features
- ✅ Camera access via `getUserMedia` API
- ✅ Photo capture and preview
- ✅ Responsive design for all screen sizes
- ✅ PWA installation capability
- ✅ Offline functionality
- ✅ Touch gesture support

### File Structure
```
wedding-photos/
├── index.html          # Main application file
├── style.css           # Styling and responsive design
├── script.js           # Camera functionality and app logic
├── sw.js              # Service worker for PWA
├── manifest.json      # PWA manifest
└── README.md          # This file
```

## 🌐 Deployment Options

### Static Hosting Services
- **Netlify**: Drag and drop deployment
- **Vercel**: Git-based deployment
- **GitHub Pages**: Free hosting for public repositories
- **Firebase Hosting**: Google's hosting service

### Traditional Web Hosting
- Upload files via FTP/SFTP
- Ensure HTTPS is enabled
- Configure proper MIME types

### Cloud Platforms
- **AWS S3 + CloudFront**: Scalable static hosting
- **Google Cloud Storage**: Integrated with Google Drive
- **Azure Static Web Apps**: Microsoft's hosting solution

## 📊 Analytics & Monitoring

### Basic Analytics
Add Google Analytics or similar service to track usage:
```html
<!-- Add to index.html head section -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Photo Upload Monitoring
Monitor successful uploads and errors through your backend logging system.

## 🔒 Privacy & Security

### Data Handling
- Photos are uploaded directly to your configured storage
- No photos are stored on the web app server
- Consider implementing photo moderation if needed

### Security Considerations
- Use HTTPS for all production deployments
- Implement rate limiting on upload endpoints
- Consider file size and type restrictions
- Monitor for abuse or inappropriate content

## 🆘 Troubleshooting

### Common Issues

**Camera not working:**
- Ensure HTTPS is enabled (required for camera access)
- Check browser permissions for camera access
- Try refreshing the page

**Photos not uploading:**
- Check internet connection
- Verify backend server is running
- Check browser console for error messages

**App not loading:**
- Clear browser cache
- Try different browser
- Check file permissions on server

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Safari**: Full support (iOS 11+)
- **Firefox**: Full support
- **Opera**: Full support

## 🤝 Contributing

This is a simple, focused application designed for wedding use. If you have suggestions for improvements:

1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 💝 Support

For questions or support:
- Check the troubleshooting section above
- Review browser console for error messages
- Ensure all files are properly uploaded to your server

---

**Happy Wedding Day!** 💒✨

May this app help capture all your special moments and create beautiful memories for years to come. 