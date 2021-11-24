import MyDB from './database.js';

class Anime
{
    title;
    id;

    constructor (input)
    {
        if (Array.isArray(input))
        {
            this.title = input[0];
            this.id = input[1];
        }
        else
        {
            Object.assign(this, input);
        }
    }
}

class Sidebar
{
    db;

    AnimeChan_BaseURL;
    axios_AnimeChan;

    AniAPI_Token;
    AniAPI_BaseURL;
    axios_AniAPI;

    constructor(parent)
    {
        this.db = MyDB.getStandardAPIs();

        this.AnimeChan_BaseURL = "https://animechan.vercel.app/api/";

        this.axios_AnimeChan = axios.create({
            baseURL: this.AnimeChan_BaseURL
        });

        this.AniAPI_Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcxOSIsIm5iZiI6MTYzNzI3NDg3NCwiZXhwIjoxNjM5ODY2ODc0LCJpYXQiOjE2MzcyNzQ4NzR9.JVK1tJkEmhFttmGhXoi3gR5lUspLnRB0dfw0U1ibIy4";
        this.AniAPI_BaseURL = "https://api.aniapi.com/v1/";

        this.axios_AniAPI = axios.create({
            baseURL: this.AniAPI_BaseURL,
            headers: {
                'Content-Type' : 'Application/json',
                'Authorization': `Bearer ${this.AniAPI_Token}`,
                'Accept': 'application/json'
            }
        });

        this.parent_element = parent;
        this.title_element = this.parent_element.querySelector(".title")
        this.buttons_element = this.parent_element.querySelector(".buttons")
        this.content_element = this.parent_element.querySelector(".content")
    }

    async getQuotes()
    {
        let resp = await this.axios_AnimeChan(`/quotes/anime?title=${this.anime}`);

        return (resp.data);
    }

    async getList()
    {
        let resp = await this.axios_AnimeChan("available/anime");

        // console.log(resp.data);

        this.list = resp.data;
    }

    async displayStart()
    {
        this.title_element.innerHTML = "Sidebar";

        this.content_element.innerHTML = "";

        await this.getList();

        this.initializeHome();

        this.content_element.appendChild(this.dropdown);
        this.content_element.appendChild(this.search_bar);
        // this.content_element.appendChild(this.button_add);

        // this.initializeForm();
    }

    initializeHome()
    {
        if (!this.controls)
        {
            let dropdown = document.createElement("div");
            let label = document.createElement("label");
            label.setAttribute("for", "filter");
            label.innerHTML = "Choose Color Scheme:";
            label.classList.add("title");
            let dropdown_options = document.createElement("select");
            dropdown_options.name = "filter";
            let option_all = document.createElement("option");
            option_all.value = "Sassy";
            option_all.innerHTML = "Sassy";
            let option_com = document.createElement("option");
            option_com.value = "Cool";
            option_com.innerHTML = "Cool";
            let option_del = document.createElement("option");
            option_del.value = "Bright";
            option_del.innerHTML = "Bright";

            dropdown_options.addEventListener("change", evt => {
                let choice = evt.target.value;
                let root  = document.documentElement;
                
                switch (choice)
                {
                    case "Sassy":
                        root.style.setProperty('--bg', "rgb(46, 46, 107)");
                        root.style.setProperty('--text', "rgb(236, 179, 179)");
                        break;
                    case "Cool":
                        root.style.setProperty('--bg', "#1e3d59");
                        root.style.setProperty('--text', "#f5f0e1");
                        break;
                    case "Bright":
                        root.style.setProperty('--bg', "#ffd79d");
                        root.style.setProperty('--text', "black");
                        break;
                }
            });

            dropdown_options.appendChild(option_all);
            dropdown_options.appendChild(option_del);
            dropdown_options.appendChild(option_com);

            dropdown.appendChild(label);
            dropdown.appendChild(dropdown_options);

            this.dropdown = dropdown;
        }

        if (!this.search_bar)
        {
            let search_bar = document.createElement("div");

            let search_field = document.createElement("input");
            search_field.placeholder = "Type here!"
            search_field.setAttribute("list", "anime_source");

            this.search_field = search_field;

            let datalist = document.createElement("datalist");
            datalist.id = "anime_source";
            this.list.forEach(item => {
                let option = document.createElement("option");
                option.value = item;
                datalist.appendChild(option);
            });
            this.datalist = datalist;

            let button_search = document.createElement("button");
            button_search.innerHTML = "Go";
            button_search.classList.add("setanime");
            button_search.addEventListener("click", evt =>{
                this.anime = search_field.value;
                this.showQuotes();
            });

            this.button_search = button_search;

            search_bar.appendChild(this.search_field);
            search_bar.appendChild(this.datalist);
            search_bar.appendChild(this.button_search);

            this.search_bar = search_bar;
        }
    }

    async showQuotes()
    {
        if (this.interval)
        {
            clearInterval(this.interval);
        }

        console.log(this.anime);

        this.quotes = await this.getQuotes();

        this.counter = 0;

        console.log(this.quotes);

        if (!this.quote_div)
        {
            this.quote_div = document.createElement("div");
            this.content_element.appendChild(this.quote_div);
            this.quote_text = document.createElement("p");
            this.quote_text.id = "quote";
            this.quote_text.classList.add("title");
            this.quote_character = document.createElement("p");
            this.quote_character.id = "character";
            this.quote_character.classList.add("title");
            this.quote_div.appendChild(this.quote_text);
            this.quote_div.appendChild(this.quote_character);
        }
        
        this.quote_text.innerHTML = `"${this.quotes[this.counter].quote}"`;
        this.quote_character.innerHTML = `- ${this.quotes[this.counter].character}`;

        this.interval = setInterval(() => {
            this.counter = (this.counter + 1) % 10;
            this.quote_text.innerHTML = `"${this.quotes[this.counter].quote}"`;
            this.quote_character.innerHTML = `- ${this.quotes[this.counter].character}`;

        }, 10000);
    }
}

export default Sidebar;