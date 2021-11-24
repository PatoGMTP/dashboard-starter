import MyDB from './database.js';

class Game
{
    title;
    desired_price;
    alert;
    id;

    constructor (input)
    {
        if (Array.isArray(input))
        {
            this.title = input[0];
            this.id = input[1];
            this.desired_price = 0;
            this.alert = false;
        }
        else
        {
            Object.assign(this, input);
        }
    }
}

class Deals
{
    db;

    game_list;

    best_deals;

    tablename = "game";

    CheapShark_BaseURL;
    axios_CheapShark;

    other = "https://www.cheapshark.com/api/1.0/games?id=612";
    lettuce = "deals?storeID=1&upperPrice=15";

    parent_element;
    title_element;
    buttons_element;
    content_element;

    constructor(parent)
    {
        this.db = MyDB.getStandardAPIs();

        this.CheapShark_BaseURL = "https://www.cheapshark.com/api/1.0/";

        this.axios_CheapShark = axios.create({
            baseURL: this.CheapShark_BaseURL
        });

        this.game_list = [];

        this.parent_element = parent;
        this.title_element = this.parent_element.querySelector(".title")
        this.buttons_element = this.parent_element.querySelector(".buttons")
        this.content_element = this.parent_element.querySelector(".content")
    }

    makeNewGame = async(title, id) =>
    {
        let query = {};

        if (typeof(id) === "number") id = id.toString();

        let newGame = new Game([title, id]);

        query.table = this.tablename;
        query.record = newGame;

        let resp = await this.db.create.post("",query);

        this.game_list.push(newGame);
    }

    loadGames = async() =>
    {
        let query = {};
        query.table = this.tablename;
        query.orderBy = "title";

        let resp = await this.db.read.post("", query);
        // console.log(resp);
        this.game_list = resp.data.records.map(item=> new Game(item));
        // console.log(this.game_list);
    }

    deleteGame = async(id) =>
    {
        let target = this.game_list.find(item=> item.id === id);

        let query = {}
        query.table = this.tablename;
        query.id = id;

        let resp = await this.db.delete.post("", query);

        this.game_list = this.game_list.filter(item=> item !== target);
    }

    getBestDeals = async() =>
    {
        let resp = await this.axios_CheapShark("deals");
        console.log(resp.data);
        return resp.data;
    }

    searchDeals = async(text) =>
    {
        let resp = await this.axios_CheapShark(`games?title=${text}`);
        // console.log(resp.data);
        let arr = Array.from(resp.data.map(item => [item.gameID, item.external]));
        let set = new Set(arr);
        // console.log(set);
        // console.log(arr);

        return arr.map(item => {
            let obj = {}
            obj.id = item[0];
            obj.text = item[1];
            return obj;
        });
    }

    getCheapest = async(id) =>
    {
        let resp = await this.axios_CheapShark(`games?id=${id}`);
        // console.log(resp);
        return [resp.data.deals[0].price, resp.data.deals[0].dealID, resp.data.cheapestPriceEver.price];
    }

    reloadDatalist()
    {
        let datalist = document.createElement("datalist");
        datalist.id = "games";
        this.game_list.forEach(item => {
            let option = document.createElement("option");
            option.value = item.title;
            datalist.appendChild(option);
        });
        this.datalist = datalist;
    }

    instantiateTracker(item)
    {
        let game_title = document.createElement("td");
        // game_title.value = item.title;
        // game_title.readOnly = true;
        game_title.innerHTML = item.title;
        // game_title.style.display = "inline";

        let desired_price = document.createElement("td");
        // desired_price.value = item.desired_price;
        // desired_price.readOnly = true;
        // desired_price.style.display = "inline";

        let cheapest = document.createElement("td");
        this.getCheapest(item.id).then(arr => {
            // cheapest.value = arr[0];
            cheapest.id = arr[1];
            // cheapest.readOnly = true;
            // cheapest.style.display = "inline";
            cheapest.innerHTML = arr[0];

            // TODO: LET USER SET THIS!
            // desired_price.value = arr[2];
            desired_price.innerHTML = arr[2];
        });

        let holder = document.createElement("tr");
        holder.id = item.id;

        cheapest.addEventListener("dblclick", evt => {
            console.log(holder.id, cheapest.id);
            window.open(`https://www.cheapshark.com/redirect?dealID=${cheapest.id}`, '_blank');
        });

        let td = document.createElement("td");

        let button_delete = document.createElement("span");
        button_delete.innerHTML = "Delete";

        td.addEventListener("dblclick", evt => {
            this.deleteGame(holder.id);
            let parent = td.parentElement;
            this.tracker_list.removeChild(parent);
        });

        td.appendChild(button_delete);

        holder.appendChild(game_title);
        holder.appendChild(desired_price);
        holder.appendChild(cheapest);
        holder.appendChild(td);

        return holder;
    }

