/**
 * VideoVerse 2.0 - Core Script Entry
 * Exports player context, YouTube controller, and Firebase integration.
 */
import './src/main.tsx';
export { youtubeService } from './src/services/youtube';
export { initFirebase, isFirebaseActive } from './src/services/firebase';
