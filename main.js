import Countdown from './src/countdown.js'
import Giphy from './src/giphy.js'
// import { axios } from 'https://cdnjs.cloudflare.com/ajax/libs/axios/0.24.0/axios.min.js';

// console.log(axios);

let countdown = new Countdown(1,2);
countdown.render();

let gifpane = new Giphy();
gifpane.render();

// let secret_key = "NDg3NDVjNjUtMWZhOS00YTQwLTgwYWItNDFjMWRmMDZhNWEy";

// let url = "https://api.m3o.com/v1/db/";

// let data = {};

// const response = await fetch(url+"ListTables", {
//     method: 'POST',
//     headers: {
//         'Content-Type' : 'Application/json',
//         'Authorization': `Bearer ${secret_key}`
//     },
//     body: JSON.stringify(data)
// });

// const response_data = response.json();

// console.log(response_data);

let m3oDB_Token = "NDg3NDVjNjUtMWZhOS00YTQwLTgwYWItNDFjMWRmMDZhNWEy";
let m3oDB_BaseULR = "https://api.m3o.com/v1/db/";

let axios_m3oDB = axios.create({
    method: "POST",
    baseURL: m3oDB_BaseULR,
    headers: {
        "Content-Type" : "application/json",
        "Authorization" : `Bearer ${m3oDB_Token}`
    }
});

let dbresp = await axios_m3oDB("ListTables", {});
console.log(dbresp.data);

// let xhr_m3o_ListTables = new XMLHttpRequest();

// 0	UNSENT	            Client has been created. open() not called yet.
// 1	OPENED	            open() has been called.
// 2	HEADERS_RECEIVED	send() has been called, and headers and status are available.
// 3	LOADING	            Downloading; responseText holds partial data.
// 4	DONE	            The operation is complete.

// xhr_m3o_ListTables.onreadystatechange = function ()
// {
//     switch(xhr_m3o_ListTables.readyState)
//     {
//         case 0:
//             console.log(xhr_m3o_ListTables.status);
//             break;
//         case 1:
//             console.log(xhr_m3o_ListTables.status);
//             break;
//         case 2:
//             console.log(xhr_m3o_ListTables.status);
//             break;
//         case 3:
//             console.log(xhr_m3o_ListTables.status);
//             break;
//         case 4:
//             console.log(xhr_m3o_ListTables.status);
//             console.log(xhr_m3o_ListTables.responseText);
//             break;
//     }
// };

// xhr_m3o_ListTables.open("POST", m3oDB_BaseULR);
// xhr_m3o_ListTables.setRequestHeader("Content-Type", "application/json");
// xhr_m3o_ListTables.setRequestHeader("Authorization", `Bearer ${m3oDB_Token}`);
// let data = "{}";
// xhr_m3o_ListTables.send(data);

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

// let xhr_AniAPI_anime = new XMLHttpRequest();

// xhr_AniAPI_anime.onreadystatechange = function ()
// {
//     switch(xhr_AniAPI_anime.readyState)
//     {
//         case 0:
//             console.log(xhr_AniAPI_anime.status);
//             break;
//         case 1:
//             console.log(xhr_AniAPI_anime.status);
//             break;
//         case 2:
//             console.log(xhr_AniAPI_anime.status);
//             break;
//         case 3:
//             console.log(xhr_AniAPI_anime.status);
//             break;
//         case 4:
//             console.log(xhr_AniAPI_anime.status);
//             console.log(xhr_AniAPI_anime.response);
//             break;
//     }
// }

// xhr_AniAPI_anime.open("GET", AniAPI_BaseURL);
// xhr_AniAPI_anime.setRequestHeader("Content-Type", "application/json");
// xhr_AniAPI_anime.setRequestHeader("Authorization", `Bearer ${AniAPI_Token}`);
// xhr_AniAPI_anime.setRequestHeader("Accept", "application/json");
// xhr_AniAPI_anime.send();

// let response = await fetch(AniAPI_BaseURL+"anime", {
//     method: 'GET',
//     headers: {
//         'Content-Type' : 'Application/json',
//         'Authorization': `Bearer ${AniAPI_Token}`,
//         'Accept': 'application/json'
//     }
// });
// let response_data = await response.json();
// console.log(response_data);


let CoinCapAPI_BaseURL = "https://api.coincap.io/v2/assets";
let CoinCapAPI_Token = "07c3baf6-c2c4-49fa-bcf4-163e0c763e7a";

