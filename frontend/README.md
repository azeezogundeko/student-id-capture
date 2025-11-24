# Student Photo Capture Frontend

Next.js frontend application for the Student Photo Capture System with browser-based camera integration.

---

## Features

- Modern, responsive UI with Tailwind CSS
- Browser-based camera capture
- Class selection and creation
- Student photo gallery
- Real-time photo preview
- Mobile-friendly design
- TypeScript for type safety
- API integration with axios

---

## Tech Stack

- **Next.js 14** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Webcam** - Camera integration
- **Axios** - HTTP client

---

## Installation

```bash
npm install
```

---

## Configuration

Create a `.env.local` file based on `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

For production:
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.onrender.com
```

---

## Usage

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

---

## User Flow

1. **Select/Create Class**
   - Choose from existing classes
   - Or create a new class

2. **View Class Gallery**
   - See all students in the class
   - Click "Add Student" to capture new photo

3. **Capture Photo**
   - Browser requests camera permission
   - Take photo or retake if needed
   - Confirm when satisfied

4. **Enter Student Details**
   - Enter student name
   - Preview captured photo
   - Save to S3

5. **View Updated Gallery**
   - New student appears in gallery
   - Photos loaded from S3 via pre-signed URLs

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Main application page
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── CameraCapture.tsx  # Camera component
│   │   ├── ClassSelector.tsx  # Class selection UI
│   │   └── StudentGallery.tsx # Student gallery view
│   └── lib/
│       └── api.ts             # API client functions
├── public/                    # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── next.config.js
```

---

## Components

### CameraCapture
Browser-based camera component using React Webcam.

**Features:**
- Live camera preview
- Photo capture
- Retake functionality
- Error handling for camera permissions

**Props:**
```typescript
interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void;
  onCancel: () => void;
}
```

### ClassSelector
Class selection and creation interface.

**Features:**
- List all classes
- Create new class
- Navigate to class gallery

**Props:**
```typescript
interface ClassSelectorProps {
  classes: Class[];
  onSelectClass: (className: string) => void;
  onCreateClass: (className: string) => Promise<void>;
  isCreating: boolean;
}
```

### StudentGallery
Display all students in a class.

**Features:**
- Grid layout with student photos
- Responsive design
- Empty state handling

**Props:**
```typescript
interface StudentGalleryProps {
  students: Student[];
  className: string;
}
```

---

## API Integration

The frontend communicates with the backend API using axios. All API functions are in `src/lib/api.ts`:

```typescript
// Fetch all classes
const classes = await fetchClasses();

// Create a class
await createClass("JSS1 Jasper");

// Get students in a class
const students = await fetchStudents("JSS1 Jasper");

// Upload photo
await uploadPhoto(className, studentName, photoFile);

// Get pre-signed URL
const url = await getPresignedUrl(className, studentName);
```

---

## Styling

### Tailwind CSS

Custom theme configuration in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    // ... more shades
    900: '#0c4a6e',
  },
}
```

### Global Styles

Custom CSS classes defined in `globals.css`:

- `.btn-primary` - Primary button style
- `.btn-secondary` - Secondary button style
- `.btn-danger` - Danger/delete button style
- `.input-field` - Input field style
- `.card` - Card container style

---

## Camera Permissions

The application requires camera access to function. Users will see a browser permission prompt.

**Requirements:**
- HTTPS in production (camera API requires secure context)
- User must grant camera permission
- Camera must be available on device

**Error Handling:**
- Permission denied: Shows friendly error message
- No camera: Displays appropriate error
- Camera in use: Suggests closing other apps

---

## Browser Support

| Browser | Minimum Version | Camera Support |
|---------|----------------|----------------|
| Chrome | 53+ | ✅ |
| Firefox | 36+ | ✅ |
| Safari | 11+ | ✅ |
| Edge | 79+ | ✅ |
| iOS Safari | 11+ | ✅ |
| Chrome Mobile | 53+ | ✅ |

**Note**: Camera access requires HTTPS in production environments.

---

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repository:
1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your repository
4. Add environment variable: `NEXT_PUBLIC_API_URL`
5. Deploy

### Netlify

1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `.next`
4. Add environment variable: `NEXT_PUBLIC_API_URL`

For detailed deployment instructions, see [../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| NEXT_PUBLIC_API_URL | Yes | Backend API URL |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## Performance Optimization

### Image Optimization
Next.js automatically optimizes images. For S3 images:
- Images are loaded on-demand
- Pre-signed URLs are cached in state
- Consider adding CDN (CloudFront) for production

### Code Splitting
Next.js automatically code-splits by route. Additional optimization:
- Dynamic imports for heavy components
- Lazy loading for images
- Suspense boundaries for async components

### Lighthouse Scores (Target)
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+

---

## Troubleshooting

### Camera Not Working

**Problem**: Permission denied
```
Solution: Check browser permissions
Ensure HTTPS in production
Try different browser
```

**Problem**: Camera already in use
```
Solution: Close other applications using camera
Restart browser
```

### Images Not Loading

**Problem**: Network error
```
Solution: Check NEXT_PUBLIC_API_URL is correct
Verify backend is running
Check browser console for errors
```

**Problem**: CORS error
```
Solution: Ensure frontend URL is in backend FRONTEND_URL
Check CORS configuration on backend
```

### Build Errors

**Problem**: TypeScript errors
```
Solution: Run `npm run lint` to check for issues
Ensure all dependencies are installed
Check tsconfig.json configuration
```

---

## Development Tips

### Hot Reload
Next.js supports hot module replacement. Changes to components will reflect immediately without full page reload.

### TypeScript
- Use TypeScript for type safety
- Define interfaces for props
- Leverage IDE autocomplete

### Debugging
```typescript
// Enable verbose logging
console.log('API Response:', response);

// Use React DevTools
// Install browser extension for component inspection
```

---

## Future Enhancements

- [ ] Photo editing (crop, rotate, filters)
- [ ] Batch photo upload
- [ ] Offline support with PWA
- [ ] Print class roster
- [ ] Export to PDF
- [ ] Search and filter students
- [ ] Multiple photo angles per student
- [ ] Dark mode
- [ ] Internationalization (i18n)

---

## License

MIT
