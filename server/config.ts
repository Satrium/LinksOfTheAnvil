import convict from 'convict';
import convict_format_with_validator from 'convict-format-with-validator';

convict.addFormats(convict_format_with_validator);

const config = convict({
    env: {
        doc: 'The application environment.',
        format: ['production', 'preproduction', 'development', 'test'],
        default: 'development',
        env: 'NODE_ENV'
    }, url: {
        doc: 'The URL the application is running as',
        format: 'url',
        default: 'localhost:4200',
        env: 'URL'
    }, schema:{
        format: ["https", "http"],
        default: "https"
    },
    port: {
        doc: 'Port of the node server',
        format: 'port',
        default: 3000,
        end: 'PORT'
    }, worldanvil: {
        appKey:  {format:'*', env:"APP_KEY", default: null},
        baseUrl: {format:'url', default:"https://www.worldanvil.com/api/aragorn/"}
    },ratelimit: {
        id: {format: "*", default:""},
        reservoir: {format: "nat", default: 500},
        reservoirIncreaseInterval: {format: "nat", default:500},
        reservoirIncreaseAmount: {format: "nat", default: 5},
        maxConcurrent: {format: "nat", default: 50},
        minTime: {format: "nat", default: 50},
        useRedis: {format: 'Boolean', default: false}
    }, redis: {
        host: { format: '*', default: "localhost", env: 'REDIS_HOST'},
        port: { format: 'port', default: 6379, env: 'REDIS_PORT' }
    }, rethinkdb: {
        host: { format: '*', default: "localhost", env: 'RETHINK_DB_HOST'},
        port: { format: 'port', default: 28015, env:"RETHINK_DB_PORT"},
        db: { format: '*', default: "linksOfTheAnvil", env: "RETHINK_DB_DATABASE"}
    }
});

let env = config.get('env');
config.loadFile(`./config/${env}.json`);
config.validate({allowed: 'strict'});
if(!config.get('worldanvil.appKey')){
    console.error("No Worldanvil application token found!");
    process.exit(1);
}
export default config;