const axios_CoinCap = axios.create({
    baseURL: CoinCapAPI_BaseURL
});

// ,
//     headers: {
//         'Authorization': `Bearer ${CoinCapAPI_Token}`,
//         'Accept': 'application/json'
//     }

let coins = await axios_CoinCap();
console.log(coins.data);

// let xhr_CoinCap_assets = new XMLHttpRequest();

// xhr_CoinCap_assets.onreadystatechange = function ()
// {
//     switch(xhr_CoinCap_assets.readyState)
//     {
//         case 0:
//             console.log(xhr_CoinCap_assets.status);
//             break;
//         case 1:
//             console.log(xhr_CoinCap_assets.status);
//             break;
//         case 2:
//             console.log(xhr_CoinCap_assets.status);
//             break;
//         case 3:
//             console.log(xhr_CoinCap_assets.status);
//             break;
//         case 4:
//             console.log(xhr_CoinCap_assets.status);
//             console.log(xhr_CoinCap_assets.response);
//             break;
//     }
// }

// xhr_CoinCap_assets.open("GET", CoinCapAPI_BaseURL);
// xhr_CoinCap_assets.send();

// response = await fetch(CoinCapAPI_BaseURL);
// response_data = await response.json();
// console.log(response_data);


// let GnewsAPI_Token = "ed1c33c3a2559f6c5f82b75613bb964d";
// let query = "Eurobeat";
// let GnewsAPI_BaseURL = `https://gnews.io/api/v4/search?q=${query}&token=${GnewsAPI_Token}`;

// response = await fetch(GnewsAPI_BaseURL);
// response_data = await response.json();
// console.log(response_data);


// let NewsAPI_Token = "254cc3e627824573a74b2709e4b88156";
// let NewsAPI_BaseURL = `https://newsapi.org/v2/everything?q=${query}&apiKey=${NewsAPI_Token}`;

// response = await fetch(NewsAPI_BaseURL);
// response_data = await response.json();
// console.log(response_data);

let CheapShark_BaseURL = "https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15";

const axios_CheapShark = axios.create({
    baseURL: CheapShark_BaseURL
});

let results = await axios_CheapShark();
console.log(results.data);

// let xhr_CheapShark_deals = new XMLHttpRequest();

// xhr_CheapShark_deals.onreadystatechange = function ()
// {
//     switch(xhr_CheapShark_deals.readyState)
//     {
//         case 0:
//             console.log(xhr_CheapShark_deals.status);
//             break;
//         case 1:
//             console.log(xhr_CheapShark_deals.status);
//             break;
//         case 2:
//             console.log(xhr_CheapShark_deals.status);
//             break;
//         case 3:
//             console.log(xhr_CheapShark_deals.status);
//             break;
//         case 4:
//             console.log(xhr_CheapShark_deals.status);
//             console.log(xhr_CheapShark_deals.response);
//             break;
//     }
// }

// xhr_CheapShark_deals.open("GET", "https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15");

// xhr_CheapShark_deals.send();


let AnimeChan_BaseURL = "https://animechan.vercel.app/api/quotes/";

const axios_AnimeChan = axios.create({
    baseURL: AnimeChan_BaseURL
});

let something = await axios_AnimeChan("anime?title=madoka");
console.log(something.data);

// let xhr_AnimeChan_title = new XMLHttpRequest();

// xhr_AnimeChan_title.onreadystatechange = function ()
// {
//     switch(xhr_AnimeChan_title.readyState)
//     {
//         case 0:
//             console.log(xhr_AnimeChan_title.status);
//             break;
//         case 1:
//             console.log(xhr_AnimeChan_title.status);
//             break;
//         case 2:
//             console.log(xhr_AnimeChan_title.status);
//             break;
//         case 3:
//             console.log(xhr_AnimeChan_title.status);
//             break;
//         case 4:
//             console.log(xhr_AnimeChan_title.status);
//             console.log(xhr_AnimeChan_title.response);
//             break;
//     }
// }

// xhr_AnimeChan_title.open("GET", AnimeChan_BaseURL+"madoka");
// xhr_AnimeChan_title.send();

// xhr_AnimeChan_title.open("GET", AnimeChan_BaseURL+"parasyte");
// xhr_AnimeChan_title.send();