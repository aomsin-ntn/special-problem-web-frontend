import { writable } from 'svelte/store';

// 1. ปรับ Type ให้รัดกุมขึ้น (Strict Typing)
export interface AuthUser {
    userId: string;
    email: string;
    username: string;
    userType?: 'student' | 'staff'; // ใช้ Literal types แทน string ทั่วไป
}

export interface AuthStore {
    isLoggedIn: boolean;
    user: AuthUser | null;
}

// สร้างตัวแปรเช็ค Browser เพื่อความสะอาดของโค้ด
const BROWSER = typeof window !== 'undefined';

function createAuthStore() {
    let initialState: AuthStore = {
        isLoggedIn: false,
        user: null
    };

    if (BROWSER) {
        const storedUser = localStorage.getItem('authUser');
        const authToken = localStorage.getItem('authToken');

        if (storedUser && authToken) {
            try {
                initialState = {
                    isLoggedIn: true,
                    user: JSON.parse(storedUser)
                };
            } catch (e) {
                console.error('Failed to parse stored user:', e);
                // 2. ถ้า Parse พัง (เช่น ข้อมูล Corrupt) ควรลบทิ้งไปเลยเพื่อป้องกันบั๊ก
                localStorage.removeItem('authUser');
            }
        }
    }

    const { subscribe, set } = writable<AuthStore>(initialState);

    // 3. (โบนัส) Cross-tab Synchronization: ซิงค์ข้อมูลถ้ามีการ Login/Logout จากแท็บอื่น
    if (BROWSER) {
        window.addEventListener('storage', (event) => {
            if (event.key === 'authUser') {
                if (event.newValue) {
                    set({ isLoggedIn: true, user: JSON.parse(event.newValue) });
                } else {
                    set({ isLoggedIn: false, user: null });
                }
            }
        });
    }

    return {
        subscribe, // เปิดให้ Component อื่น subscribe (ใช้เครื่องหมาย $ ได้)
        
        // 4. รับ Token เข้ามาจัดการในที่เดียว เพื่อให้ Store เป็นผู้รับผิดชอบหลัก
        login: (user: AuthUser, token?: string) => {
            // ใช้ set ไปเลย เพราะเราเขียนทับ State ทั้งหมด
            set({ isLoggedIn: true, user });

            if (BROWSER) {
                localStorage.setItem('authUser', JSON.stringify(user));
                
                if (token) {
                    localStorage.setItem('authToken', token);
                    localStorage.setItem('userId', user.userId);
                    // แนะนำเพิ่ม Secure และ SameSite เพื่อความปลอดภัยของ Cookie
                    document.cookie = `authToken=${token}; path=/; max-age=86400; secure; samesite=strict`;
                    document.cookie = `userId=${user.userId}; path=/; max-age=86400; secure; samesite=strict`;
                }
            }
        },

        logout: () => {
            set({ isLoggedIn: false, user: null });

            if (BROWSER) {
                // เคลียร์ LocalStorage แบบกลุ่ม
                ['authUser', 'authToken', 'userId'].forEach(key => localStorage.removeItem(key));
                
                // วิธีเคลียร์ Cookie ที่ได้ผลแน่นอนที่สุดคือตั้งค่า Expires เป็นอดีต
                document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
                document.cookie = 'userId=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
            }
        }
        // 5. เอา set ออกจากการ Return เพื่อป้องกันไม่ให้ภายนอกแอบเปลี่ยน State โดยตรง
    };
}

export const authStore = createAuthStore();