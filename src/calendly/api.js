import axios from "axios";
import { CLIENT_ID } from "./config";
import { loadAuthContext, saveAuthContext } from "../storage";

class CalendlyApi {
    constructor() {
        const context = loadAuthContext();

        if (!context) {
            window.location.href = "/";
        }

        const { access_token, refresh_token, owner, organization } = context;
        this.user = owner;
        this.accessToken = access_token;
        this.refreshToken = refresh_token;
        this.organization = organization;
        this.request = axios.create({
            baseURL: "https://api.calendly.com",
        });

        this.requestInterceptor = this.request.interceptors.response.use(
            (res) => [true, res.data],
            this._onCalendlyError,
        );
    }

    requestConfiguration() {
        return {
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            },
        };
    }

    getUserInfo = async () => {
        return this.request.get("/users/me", this.requestConfiguration());
    };

    getUserMembership = async () => {
        const [success, data] = await this.request.get(
            `/organization_memberships?user=${this.user}&organization=${this.organization}`,
            this.requestConfiguration(),
        );

        if (!success) {
            return [false, data];
        }

        const {
            role,
            organization,
            user
        } = data.collection[0];

        return [true, { role, organization, user: user.uri }];
    }

    getGroups = async () => {
        return this.request.get(`/groups?organization=${this.organization}&count=100`, this.requestConfiguration());
    };

    getWebhooks = async ({ scope, pageToken } = { scope: 'user' }) => {
        const query = [
            `scope=${scope}`,
            `organization=${this.organization}`,
            `sort=created_at:desc`,
            scope === 'user' ? `user=${this.user}` : '',
            pageToken ? `page_token=${pageToken}` : '',
        ].join('&')


        return this.request.get(`/webhook_subscriptions?${query}`, this.requestConfiguration());
    }

    createWebhook = async ({ events, organization, user, url, scope, group, signing_key }) => {
        const data = {
            events,
            organization,
            url,
            scope
        };

        if (signing_key) {
            data.signing_key = signing_key;
        }

        if (scope === 'user') {
            data.user = user;
        } else if (scope === 'group') {
            data.group = group;
        }

        return this.request.post(
            "/webhook_subscriptions",
            data,
            this.requestConfiguration(),
        );
    }

    deleteWebhook = async (uri) => {
        const path = uri.replace("https://api.calendly.com", "");
        return this.request.delete(path, this.requestConfiguration());
    }

    requestNewAccessToken = () => {
        return axios.post(`https://auth.calendly.com/oauth/token`, {
            client_id: CLIENT_ID,
            grant_type: "refresh_token",
            refresh_token: this.refreshToken,
        });
    };

    _onCalendlyError = async (error) => {
        if (error.response.status === 500) {
            console.error(error.response.data);
            return Promise.resolve([false, "Internal server error"]);
        }

        if (error.response.status !== 401) {
            return Promise.resolve([false, error.response.data]);
        }

        this.request.interceptors.response.eject(this.requestInterceptor);

        try {
            const response = await this.requestNewAccessToken();
            const { access_token, refresh_token } = response.data;

            const context = loadAuthContext();

            context.access_token = access_token;
            context.refresh_token = refresh_token;

            saveAuthContext(context);

            this.accessToken = access_token;
            this.refreshToken = refresh_token;

            error.response.config.headers.Authorization = `Bearer ${access_token}`;

            // retry original request with new access token
            return this.request(error.response.config)
                .then((res) => {
                    return [true, res.data];
                })
                .catch((err) => [false, err.response.data]);
        } catch (e) {
            return [false, e.response.data];
        } finally {
            // we need to re-add the interceptor to ensure we can refresh the token again for future requests
            this.requestInterceptor = this.request.interceptors.response.use(
                (res) => [true, res.data],
                this._onCalendlyError,
            );
        }
    };
}

export default CalendlyApi;