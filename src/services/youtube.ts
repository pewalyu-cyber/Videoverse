// YouTube IFrame API Singleton Controller

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export interface YTPlayerCallbacks {
  onReady: () => void;
  onStateChange: (state: number) => void;
  onError: (errorCode: number) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
}

class YouTubeService {
  private player: any = null;
  private isApiLoaded = false;
  private isReady = false;
  private currentVideoId: string | null = null;
  private timerInterval: any = null;
  private callbacks: Partial<YTPlayerCallbacks> = {};

  public loadApi(): Promise<void> {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) {
        this.isApiLoaded = true;
        resolve();
        return;
      }

      const existingScript = document.getElementById('youtube-iframe-api');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        this.isApiLoaded = true;
        resolve();
      };
    });
  }

  public initPlayer(containerId: string, callbacks: YTPlayerCallbacks) {
    this.callbacks = callbacks;

    if (!window.YT || !window.YT.Player) {
      this.loadApi().then(() => this.createPlayer(containerId));
    } else {
      this.createPlayer(containerId);
    }
  }

  private createPlayer(containerId: string) {
    const element = document.getElementById(containerId);
    if (!element) return;

    if (this.player) {
      try {
        this.player.destroy();
      } catch {
        // ignore
      }
    }

    try {
      this.player = new window.YT.Player(containerId, {
        height: '100%',
        width: '100%',
        videoId: this.currentVideoId || '4NRXx6U8ABQ',
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          fs: 1,
          iv_load_policy: 3,
          enablejsapi: 1,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            this.isReady = true;
            this.startProgressTicker();
            if (this.callbacks.onReady) this.callbacks.onReady();
          },
          onStateChange: (event: any) => {
            if (this.callbacks.onStateChange) {
              this.callbacks.onStateChange(event.data);
            }
          },
          onError: (event: any) => {
            console.error('YouTube Player Error Code:', event.data);
            if (this.callbacks.onError) {
              this.callbacks.onError(event.data);
            }
          }
        }
      });
    } catch (err) {
      console.error('Failed to construct YT.Player:', err);
    }
  }

  private startProgressTicker() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.player && this.isReady && typeof this.player.getCurrentTime === 'function') {
        try {
          const currentTime = this.player.getCurrentTime() || 0;
          const duration = this.player.getDuration() || 0;
          if (this.callbacks.onTimeUpdate) {
            this.callbacks.onTimeUpdate(currentTime, duration);
          }
        } catch {
          // ignore transient player errors
        }
      }
    }, 250);
  }

  public loadVideo(videoId: string, autoPlay = true) {
    this.currentVideoId = videoId;
    if (this.player && this.isReady) {
      try {
        if (autoPlay) {
          this.player.loadVideoById(videoId);
        } else {
          this.player.cueVideoById(videoId);
        }
      } catch (e) {
        console.warn('Error loading video:', e);
      }
    }
  }

  public play() {
    if (this.player && this.isReady && typeof this.player.playVideo === 'function') {
      try {
        this.player.playVideo();
      } catch (e) {
        console.warn('Play error:', e);
      }
    }
  }

  public pause() {
    if (this.player && this.isReady && typeof this.player.pauseVideo === 'function') {
      try {
        this.player.pauseVideo();
      } catch (e) {
        console.warn('Pause error:', e);
      }
    }
  }

  public seekTo(seconds: number) {
    if (this.player && this.isReady && typeof this.player.seekTo === 'function') {
      try {
        this.player.seekTo(seconds, true);
      } catch (e) {
        console.warn('Seek error:', e);
      }
    }
  }

  public setVolume(vol: number) {
    if (this.player && this.isReady && typeof this.player.setVolume === 'function') {
      try {
        this.player.setVolume(Math.max(0, Math.min(100, vol)));
      } catch (e) {
        console.warn('Volume error:', e);
      }
    }
  }

  public mute() {
    if (this.player && this.isReady && typeof this.player.mute === 'function') {
      try {
        this.player.mute();
      } catch (e) {
        console.warn('Mute error:', e);
      }
    }
  }

  public unMute() {
    if (this.player && this.isReady && typeof this.player.unMute === 'function') {
      try {
        this.player.unMute();
      } catch (e) {
        console.warn('Unmute error:', e);
      }
    }
  }

  public destroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.player) {
      try {
        this.player.destroy();
      } catch {
        // ignore
      }
      this.player = null;
      this.isReady = false;
    }
  }
}

export const youtubeService = new YouTubeService();