    instantiateSearchItem(item)
    {
        let game_title = document.createElement("input");
        game_title.value = item.text;
        game_title.readOnly = true;
        game_title.style.display = "inline";

        let holder = document.createElement("div");
        holder.id = item.id;

        holder.addEventListener("dblclick", evt => {
            console.log(holder.id);
            let name = holder.children[0].value;
            let id = holder.id;
            this.makeNewGame(name, id).then(resp => {
                this.content_element.innerHTML = '<span class="success-msg title">Successfully added game to trackers!!</span>';
                setTimeout(item => {this.displayStart();}, 2000);
                let newest = this.game_list.slice(-1)[0];
                this.tracker_list.appendChild(this.instantiateTracker(newest));
                console.log(this.game_list);
            });
            this.content_element.innerHTML = "";
            this.reloadDatalist();
        });

        holder.appendChild(game_title);

        return holder;
    }

    displaySearchResults()
    {
        this.home = false;

        this.content_element.innerHTML = "";

        this.content_element.appendChild(this.search_list[this.search_counter]);

        // this.content_element.innerHTML = "Loading...";
    }

    displayBestDeals()
    {
        this.home = false;

        this.content_element.innerHTML = "Loading...";
        
        this.getBestDeals().then(response => this.content_element.innerHTML = JSON.stringify(response));
    }

    displayTrackers()
    {
        this.home = false;

        this.content_element.innerHTML = "";

        // console.log(this.tracker_list);

        this.content_element.appendChild(this.tracker_list);
    }

    displayStart()
    {
        this.home = true;

        this.initializeButtons();

        this.title_element.innerHTML = "Deals";

        this.content_element.innerHTML = "";

        this.initializeHome();

        // this.content_element.appendChild(this.button_display);
        this.content_element.appendChild(this.search_bar);
        this.content_element.appendChild(this.button_mytrackers);

        this.initializeLists();

        // this.initializeForms();
    }

    initializeHome()
    {
        if (!this.button_display)
        {
            let button_display = document.createElement("button");
            button_display.innerHTML = "Best Deals";
            button_display.classList.add("showdeals");
            button_display.addEventListener("click", evt =>{
                this.displayBestDeals();
            });
            this.button_display = button_display;
        }

        if (!this.datalist) this.reloadDatalist();

        if (!this.button_mytrackers)
        {
            let button_mytrackers = document.createElement("button");
            button_mytrackers.innerHTML = "My Trackers";
            button_mytrackers.classList.add("showtrackers");
            button_mytrackers.addEventListener("click", evt =>{
                this.displayTrackers();
            });
            this.button_mytrackers = button_mytrackers;
        }

        if (!this.search_bar)
        {
            let holder = document.createElement("div");
            holder.classList.add("search");

            let search_input = document.createElement("input");
            search_input.placeholder = "Enter Game Name";
            search_input.type = "search";

            let search_button = document.createElement("button");
            search_button.innerHTML = "Search!";

            search_button.addEventListener("click", async evt => {
                if (this.search_bar.children[0].value !== this.last_search_item)
                {
                    this.last_search_item = this.search_bar.children[0].value;

                    this.content_element.innerHTML = "Loading...";
    
                    let resp = await this.searchDeals(this.search_bar.children[0].value);

                    if (resp.length === 0)
                    {
                        let thing = document.createElement("div");
                        thing.innerHTML = "No Results found";
                        this.search_list = [thing];
                        this.search_counter = 0;
                    }
                    else
                    {
                        let temp = resp;
        
                        this.search_list = [];
        
                        let count = 0;
                        this.search_counter = -1;
                        for (let item of temp)
                        {
                            if (count % 5 === 0)
                            {
                                this.search_counter++;
        
                                let holder = document.createElement("div");
                                holder.id = this.search_counter;
        
                                let left_button = document.createElement("button");
                                left_button.innerHTML = "Previous";
                                left_button.style.display = "inline";
        
                                if (count === 0) left_button.style.display = "none";
                        
                                left_button.addEventListener("click", evt => {
                                    this.search_counter--;
                                    this.displaySearchResults();
                                });
                                
                                let right_button = document.createElement("button");
                                right_button.innerHTML = "Next";
                                right_button.style.display = "inline";
                        
                                right_button.addEventListener("click", evt => {
                                    this.search_counter++;
                                    this.displaySearchResults();
                                });
        
                                let list = document.createElement("ol");
                                // list.type = "1";
        
                                holder.appendChild(left_button);
                                holder.appendChild(list);
                                holder.appendChild(right_button);
        
                                this.search_list.push(holder);
                            }
                            this.search_list[this.search_counter].children[1].appendChild(this.instantiateSearchItem(item));
                            count++;
                        }
        
                        this.search_list[this.search_counter].children[2].style.display = "none";
        
                        this.search_counter = 0;
                    }
                }

                this.displaySearchResults();
            });

            holder.appendChild(search_input);
            holder.appendChild(search_button);

            this.search_bar = holder;
        }
    }

