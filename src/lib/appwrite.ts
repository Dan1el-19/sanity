import { Client, TablesDB, Account, OAuthProvider } from "appwrite";

// Sanity używa SANITY_STUDIO_ prefix i process.env!
const endpoint = process.env.SANITY_STUDIO_APPWRITE_ENDPOINT;
const projectId = process.env.SANITY_STUDIO_APPWRITE_PROJECT_ID;

export const databaseId: string | undefined = process.env.SANITY_STUDIO_APPWRITE_DATABASE_ID;
export const appointmentsCollectionId: string | undefined =
  process.env.SANITY_STUDIO_APPWRITE_APPOINTMENTS_COLLECTION_ID;

const client = new Client();
client.setEndpoint(endpoint as string).setProject(projectId as string);

// Nowe TablesDB API zamiast starego Databases
export const tablesDB: TablesDB = new TablesDB(client);
export const account: Account = new Account(client);

// Auth state management
export interface AuthUser {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
}

export class AppwriteAuth {
  private static instance: AppwriteAuth;
  private currentUser: AuthUser | null = null;
  private listeners: Array<(user: AuthUser | null) => void> = [];
  private isInitialized: boolean = false;
  private initPromise: Promise<AuthUser | null> | null = null;

  static getInstance(): AppwriteAuth {
    if (!AppwriteAuth.instance) {
      AppwriteAuth.instance = new AppwriteAuth();
    }
    return AppwriteAuth.instance;
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    // If we're in the middle of initialization, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    // If already initialized, return cached user
    if (this.isInitialized) {
      return this.currentUser;
    }

    // Start initialization
    this.initPromise = this.initializeUser();
    return this.initPromise;
  }

  private async initializeUser(): Promise<AuthUser | null> {
    try {
      console.log('[AppwriteAuth] Initializing user session...');
      const user = await account.get();
      this.currentUser = user as AuthUser;
      this.isInitialized = true;
      console.log('[AppwriteAuth] User session found:', user.email);
      return this.currentUser;
    } catch {
      console.log('[AppwriteAuth] No active session found');
      this.currentUser = null;
      this.isInitialized = true;
      return null;
    } finally {
      this.initPromise = null;
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      // Get current URL to redirect back to the same tool after auth
      const currentUrl = window.location.href;
      
      // Clean any existing OAuth parameters from URL
      const cleanUrl = currentUrl.split('?')[0] + window.location.hash;
      
      console.log('[AppwriteAuth] Starting Google OAuth, will redirect to:', cleanUrl);
      
      await account.createOAuth2Session(
        OAuthProvider.Google,
        cleanUrl, // success URL
        cleanUrl  // failure URL - same as success, we'll handle errors in the app
      );
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  }

  async loginWithGitHub(): Promise<void> {
    try {
      // Get current URL to redirect back to the same tool after auth
      const currentUrl = window.location.href;
      
      // Clean any existing OAuth parameters from URL
      const cleanUrl = currentUrl.split('?')[0] + window.location.hash;
      
      console.log('[AppwriteAuth] Starting GitHub OAuth, will redirect to:', cleanUrl);
      
      await account.createOAuth2Session(
        OAuthProvider.Github,
        cleanUrl, // success URL
        cleanUrl  // failure URL - same as success, we'll handle errors in the app
      );
    } catch (error) {
      console.error('GitHub login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
      this.currentUser = null;
      this.isInitialized = true; // Keep initialized state
      this.notifyListeners(null);
      console.log('[AppwriteAuth] User logged out');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  onAuthChange(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(user: AuthUser | null): void {
    this.listeners.forEach(listener => listener(user));
  }

  async checkAuthAndRefresh(): Promise<AuthUser | null> {
    // Force refresh of current user status
    this.isInitialized = false;
    this.currentUser = null;
    
    const user = await this.getCurrentUser();
    this.notifyListeners(user);
    return user;
  }
}

export function getEnvVar(key: string, { required = true }: { required?: boolean } = {}): string | undefined {
  const val = process.env[key];
  if (!val && required) {
    throw new Error(`${key} is required`);
  }
  return val;
}