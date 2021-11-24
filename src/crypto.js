import MyDB from './database.js';

class Log
{
    date;
    priceUSD;
    id;

    constructor (input)
    {
        if (Array.isArray(input))
        {
            this.date = input[0];
            this.priceUSD = input[1];
            this.id = input[2];
        }
        else
        {
            Object.assign(this, input);
        }
    }
}

class Crypto
{
    db;

    CoinCapAPI_BaseURL;
    CoinCapAPI_Token;
    axios_CoinCap;

    millis_per_day = 86400000;
    refresh_rate;
    tablename = "crypto";

    current;
    previous;
    next;

    parent_element;
    title_element;
    buttons_element;
    content_element;

    constructor(parent)
    {
        this.db = MyDB.getStandardAPIs();

        this.CoinCapAPI_BaseURL = "https://api.coincap.io/v2/assets";
        this.CoinCapAPI_Token = "07c3baf6-c2c4-49fa-bcf4-163e0c763e7a";

        this.axios_CoinCap = axios.create({
            baseURL: this.CoinCapAPI_BaseURL
        });

        this.refresh_rate = this.millis_per_day;

        this.parent_element = parent;
        this.title_element = this.parent_element.querySelector(".title")
        this.buttons_element = this.parent_element.querySelector(".buttons")
        this.content_element = this.parent_element.querySelector(".content")
    }

    getHistory = async() =>
    {
        let resp = await this.axios_CoinCap("/bitcoin/history?interval=m1");
        this.bitcoin_history_arr = resp.data.data;
    }

    getCurrent = async() =>
    {
        let resp = await this.axios_CoinCap("/bitcoin");
        // let temp = resp.data.data.find(item=> item.id === 'bitcoin');
        let temp = resp.data.data;
        // console.log(temp);
        this.bitcoin_live = temp;
        this.current = temp.priceUsd;
        // console.log(this.current, this.previous);
        return resp;
    }

    getPrevious = async() =>
    {
        let query = {};
        query.table = this.tablename;

        let resp = await this.db.read.post("", query);
        
        this.previous = resp.data.records.find(item => item.id == "1");
        this.next = resp.data.records.find(item => item.id == "2");
        this.previous.date = new Date(this.previous.date);
        this.next.date = new Date(this.next.date);

        let now = new Date();

        // TODO: CHANGE THIS LATER
        // this.refresh_rate = this.refresh_rate / 24 / 60 / 4;

        if (now.getTime() - this.next.date.getTime() > this.refresh_rate)
        {
            this.previous.date = this.next.date;
            this.previous.priceUSD = this.next.priceUSD;

            this.next.date = now;
            this.next.priceUSD = this.current;

            let query = {};
            query.table = this.tablename;
            query.record = this.previous;

            let resp = await this.db.update.post("", query);

            query.record = this.next;

            resp = await this.db.update.post("", query);
        }
        else
        {
            // It's been less than "refresh_rate" milliseconds since I last logged on and had crypto updated, so nothing changes
        }
    }

    firstTimeSetup = async() =>
    {
        let query = {};
        query.table = this.tablename;
        let resp = await this.db.read.post("", query);

        if (resp.data.records.length === 0)
        {
            let new_time = new Date();

            let first = new Log(new_time, this.current, "1");
            query.record = first;
            resp = await this.db.create.post("", query);

            console.log(resp);
            
            let second = new Log(new_time, this.current, "2");
            query.record = second;
            resp = await this.db.create.post("", query);

            console.log(resp);
        }
        else
        {
            // console.log("Data already initialized!");
        }
    }

    renderPlot()
    {
        let temp = new Date();

        this.time = temp.getTime();

        this.div = document.createElement("div");

        let x_data = [];
        let y_data = [];

        let length = this.bitcoin_history_arr.length;

        for (let i = 0; i < 5; i++)
        {
            x_data.push(-i);
            y_data.push(this.bitcoin_history_arr[(length-1)-i].priceUsd)
        }

        // console.log(this.bitcoin_history_arr[0]);

        // console.log(this.content_element.offsetHeight, this.content_element.offsetWidth);

        const computedStyle = getComputedStyle(this.content_element);
        // console.log(computedStyle);

        this.elementHeight = this.content_element.clientHeight;  // height with padding
        this.elementWidth = this.content_element.clientWidth;   // width with padding

        // console.log(this.elementHeight, this.elementWidth);

        this.elementHeight -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
        this.elementWidth -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);

        // console.log(this.elementHeight, this.elementWidth);

