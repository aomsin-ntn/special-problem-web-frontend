import { writable } from 'svelte/store';
import { PUBLIC_API_URL } from '$env/static/public';

interface AuthState {
    isLoggedIn: boolean;
    user: User | null;
}

interface User {
    id: string;
    student_id: string;
    user_name_th: string;
    email: string;
    role: string;
}

export const authStore = writable<AuthState>({
    isLoggedIn: false,
    user: null
});

export const checkAuth = async () => {
    try {
        const response = await fetch(`${PUBLIC_API_URL}/auth/protected`, {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            authStore.set({ isLoggedIn: true, user: data.user });
        } else {
            authStore.set({ isLoggedIn: false, user: null });
        }
    } catch (error) {
        authStore.set({ isLoggedIn: false, user: null });
    }
};

export const logoutAuth = async () => {
    try {
        await fetch(`${PUBLIC_API_URL}/auth/logout`, {
            method: 'POST', 
            credentials: 'include' 
        });

        authStore.set({ isLoggedIn: false, user: null });
    } catch (error) {
        console.error("Logout failed:", error);
        authStore.set({ isLoggedIn: false, user: null });
    }
};