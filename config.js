const WEDDING_CONFIG = { 
    // Wedding Details 
    coupleNames: "Lita & Arya", 
    weddingDate: "August 15, 2025", 
    weddingLocation: "Your Wedding Venue", 
    // App Customization 
    appTitle: "Wedding Photos - Share Your Moments", 
    welcomeMessage: "Share your special moments with us", 
    instructionText: "Tap the button above to capture and share your memories", 
    // Colors and Theme 
    primaryGradient: { start: "#667eea", end: "#764ba2" }, 
    buttonGradient: { start: "#ff6b6b", end: "#ee5a24" }, 
    // Camera Settings 
    camera: { preferredCamera: "environment", maxWidth: 1920, maxHeight: 1080, imageQuality: 0.9, photoFormat: "image/jpeg" }, 
    // Upload Settings 
    upload: { maxFileSize: 10 * 1024 * 1024, allowedFormats: ["image/jpeg", "image/png", "image/webp"], autoUpload: true, showPreview: true }, 
    // UI Settings 
    ui: { showLogo: true, logoEmoji: "💒", enableAnimations: true, enableHapticFeedback: true, showUploadProgress: true } 
};