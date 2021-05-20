import {Service} from "typedi";
const redisService = require('promise-redis')();
import {ClientOpts, RedisClient} from "redis";

@Service()
export class RedisService {
    public client: RedisClient;

    constructor() {
        const options: ClientOpts = {};

        if (typeof process.env.REDIS_URL !== 'undefined') {
            options.url = process.env.REDIS_URL;
        } else {
            options.host = process.env.REDIS_HOST;
            options.auth_pass = process.env.REDIS_AUTH;
            options.port = parseInt(process.env.REDIS_PORT as any);
        }


        this.client = redisService.createClient(options);
    }

    async put(key: string, value: any, expireInSeconds = 0) {
        await this.client.set(key, JSON.stringify(value));

        if (expireInSeconds > 0) {
            await this.client.expire(key, expireInSeconds)
        }
    }

    async putAndReturnValue(key: string, value: any, expireInSeconds = 0) {
        await this.put(key, value, expireInSeconds);

        return value;
    }

    async exists(key: string) {
        return await this.client.exists(key);
    }

    async get(key: string) {
        const res = await this.client.get(key) ;
        if (!res) {return null;}

        // @ts-ignore
        return JSON.parse(res);
    }

    async pull(key: string) {
        const res = await this.get(key);

        await this.del(key);

        return res;
    }

    async del(key: string) {
        return await this.client.del(key);
    }
}