        let trace1 = {
            type: 'scatter',
            x: x_data,
            y: y_data,
            mode: 'lines',
            name: 'Red',
            line: {
              color: 'rgb(219, 64, 82)',
              width: 3
            }
          };
          
        let layout = {
            title: 'Bitcoin Last 4 minutes',
            width: this.elementWidth-1,
            height: this.elementHeight-1,
            showlegend: false,
            margin: {
              l: 55,
              r: 10,
              b: 25,
              t: 30,
              pad: 4
            },
        };

        // let config = {responsive: true}

        let config = {staticPlot: true}
          
        let data = [trace1];
          
        Plotly.newPlot(this.div, data, layout, config);

        this.div.id = "plot";

        // div.children[0].children[0].style = "";

        if (!this.home) this.displayPlot();
    }

    displayPlot()
    {
        this.home = false;

        this.content_element.innerHTML = "";

        this.content_element.appendChild(this.div);

        this.resize_function = () =>
        {
            let temp = new Date();
            let temp_time = temp.getTime();
            if (temp_time - this.time > 1000)
            {
                this.renderPlot();
                this.displayPlot();
            }
            this.time = temp_time;
            return true;
        }

        window.addEventListener("resize", this.resize_function);
    }

    displayStart()
    {
        // console.log("Hello");

        this.home = true;

        if (this.resize_function)
        {
            window.removeEventListener("resize", this.resize_function);
        }

        this.initializeButtons();

        this.title_element.innerHTML = "Crypto";

        this.content_element.innerHTML = "";

        this.initializeForm();
        
        this.initializeHome();
        
        this.content_element.appendChild(this.button_display);
        this.content_element.appendChild(this.form);
    }

    initializeHome()
    {
        if (!this.button_display)
        {
            let button_display = document.createElement("button");
            button_display.innerHTML = "Plot of Last 4 Minutes";
            button_display.classList.add("showcrypto");
            button_display.addEventListener("click", evt =>{
                this.renderPlot();
                this.displayPlot();
            });
            this.button_display = button_display;
        }
        
        this.updateForm();
    }

    updateForm()
    {
        // console.log(this.previous, this.current);

        let temp_prev = parseFloat(this.previous.priceUSD);
        let temp_curr = parseFloat(this.current);

        this.form_previous.value = temp_prev.toFixed(4);
        this.form_current.value = temp_curr.toFixed(4);

        this.form_abschange.value = (temp_curr-temp_prev).toFixed(4);
        this.form_pchange.value = `%${((this.form_abschange.value/temp_prev)*100).toFixed(4)}`;
    }

    initializeForm()
    {
        if (!this.form)
        {
            let form = document.createElement("form");
            let label_previous = document.createElement("label")
            label_previous.innerHTML = "Previously:"
            label_previous.classList.add("title");
            let form_previous = document.createElement("input");
            form_previous.readOnly = true;

            let label_current = document.createElement("label")
            label_current.innerHTML = "Currently:"
            label_current.classList.add("title");
            let form_current = document.createElement("input");
            form_current.readOnly = true;

            label_previous.for = "previous";
            form_previous.name = "previous";
            form_previous.readOnly = true;

            label_current.for = "current";
            form_current.name = "current";
            form_current.readOnly = true;
            
            let label_pchange = document.createElement("label")
            label_pchange.innerHTML = "% Change:";
            label_pchange.classList.add("title");
            let form_pchange = document.createElement("input");
            form_pchange.readOnly = true;
            
            let label_abschange = document.createElement("label")
            label_abschange.innerHTML = "Abs Change:"
            label_abschange.classList.add("title");
            let form_abschange = document.createElement("input");
            form_abschange.readOnly = true;

            label_previous.style.display = "block";
            label_current.style.display = "block";
            label_pchange.style.display = "block";
            label_abschange.style.display = "block";

            label_pchange.for = "percent";
            form_pchange.name = "percent";
            form_pchange.readOnly = true;

            label_abschange.for = "abs";
            form_abschange.name = "abs";
            form_abschange.readOnly = true;

            form.appendChild(label_previous);
            form.appendChild(form_previous);
            form.appendChild(label_current);
            form.appendChild(form_current);
            form.appendChild(label_pchange);
            form.appendChild(form_pchange);
            form.appendChild(label_abschange);
            form.appendChild(form_abschange);

            this.form = form;
            this.form_previous = form_previous;
            this.form_current = form_current;
            this.form_pchange = form_pchange;
            this.form_abschange = form_abschange;
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
}

export default Crypto;