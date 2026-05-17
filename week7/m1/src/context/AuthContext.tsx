import { postSignin } from "../apis/auth";
import { LOCAL_STORAGE_KEY } from "../constants/key";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { type ReqSignInDto } from "../types/auth";
import { postLogout, deleteAccount as deleteAccountApi } from "../apis/auth";
import { createContext, useState, useContext, type PropsWithChildren } from "react";

interface AuthContextType {
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    userId: number | null;
    login: (signInData: ReqSignInDto) => Promise<void>;
    logout: () => Promise<void>;
    deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    userId: null,
    login: async () => {},
    logout: async () => {},
    deleteAccount: async () => {},
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
    const {
        getItem: getAccessTokenInStorage,
        setItem: setAccessTokenInStorage,
        removeItem: removeAccessTokenInStorage,
    } = useLocalStorage(LOCAL_STORAGE_KEY.ACCESS_TOKEN);
    const {
        getItem: getRefreshTokenInStorage,
        setItem: setRefreshTokenInStorage,
        removeItem: removeRefreshTokenInStorage,
    } = useLocalStorage(LOCAL_STORAGE_KEY.REFRESH_TOKEN);
    const {
        getItem: getUserIdFromStorage,
        setItem: setUserIdInStorage,
        removeItem: removeUserIdInStorage,
    } = useLocalStorage(LOCAL_STORAGE_KEY.USER_ID);

    const [accessToken, setAccessToken] = useState<string | null>(
        getAccessTokenInStorage()
    );
    const [refreshToken, setRefreshToken] = useState<string | null>(
        getRefreshTokenInStorage()
    );
    const [userId, setUserId] = useState<number | null>(
        getUserIdFromStorage()
    );

    const login = async (signInData: ReqSignInDto) => {
        const { data } = await postSignin(signInData);

        if (data) {
            setAccessTokenInStorage(data.accessToken);
            setRefreshTokenInStorage(data.refreshToken);
            setUserIdInStorage(data.id);

            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);
            setUserId(data.id);
        }
    };

    const logout = async () => {
        try {
            await postLogout();
        } catch (err) {
            console.error("Logout API failed:", err);
        } finally {
            removeAccessTokenInStorage();
            removeRefreshTokenInStorage();
            removeUserIdInStorage();

            setAccessToken(null);
            setRefreshToken(null);
            setUserId(null);
        }
    };

    const deleteAccount = async () => {
        await deleteAccountApi();
        removeAccessTokenInStorage();
        removeRefreshTokenInStorage();
        removeUserIdInStorage();

        setAccessToken(null);
        setRefreshToken(null);
        setUserId(null);
    };

    return (
        <AuthContext.Provider
            value={{ accessToken, isAuthenticated: !!accessToken, refreshToken, userId, login, logout, deleteAccount }}
        >
            {children}
        </AuthContext.Provider>
    );
    
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};