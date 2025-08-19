class WeddingPhotoApp {
    constructor() {
        this.currentScreen = 'welcome';
        this.stream = null;
        this.capturedPhoto = null;
        this.config = window.WEDDING_CONFIG || {};
        
        this.initializeElements();
        this.applyConfiguration();
        this.bindEvents();
        this.checkCameraSupport();
    }

    applyConfiguration() {
        // Apply configuration to UI elements
        if (this.config.appTitle) {
            document.title = this.config.appTitle;
            document.getElementById('page-title').textContent = this.config.appTitle;
        }
        
        if (this.config.coupleNames) {
            const welcomeTitle = document.getElementById('welcome-title');
            if (welcomeTitle) {
                welcomeTitle.textContent = `Welcome to ${this.config.coupleNames}'s Wedding!`;
            }
        }
        
        if (this.config.welcomeMessage) {
            const subtitle = document.getElementById('welcome-subtitle');
            if (subtitle) {
                subtitle.textContent = this.config.welcomeMessage;
            }
        }
        
        if (this.config.instructionText) {
            const instruction = document.getElementById('welcome-instruction');
            if (instruction) {
                instruction.textContent = this.config.instructionText;
            }
        }
        
        if (this.config.ui && this.config.ui.logoEmoji) {
            const logo = document.getElementById('wedding-logo');
            if (logo) {
                logo.textContent = this.config.ui.logoEmoji;
            }
        }
        
        // Apply custom colors if specified
        if (this.config.primaryGradient) {
            document.documentElement.style.setProperty(
                '--primary-gradient-start', 
                this.config.primaryGradient.start
            );
            document.documentElement.style.setProperty(
                '--primary-gradient-end', 
                this.config.primaryGradient.end
            );
        }
    }

    initializeElements() {
        // Get all screen elements
        this.screens = {
            welcome: document.getElementById('welcome-screen'),
            camera: document.getElementById('camera-screen'),
            preview: document.getElementById('preview-screen'),
            upload: document.getElementById('upload-screen'),
            success: document.getElementById('success-screen'),
            error: document.getElementById('error-screen')
        };

        // Get camera elements
        this.cameraPreview = document.getElementById('camera-preview');
        this.photoCanvas = document.getElementById('photo-canvas');
        this.previewImage = document.getElementById('preview-image');
        
        // Get buttons
        this.takePhotoBtn = document.getElementById('take-photo-btn');
        this.backBtn = document.getElementById('back-btn');
        this.captureBtn = document.getElementById('capture-btn');
        this.retakeBtn = document.getElementById('retake-btn');
        this.shareBtn = document.getElementById('share-btn');
        this.takeAnotherBtn = document.getElementById('take-another-btn');
        this.tryAgainBtn = document.getElementById('try-again-btn');
    }

    bindEvents() {
        // Welcome screen
        this.takePhotoBtn.addEventListener('click', () => this.showCamera());
        
        // Camera screen
        this.backBtn.addEventListener('click', () => this.showWelcome());
        this.captureBtn.addEventListener('click', () => this.capturePhoto());
        
        // Preview screen
        this.retakeBtn.addEventListener('click', () => this.showCamera());
        this.shareBtn.addEventListener('click', () => this.uploadPhoto());
        
        // Success screen
        this.takeAnotherBtn.addEventListener('click', () => this.showCamera());
        
        // Error screen
        this.tryAgainBtn.addEventListener('click', () => this.showWelcome());
    }

    checkCameraSupport() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            this.showError('Camera is not supported on this device');
            this.takePhotoBtn.disabled = true;
            this.takePhotoBtn.textContent = 'Camera Not Supported';
        }
    }

    showScreen(screenName) {
        // Hide all screens
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
            this.currentScreen = screenName;
        }
    }

    showWelcome() {
        this.showScreen('welcome');
        this.stopCamera();
    }

    async showCamera() {
        this.showScreen('camera');
        await this.startCamera();
    }

    showPreview() {
        this.showScreen('preview');
    }

    showUpload() {
        this.showScreen('upload');
    }

    showSuccess() {
        this.showScreen('success');
    }

    showError(message = 'Something went wrong. Please try again.') {
        document.getElementById('error-message').textContent = message;
        this.showScreen('error');
    }

    async startCamera() {
        try {
            const constraints = {
                video: {
                    facingMode: this.config.camera?.preferredCamera || 'environment',
                    width: { ideal: this.config.camera?.maxWidth || 1920 },
                    height: { ideal: this.config.camera?.maxHeight || 1080 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.cameraPreview.srcObject = this.stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.cameraPreview.onloadedmetadata = resolve;
            });
            
        } catch (error) {
            console.error('Error accessing camera:', error);
            if (error.name === 'NotAllowedError') {
                this.showError(this.config.messages?.cameraAccessDenied || 'Camera access was denied. Please allow camera access and try again.');
            } else if (error.name === 'NotFoundError') {
                this.showError(this.config.messages?.noCameraFound || 'No camera found on this device.');
            } else {
                this.showError(this.config.messages?.cameraError || 'Failed to access camera. Please try again.');
            }
            this.showWelcome();
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.cameraPreview.srcObject) {
            this.cameraPreview.srcObject = null;
        }
    }

    capturePhoto() {
        if (!this.stream) return;

        try {
            // Set canvas dimensions to match video
            const videoWidth = this.cameraPreview.videoWidth;
            const videoHeight = this.cameraPreview.videoHeight;
            
            this.photoCanvas.width = videoWidth;
            this.photoCanvas.height = videoHeight;
            
            // Draw video frame to canvas
            const ctx = this.photoCanvas.getContext('2d');
            ctx.drawImage(this.cameraPreview, 0, 0, videoWidth, videoHeight);
            
            // Convert canvas to blob
            this.photoCanvas.toBlob((blob) => {
                if (blob) {
                    this.capturedPhoto = blob;
                    const imageUrl = URL.createObjectURL(blob);
                    this.previewImage.src = imageUrl;
                    this.showPreview();
                } else {
                    this.showError('Failed to capture photo. Please try again.');
                }
            }, this.config.camera?.photoFormat || 'image/jpeg', this.config.camera?.imageQuality || 0.9);
            
        } catch (error) {
            console.error('Error capturing photo:', error);
            this.showError('Failed to capture photo. Please try again.');
        }
    }

    async uploadPhoto() {
        if (!this.capturedPhoto) {
            this.showError('No photo to upload.');
            return;
        }

        this.showUpload();

        try {
            // Upload directly to Google Cloud Storage
            const result = await this.uploadToServer(this.capturedPhoto);
            
            if (result.success) {
                console.log('Photo uploaded successfully:', result.publicUrl);
                this.showSuccess();
            } else {
                throw new Error(result.error || 'Upload failed');
            }
            
        } catch (error) {
            console.error('Upload error:', error);
            this.showError(`Failed to upload photo: ${error.message}`);
        }
    }



    async uploadToServer(photoBlob) {
        try {
            // Generate unique filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const uniqueId = Math.random().toString(36).substring(2, 10);
            const filename = `wedding-photos/${timestamp}_${uniqueId}.jpg`;
            
            // Convert blob to base64 for direct upload
            const base64Data = await this.blobToBase64(photoBlob);
            
            // Create the upload URL for Google Cloud Storage
            const bucketName = 'bucket-armalino-photo';
            const uploadUrl = `https://storage.googleapis.com/upload/storage/v1/b/${bucketName}/o`;
            
            // Prepare the upload request
            const params = new URLSearchParams({
                name: filename,
                uploadType: 'media'
            });
            
            const response = await fetch(`${uploadUrl}?${params}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'image/jpeg',
                    'Content-Length': photoBlob.size.toString()
                },
                body: photoBlob
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload failed:', response.status, errorText);
                throw new Error(`Upload failed: ${response.status} - ${errorText}`);
            }
            
            const result = await response.json();
            console.log('Upload successful:', result);
            
            // Make the file publicly accessible
            await this.makeFilePublic(filename);
            
            return {
                success: true,
                filename: filename,
                publicUrl: `https://storage.googleapis.com/${bucketName}/${filename}`,
                size: photoBlob.size,
                uploadedAt: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Upload error:', error);
            throw new Error(`Upload failed: ${error.message}`);
        }
    }
    
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    
    async makeFilePublic(filename) {
        try {
            const bucketName = 'bucket-armalino-photo';
            const aclUrl = `https://storage.googleapis.com/storage/v1/b/${bucketName}/o/${encodeURIComponent(filename)}/acl`;
            
            const response = await fetch(aclUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    entity: 'allUsers',
                    role: 'READER'
                })
            });
            
            if (!response.ok) {
                console.warn('Failed to make file public:', response.status);
            } else {
                console.log('File made public successfully');
            }
        } catch (error) {
            console.warn('Error making file public:', error);
        }
    }

    // Utility method to handle orientation changes
    handleOrientationChange() {
        // Add orientation change handling if needed
        if (window.orientation === 0 || window.orientation === 180) {
            // Portrait
            document.body.classList.remove('landscape');
        } else {
            // Landscape
            document.body.classList.add('landscape');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new WeddingPhotoApp();
    
    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
        setTimeout(() => app.handleOrientationChange(), 100);
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        app.handleOrientationChange();
    });
    
    // Prevent zoom on double tap (mobile)
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    // Prevent pull-to-refresh on mobile
    document.addEventListener('touchmove', (event) => {
        if (event.scale !== 1) {
            event.preventDefault();
        }
    }, { passive: false });
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 