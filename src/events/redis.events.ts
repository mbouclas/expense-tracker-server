import {Redis, Event} from "../index";
import {RedisService} from "../services/redis.service";
export interface IRedisMessage<T> {
    action: 'updateDb'|'updateLocations';
    payload: T
}

export interface IIncomingRedisMessage {

}


const subscriber = (new RedisService()).client;

subscriber.subscribe('mcrm.demo');

module.exports = () => {
    subscriber.on('message', (channel: string, msg: string) => {
        const message: IRedisMessage<IIncomingRedisMessage>  = JSON.parse(msg);

/*        switch (message.action) {
            case 'updateDb': Event.emit('fuse.data.refresh', message.payload);
                break;
            case 'updateLocations': Event.emit('fuse.data.refresh', message.payload);
                break;
        }*/
    })


    //

};