    initializeButtons()
    {
        if (this.buttons_element.innerHTML === "")
        {
            let button_exit = document.createElement("button");
            button_exit.innerHTML = "Exit";
            button_exit.classList.add("exit");
            button_exit.addEventListener("click", evt =>{
                if (!this.home) this.displayStart();
                else console.log("Unfocus!");
            });
    
            // this.parent_element.appendChild(title);
            this.buttons_element.appendChild(button_exit);
        }
        else
        {
            console.log("Buttons are good!");
        }
    }

    initializeLists()
    {
        if (!this.search_list)
        {
            let list = document.createElement("ol");
            // list.type = "1";
            this.search_list = list;
            // for (let item of this.active_tasks)
            // {
            //     this.active_list.appendChild(this.instantiateActiveTask(item));
            // }
        }

        if (!this.tracker_list)
        {
            // console.log(this.game_list);
            let tracker_list = document.createElement("table");
            // tracker_list.type = "1";
            this.tracker_list = tracker_list;

            let holder = document.createElement("tr");
            let h1 = document.createElement("th");
            h1.innerHTML = "Game Title";
            let h2 = document.createElement("th");
            h2.innerHTML = "Ideal $";
            let h3 = document.createElement("th");
            h3.innerHTML = "Best Deal";
            let h4 = document.createElement("th");
            h4.innerHTML = "Action";
            holder.appendChild(h1);
            holder.appendChild(h2);
            holder.appendChild(h3);
            holder.appendChild(h4);

            this.tracker_list.appendChild(holder);

            for (let item of this.game_list)
            {
                this.tracker_list.appendChild(this.instantiateTracker(item));
            }
        }

        // if (this.historic_list.length === 0)
        // {
        //     // console.log("Testing");
        //     this.reloadHistoricList("New");
        //     // console.log("Ended");
        // }

        // this.history_counter = 0;
    }

    // formMaker(title_label, body_label)
    // {
    //     let form = document.createElement("form");
    //     let label_title = document.createElement("label");
    //     label_title.innerHTML = title_label;
    //     let form_title = document.createElement("input");
    //     form_title.readOnly = true;

    //     let label_body = document.createElement("label");
    //     label_body.innerHTML = body_label;
    //     let form_body = document.createElement("textarea");
    //     form_body.readOnly = true;

    //     label_title.for = "title";
    //     form_title.name = "title";

    //     label_body.for = "body";
    //     form_body.name = "body";

    //     label_title.style.display = "block";
    //     label_body.style.display = "block";

    //     form.appendChild(label_title);
    //     form.appendChild(form_title);
    //     form.appendChild(label_body);
    //     form.appendChild(form_body);

    //     return [form, form_title, form_body];
    // }

    // initializeForms()
    // {
    //     if (!this.form)
    //     {
    //         [this.form, this.form_title, this.form_body] = this.formMaker("Task Title", "Task Details");
    //     }
    // }
}

export default Deals;