import Countdown from './src/countdown.js';
import Giphy from './src/giphy.js';
import Todo from './src/todo.js';
import Deals from './src/deals.js';
import Crypto from './src/crypto.js';
import Reference from './src/reference.js';

let countdown = new Countdown(1,2);
countdown.render();

let gifpane = new Giphy();
gifpane.render();


// Big anime source

let AniAPI_Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcxOSIsIm5iZiI6MTYzNzI3NDg3NCwiZXhwIjoxNjM5ODY2ODc0LCJpYXQiOjE2MzcyNzQ4NzR9.JVK1tJkEmhFttmGhXoi3gR5lUspLnRB0dfw0U1ibIy4";
let AniAPI_BaseURL = "https://api.aniapi.com/v1/";

const axios_AniAPI = axios.create({
    baseURL: AniAPI_BaseURL,
    headers: {
        'Content-Type' : 'Application/json',
        'Authorization': `Bearer ${AniAPI_Token}`,
        'Accept': 'application/json'
    }
});

let thing = await axios_AniAPI("anime");
console.log(thing.data);


// Crypto

// let CoinCapAPI_BaseURL = "https://api.coincap.io/v2/assets";
// let CoinCapAPI_Token = "07c3baf6-c2c4-49fa-bcf4-163e0c763e7a";

// const axios_CoinCap = axios.create({
//     baseURL: CoinCapAPI_BaseURL
// });

// let coins = await axios_CoinCap();
// console.log(coins.data);


// Cheap Deals

let CheapShark_BaseURL = "https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15";

const axios_CheapShark = axios.create({
    baseURL: CheapShark_BaseURL
});

let results = await axios_CheapShark();
console.log(results.data);


// Anime quotes

let AnimeChan_BaseURL = "https://animechan.vercel.app/api/quotes/";

const axios_AnimeChan = axios.create({
    baseURL: AnimeChan_BaseURL
});

let something = await axios_AnimeChan("anime?title=madoka");
console.log(something.data);
