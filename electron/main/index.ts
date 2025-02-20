import { app, BrowserWindow } from 'electron';
// ...existing imports...

async function createWindow() {
  win = new BrowserWindow({
    title: 'Drishti AI',
    icon: join(process.env.PUBLIC, 'logo.png'),
    // ...rest of existing window configuration...
  });

  // ...rest of existing window creation code...
}

// Update app name in development
if (process.env.NODE_ENV === 'development') {
  app.setName('Drishti AI');
}

// ...rest of existing code...
