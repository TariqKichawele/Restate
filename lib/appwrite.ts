import { Account, Avatars, Client, OAuthProvider } from "react-native-appwrite"
import * as Linking from "expo-linking";
import { openAuthSessionAsync } from "expo-web-browser";

export const config = {
    platform: 'com.tariq.restate',
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID
}

export const client = new Client();

client
    .setEndpoint(config.endpoint!)
    .setProject(config.projectId!)
    .setPlatform(config.platform!);


export const avatar = new Avatars(client);
export const account = new Account(client);

export async function login() {
    try {
        const redirectUri = Linking.createURL("/");

        const res = account.createOAuth2Token(
            OAuthProvider.Google,
            redirectUri
        );
        if (!res) throw new Error("Create OAuth2 token failed");

        const browserResult = await openAuthSessionAsync(
            res.toString(),
            redirectUri
        );
        if (browserResult.type !== "success") {
            throw new Error("User cancelled login");
        }

        const url = new URL(browserResult.url);
        
        const secret = url.searchParams.get("secret")?.toString();
        const userId = url.searchParams.get("userId")?.toString();
        if (!secret || !userId) throw new Error("Missing secret or userId");

        const session = await account.createSession(userId, secret);
        if (!session) throw new Error("Create session failed");

        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}
