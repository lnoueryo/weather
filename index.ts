const baseurl1: string = 'https://api.openweathermap.org/data/2.5/'
const baseurl2: string = 'https://api.openweathermap.org/geo/1.0/'
const newsBaseurl = 'https://newsapi.org/v2/'
const apiKey: string = '9e69adbbcef4bf2f73c4db5a809e4de8'
const imgPath = './img/'
// const searchWords = ['japan'];
const searchWords = ['japan', 'china', 'india', 'israel', 'germany', 'brazil', 'us'];
const countryCode = ["JP", "CN", "IN", "IL", "DE", "SV", "US"]
const pages = document.getElementById("pages") as HTMLDivElement;
let newsArticles: newArticle[] = [];
let countries: countryInfo[];
let now: number = (new Date()).getTime();
let cardsHTML: string;
let newsHTML: string;
let todoHTML: string;
let calendarHTML: string;
let listHTML: string;
let cardContainer;
let newsContainer;
let todoContainer;
let calendarContainer;
let pagesIdArray: any = [];
interface countryInfo {"code": string,"name": countryName,"en_name": countryName}
interface countryName {"full": string, "short": string}
interface today { city: cityInfo, cot: number, cod: number, list: list[]}
interface temperature {feels_like: number,grnd_level: number,humidity: number,pressure: number,sea_level: number,temp: number,temp_kf: number,temp_max: number,temp_min: number,}
interface weatherInfo{id: number, main: string, description: string, icon: string}
interface cityInfo {coord: {lat: number, lon: number},population: number, sunrise: number, sunset: number, timezone: number}
interface list {dt: number, dt_txt: string, main: temperature, weather: weatherInfo[], wind: {speed: number, deg: number, gust: number}}
interface article {"source": {"id": string,"name": string}, "author": string, "title": string, "description": string, "link": string, "urlToImage": string, "publishedAt": string, "content": string}
interface event {bubbles: boolean, cancelBubble: boolean,cancelable: boolean, composed: boolean, currentTarget: HTMLElement,defaultPrevented: boolean, eventPhase: number, isTrusted: boolean, path: HTMLElement[],returnValue: boolean,srcElement: HTMLElement,target: HTMLElement,timeStamp: number,type: "load"}
interface path extends Event {
    path: HTMLElement[]
  }

interface newArticle{author: string,authors: string[],clean_url: string,country: string,is_opinion: boolean,language: string,link: string,media: string,published_date: string,published_date_precision: string,rank: number,rights: string,summary: string,title: string,topic: string,twitter_account: string,_id: string,_score: number}



class Weather {
    public cityName: string
    public countryCode
    public timezone
    public card: HTMLDivElement
    constructor(cityName: string, timezone: number, countryCode: string) {
        this.cityName = cityName;
        this.countryCode = countryCode
        this.timezone = timezone
        this.card = document.getElementById(this.countryCode) as HTMLDivElement;
    };
    fiveDaysPerThreeHours(){
        const httpRequest = new XMLHttpRequest();
        const fiveDaysPerThreeHours: string = baseurl1 + `forecast?q=${this.cityName}&appid=${apiKey}`
        httpRequest.open("GET", fiveDaysPerThreeHours, false);
        httpRequest.send();
        if (httpRequest.status === 200) {
            return JSON.parse(httpRequest.responseText);
        }
        return httpRequest.statusText
    };
    filterWeather(){
        const now = Math.floor(((new Date()).getTime())/1000)+this.timezone-3*60*60;
        const oneDayLater = now + 60*60*24;
        const lists = (this.fiveDaysPerThreeHours()).list.filter((li: list)=>{
            return now<li.dt && li.dt<oneDayLater
        })
        return lists
    };
    mainWeather(){
        const mainWeather = this.filterWeather()[0];
        const mainWeatherElement = this.card.getElementsByClassName("main-weather")[0]
        const wind = mainWeatherElement.getElementsByClassName("wind")[0]
        const humidity = mainWeatherElement.getElementsByClassName("humidity")[0]
        const pressure = mainWeatherElement.getElementsByClassName("pressure")[0]
        const temp = mainWeatherElement.getElementsByClassName("temp")[0]
        const pop = mainWeatherElement.getElementsByClassName("pop")[0]
        wind.textContent = String(mainWeather.wind.speed);
        humidity.textContent = String(mainWeather.main.humidity);
        pressure.textContent = String(mainWeather.main.pressure);
        temp.textContent = String(Math.floor(mainWeather.main.temp-273.15));
        pop.textContent = String(Math.floor(mainWeather.pop*100));
        const description: string = mainWeather.weather[0].description.replace(/\s+/g,'');
        const cardContent = this.card.getElementsByClassName("card-content")[0] as HTMLDivElement;
        const mainWeatherImg = cardContent.getElementsByTagName('img')[0]
        mainWeatherImg.src = this.weatherImage(description);
    };
    subWeathers(){
        const weatherInfo = this.filterWeather()
        const subWeathers = [weatherInfo[1], weatherInfo[2], weatherInfo[3]];
        const subWeatherElements = this.card.getElementsByClassName("sub-weathers")[0]
        const sub1Img = subWeatherElements.getElementsByTagName("img")[0]
        const sub2Img = subWeatherElements.getElementsByTagName("img")[1]
        const sub3Img = subWeatherElements.getElementsByTagName("img")[2]
        const pop1 = subWeatherElements.getElementsByClassName("pop")[0]
        const pop2 = subWeatherElements.getElementsByClassName("pop")[1]
        const pop3 = subWeatherElements.getElementsByClassName("pop")[2]
        const time1 = subWeatherElements.getElementsByClassName("time")[0]
        const time2 = subWeatherElements.getElementsByClassName("time")[1]
        const time3 = subWeatherElements.getElementsByClassName("time")[2]
        sub1Img.src = this.weatherImage(subWeathers[0].weather[0].description.replace(/\s+/g,''))
        sub2Img.src = this.weatherImage(subWeathers[1].weather[0].description.replace(/\s+/g,''))
        sub3Img.src = this.weatherImage(subWeathers[2].weather[0].description.replace(/\s+/g,''))
        pop1.textContent = String(Math.floor(subWeathers[0].pop*100))
        pop2.textContent = String(Math.floor(subWeathers[1].pop*100))
        pop3.textContent = String(Math.floor(subWeathers[2].pop*100))
        time1.textContent = `${(new Date((subWeathers[0].dt-6*60*60)*1000)).getHours()}時 `
        time2.textContent = `${(new Date((subWeathers[1].dt-6*60*60)*1000)).getHours()}時 `
        time3.textContent = `${(new Date((subWeathers[2].dt-6*60*60)*1000)).getHours()}時 `
    }
    weatherImage(description: string){
        if(description == 'clearsky' || description == 'scatteredclouds' || description == 'fewclouds'){
            const condition = this.getTime()?.getHours() as number <=18 && this.getTime()?.getHours() as number>6;
            if (condition) {
                return `${imgPath}sunny.png`
            } else {
                return `${imgPath}moon.png`
            }
        } else if(description == 'brokenclouds' || description == 'overcastclouds'){
            return `${imgPath}cloud.png`
        } else if(description == 'lightrain' || description == 'moderaterain'){
            return `${imgPath}rain.png`
        } else {
            return `${imgPath}snow.png`
        }
    }
    getCountryName(){
        const countryInfo = countries.find((country: countryInfo)=>{
            return country.code == this.countryCode;
        }) as countryInfo
        return countryInfo.name.full;
    };
    getTime(){
        const GMT = new Date()
        const UTC = GMT.getTime() - 9*60*60*1000
        const time = new Date(UTC + this.timezone*1000);
        return time;
    };
    changeTimeFormat(): void{
        const element = this.card.getElementsByClassName("time")[0] as HTMLDivElement;
        const UTC = now - 9*60*60*1000
        const time = new Date(UTC + this.timezone*1000);
        const year = String(time.getFullYear())
        let month = String((time.getMonth() as number)+1)
        let day = String(time.getDate())
        let hours = String(time.getHours());
        let minutes = String(time.getMinutes());
        let seconds = String(time.getSeconds());
        if(month=='13'){
            month = '1';
        }
        if(this.getCharacterLength(month) == 1){
            month = '0' + month
        }
        if(this.getCharacterLength(day) == 1){
            day = '0' + day
        }
        if(this.getCharacterLength(hours) == 1){
            hours = '0' + hours
        }
        if(this.getCharacterLength(minutes) == 1){
            minutes = '0' + minutes
        }
        if(this.getCharacterLength(seconds) == 1){
            seconds = '0' + seconds
        }
        element.textContent = `${year}/${month}/${day}　${hours}:${minutes}:${seconds}`;
        const that = this;
        setTimeout(function(){
            that.changeTimeFormat()
        },500)
        if(minutes+seconds == '0000'){
            this.image()
            this.mainWeather()
            this.subWeathers()
        }
    };
    getCharacterLength (str: string) {
        return [...str].length;
    };
    image(){
        const countryCode = this.countryCode;
        const img = this.card.getElementsByTagName('img')[0];
        const condition = this.getTime()?.getHours() as number <=18 && this.getTime()?.getHours() as number>6;
        if (condition) {
            img.srcset = `${imgPath}${countryCode}.jpg`
        } else {
            img.srcset = `${imgPath}${countryCode}2.jpg`
        }
    };

}

function ready(){
    const tokyo = new Weather('tokyo', 32400, "JP");
    const shenZhen = new Weather('shenzhen', 28800, "CN")
    const bangalore = new Weather('bangalore', 19800, "IN")
    const telAviv = new Weather('tel aviv', 10800, "IL")
    const berlin = new Weather('berlin', 7200, "DE")
    const salvador = new Weather('salvador', -21600, "SV")
    const california = new Weather('california', -14400, "US")
    tokyo.changeTimeFormat()
    tokyo.image()
    tokyo.mainWeather()
    tokyo.subWeathers()

    shenZhen.changeTimeFormat()
    shenZhen.image()
    shenZhen.mainWeather()
    shenZhen.subWeathers()

    bangalore.changeTimeFormat()
    bangalore.image()
    bangalore.mainWeather()
    bangalore.subWeathers()

    telAviv.changeTimeFormat()
    telAviv.image()
    telAviv.mainWeather()
    telAviv.subWeathers()

    berlin.changeTimeFormat()
    berlin.image()
    berlin.mainWeather()
    berlin.subWeathers()

    salvador.timezone = salvador.timezone + 60*60*3
    salvador.changeTimeFormat()
    salvador.image()
    salvador.mainWeather()
    salvador.subWeathers()

    california.timezone = california.timezone - 60*60*3
    california.changeTimeFormat()
    california.image()
    california.mainWeather()
    california.subWeathers()
    const UTC = now - 9*60*60*1000
    const time = new Date(UTC + california.timezone*1000);
    // pages.classList.add("show")
}

function getListHTML(){
    const httpRequest = new XMLHttpRequest();
    httpRequest.open("GET", './components/list.html', false);
    httpRequest.send();
    listHTML = httpRequest.responseText;
}

// function getCards(){
//     const httpRequest = new XMLHttpRequest();
//     httpRequest.open("GET", './components/cards.html', false);
//     httpRequest.send();
//     cardsHTML = httpRequest.responseText;
//     pages.innerHTML = cardsHTML;
//     cardContainer = document.getElementById("card-container") as HTMLDivElement;
//     pagesArray.push(cardContainer)
// }

// function getNewsHTML(){
//     const httpRequest = new XMLHttpRequest();
//     httpRequest.open("GET", './components/news.html', true);
//     httpRequest.send();
//     newsHTML = httpRequest.responseText;
//     pages.innerHTML = newsHTML;
//     newsContainer = document.getElementById("news-container") as HTMLDivElement;
//     pagesArray.push(newsContainer)
// }

// function getTodoHTML(){
//     const httpRequest = new XMLHttpRequest();
//     httpRequest.open("GET", './components/todo.html', true);
//     httpRequest.send();
//     todoHTML = httpRequest.responseText;
//     pages.innerHTML = todoHTML;
//     todoContainer = document.getElementById("todo-container") as HTMLDivElement;
//     pagesArray.push(todoContainer)
// }

// function getCalendarHTML(){
//     const httpRequest = new XMLHttpRequest();
//     httpRequest.open("GET", './components/calendar.html', true);
//     httpRequest.send();
//     calendarHTML = httpRequest.responseText;
//     pages.innerHTML = calendarHTML;
//     calendarContainer = document.getElementById("calendar-container") as HTMLDivElement;
//     pagesArray.push(calendarContainer)
// }

function getNews(searchWord: string){
    const today = new Date();
    const year = today.getFullYear();
    let month: string|number = today.getMonth()+1
    if (month==13) {
        month -=12;
    }
    month = String(month)
    if (Number(month)<10) {
        month = '0' + month
    }
    let day = String(today.getDate()-1);
    if (Number(day)<10) {
        day = '0' + day
    }
    const data = null;
    const xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === this.DONE) {
            const response = JSON.parse(this.responseText);
            for (let i = 0; i < response.articles.length; i++) {
                newsArticles.push(response.articles[i])
                createList(response.articles[i])
            }
            makeNewsCards()
        }
    });
    xhr.open("GET", `https://free-news.p.rapidapi.com/v1/search?lang=en&page_size=24&q=${searchWord}`);
    // xhr.open("GET", `https://free-news.p.rapidapi.com/v1/search?q=${searchWord}&lang=en&page_size=24&topic=world`);
    xhr.setRequestHeader("x-rapidapi-key", "656a05a445mshe4e4050abeb5ba5p11c11djsn78c4cfab23c5");
    xhr.setRequestHeader("x-rapidapi-host", "free-news.p.rapidapi.com");
    xhr.send(data);
}
async function getJSON() {
    const req = new XMLHttpRequest();		  // XMLHttpRequest オブジェクトを生成する
    await req.open("GET", "./components/country.json", false); // HTTPメソッドとアクセスするサーバーの　URL　を指定
    await req.send(null);					    // 実際にサーバーへリクエストを送信
    // req.onreadystatechange = function() {		  // XMLHttpRequest オブジェクトの状態が変化した際に呼び出されるイベントハンドラ
    // };
    if(req.readyState == 4 && req.status == 200){ // サーバーからのレスポンスが完了し、かつ、通信が正常に終了した場合
        return req.responseText	          // 取得した JSON ファイルの中身を表示
    }
    return req.statusText;
}

function makeNewsCards(){
    const html = `                                <div id="" class="card">
    <div class="card-title title-font flex justify-between">
        <p></p>
        <div class="time"></div>
    </div>
    <div class="news-card-img">
        <img class="hidden lazy-show">
    </div>
    <div class="card-content" style="padding: 2%;">
        <div style="background-color:rgb(253, 253, 253);border-radius:5px;padding: 7px 15px;margin-bottom: 5px;display:flex;min-height: 165px;">
            <div>
                <div style="flex justify-between">
                    <div class="title-font" style="margin-bottom: 5px;"><span class="date"></span></div>
                    <div class="title-font" style="margin-bottom: 5px;">author: <span class="author">none</span></div>
                </div>
                <div>
                    <p style="font-size:15px;line-height: normal;"></p>
                </div>
            </div>
        </div>
    </div>`;
    for (let i = 0; i < newsArticles.length; i++) {
        const newsContainer = document.getElementById("news-container") as HTMLDivElement
        const newDiv = document.createElement("div")
        newDiv.insertAdjacentHTML('afterbegin', html);
        newDiv.classList.add("flex")
        //main-image
        const cardImg = newDiv.getElementsByClassName("news-card-img");
        const img = cardImg[0].getElementsByTagName("img");
        img[0].src = newsArticles[i].media
        if(newsArticles[i].media==null){
            img[0].src = "./img/news.jpg"
        }
        //title
        const cardTitle = newDiv.getElementsByClassName("card-title");
        const p = cardTitle[0].getElementsByTagName("p");
        p[0].textContent = newsArticles[i].title

        //date
        const cardContent = newDiv.getElementsByClassName("card-content");
        const date = cardContent[0].getElementsByClassName("date");
        date[0].textContent = newsArticles[i].published_date

        //author
        const author = cardContent[0].getElementsByClassName("author");
        if (newsArticles[i].author) {
            author[0].textContent = newsArticles[i].author
        }

        //author
        let summary = newsArticles[i].summary;
        const p2 = cardContent[0].getElementsByTagName("p");
        if (summary && summary.length>=291) {
            summary = newsArticles[i].summary.slice(0, 290) + '...'
        }
        p2[0].textContent = summary
        newsContainer.appendChild(newDiv)
        // var element = new Image();
        // element.src = newsArticles[i].media ;
        // element.onload = function () {
        //     setTimeout(function(){
        //         const size = {
        //             width: element.width,
        //             height: element.naturalHeight,
        //         };
        //         console.log(size);
        //     },500)
        // }
        // URL.revokeObjectURL(element.src);
    }
}

function createList(article: article){
    let newDiv: HTMLDivElement = document.createElement("div")//div作成
    const listItems = document.getElementById("list-items") as HTMLDivElement
    newDiv.innerHTML = listHTML;//新しく作ったdiv内にコンポーネントを入れる。(カードが完成)
    const title = newDiv.getElementsByClassName("title")[0] as HTMLAnchorElement
    title.textContent = article.title
    title.href = article.link
    listItems.appendChild(newDiv);//カードコンテナに入れる
}

// function getServerTime() {
//     now = (new Date()).getTime()
//     setTimeout(function(){
//         getServerTime()
//     },500)
// }

const promise = getJSON()
promise.then((res)=>{
    countries = JSON.parse(res)
    ready()
})

function active(index: number){
    const header = document.getElementById("header") as HTMLDivElement;
    const navItems = header.getElementsByClassName("nav-item") as HTMLCollectionOf<HTMLElement>;
    const classes = navItems[index].classList.value.split(' ');
    const isActive = classes.some((classList: string): boolean =>{
        return classList === 'nav-active';
    })
    if (!isActive) {
        for (let i = 0; i < navItems.length; i++) {
            navItems[i].classList.remove('nav-active');
        }
        navItems[index].classList.add('nav-active')
        activePage(index)
    }
}

function activePage(index: number){
    for (let i = 0; i < pagesIdArray.length; i++) {
        (pagesIdArray[i] as any).classList.remove('show');
    }
    setTimeout(function(){
        for (let i = 0; i < pagesIdArray.length; i++) {
            (pagesIdArray[i] as any).classList.add('none');
        }
        pagesIdArray[index].classList.remove("none")
        setTimeout(function(){pagesIdArray[index].classList.add('show')},100)

    },1500)
}

function getSchedule(){
    let mySchedule = [];
    if(mySchedule.length==0){
        const newDiv = document.createElement("div") as HTMLDivElement;
        newDiv.classList.add("nav-item")
        newDiv.textContent = 'nothing　special　today'
        const schedule = document.getElementById("schedule") as HTMLDivElement
        schedule.appendChild(newDiv);
    }
}


function pagesId(){
    const cardContainer = document.getElementById("card-container")
    const newsContainer = document.getElementById("news-container")
    const todoContainer = document.getElementById("todo-container")
    const calendarContainer = document.getElementById("calendar-container")
    pagesIdArray.push(cardContainer)
    pagesIdArray.push(newsContainer)
    pagesIdArray.push(todoContainer)
    pagesIdArray.push(calendarContainer)
}
function showImg(){
    let event = window.event as path;
    (event.path[0] ).classList.add("lazy-show")
    setTimeout(function(){
    },1000)
}
function lazyLoad(){
    const img = document.getElementsByTagName("img") as HTMLCollectionOf<HTMLImageElement>
    for (let i = 0; i < img.length; i++) {
        img[i].addEventListener("load", (e)=>{
            showImg()
        })
    }
}





const todoInput = document.getElementById("todoInput") as HTMLInputElement;
const todo = document.getElementById("todo") as HTMLInputElement;
const addTodoEl = document.getElementById("add-todo") as HTMLInputElement;
const deleteAllTodoEl = document.getElementById("delete-all-todo") as HTMLInputElement;
const updateTodoEl = document.getElementById("update-todo") as HTMLInputElement;
const cancelTodoEl = document.getElementById("cancel-todo") as HTMLInputElement;
let keepTodo: string;
let editMode = false;
let selectedList :HTMLDivElement;
let editTodoEl: HTMLCollectionOf<HTMLButtonElement>;
let deleteTodoEl: HTMLCollectionOf<HTMLButtonElement>;

function addTodo(){
    if (todoInput.value) {
        const newDiv = document.createElement("div")
        const listHTML = `<div class="flex align-center hidden show todo">
        <div class="list" style="font-size:20px"></div>
        <div class="flex">
            <button class="edit-todo" onclick="editTodo()">編集</button>
            <button class="delete-todo" onclick="deleteTodo()">削除</button>
        </div>
    </div>`
        newDiv.insertAdjacentHTML('afterbegin', listHTML);
        const list = newDiv.getElementsByClassName("list");
        list[0].textContent = todoInput.value;
        todo.appendChild(newDiv);
        todoInput.value = ""
    }
}

function deleteAllTodo(){
        const allTodo = todo.getElementsByClassName("todo") as HTMLCollectionOf<HTMLElement>;
        for (let i = allTodo.length-1; i >= 0; i--) {
            allTodo[i].classList.remove("show")
            setTimeout(function(){allTodo[i].remove();},500)
        }
}

function deleteTodo(){
    let event = window.event as path;
    event.path[2].classList.remove("show");
    setTimeout(function(){event.path[2].remove();},500)
}

function editTodo(){
    editTodoEl = document.getElementsByClassName("edit-todo") as HTMLCollectionOf<HTMLButtonElement>;
    deleteTodoEl = document.getElementsByClassName("delete-todo") as HTMLCollectionOf<HTMLButtonElement>;
    editMode = true;
    todoInput.value = ""
    let event = window.event as path;
    selectedList = event.path[2] as HTMLDivElement
    selectedList.classList.add("active-todo");
    const list = selectedList.getElementsByClassName("list")[0] as HTMLDivElement
    keepTodo = list.textContent as string;
    todoInput.value = list.textContent as string;
    addTodoEl.classList.add("none")
    deleteAllTodoEl.classList.add("none")
    updateTodoEl.classList.remove("none")
    cancelTodoEl.classList.remove("none")
    for (let i = editTodoEl.length-1; i >= 0; i--) {
        editTodoEl[i].classList.add("none")
        deleteTodoEl[i].classList.add("none")
    }
}

function updateTodo(){
    editMode = false;
    todoInput.value = ""
    selectedList.classList.remove("active-todo");
    addTodoEl.classList.remove("none")
    deleteAllTodoEl.classList.remove("none")
    updateTodoEl.classList.add("none")
    cancelTodoEl.classList.add("none")
    for (let i = 0; i < editTodoEl.length; i++) {
        editTodoEl[i].classList.remove("none")
        deleteTodoEl[i].classList.remove("none")
    }
}

function cancelTodo(){
    editMode = false;
    todoInput.value = ""
    selectedList.classList.remove("active-todo");
    let event = window.event as path;
    const list = selectedList.getElementsByClassName("list")[0] as HTMLDivElement
    list.textContent = keepTodo;
    addTodoEl.classList.remove("none")
    deleteAllTodoEl.classList.remove("none")
    updateTodoEl.classList.add("none")
    cancelTodoEl.classList.add("none")
    for (let i = 0; i < editTodoEl.length; i++) {
        editTodoEl[i].classList.remove("none")
        deleteTodoEl[i].classList.remove("none")
    }
}

function changeText(){
    if(editMode){
        selectedList.getElementsByClassName("list")[0].textContent = todoInput.value
    }
}
class Todo {
    constructor(){}
    createList(){
        const newDiv = document.createElement("div")
    }
}


class Calendar {
    public selectedDate: Date;
    public firstDayOfSelectedMonth: Date;
    public firstDayOfNextMonth: Date;
    public startDate: Date;
    public lastDayOfSelectedMonth: Date;
    public firstDayNum: number;
    public calendarList: number[];
    constructor(...arg: any[]){
        if(arg.length>0){
            this.selectedDate = new Date(arg[0])
        } else {
            this.selectedDate = new Date()
        }
        this.firstDayOfSelectedMonth = this.getFirstDay(this.selectedDate);
        this.firstDayNum = this.firstDayOfSelectedMonth.getDay();
        this.startDate = this.getStartDate(this.selectedDate)
        this.firstDayOfNextMonth = this.getFirstDayOfNextMonth(this.selectedDate)
        this.lastDayOfSelectedMonth = this.getLastDayOfSelectedMonth(this.selectedDate);
        this.calendarList = this.thisMonthCalendarArray();

    }
    getLastDayOfSelectedMonth(date: Date){
        const getFirstDayOfNextMonth = this.getFirstDayOfNextMonth(date);
        getFirstDayOfNextMonth.setDate(0)
        return getFirstDayOfNextMonth;
    }
    getFirstDayOfNextMonth(date: Date){
        return this.getFirstDay(this.getNextMonth(date))
    }
    getNextMonth(date: Date){
        const now = new Date();
        const nextMonth = this.getMonth(date.getMonth())
        now.setMonth(nextMonth)
        return now

    }
    getMonth(month: number){
        month +=1;
        if (month >= 13) {
            month -= 12;
        }
        return month;
    }
    getFirstDay(date: Date){
        const year = date.getFullYear()
        const month = this.getMonth(date.getMonth())
        const firstDay = new Date(`${year}-${month}-01`);
        return firstDay;
    }
    getStartDate(date: Date){
        const year = date.getFullYear()
        const month = this.getMonth(date.getMonth())
        const firstDay = new Date(`${year}-${month}-01`);
        const startDateOfLastMonth = new Date(firstDay.setDate(1-this.firstDayNum));
        return startDateOfLastMonth
    }
    makeFirstArray(){
        const selectedMonthCalendarList = [];
        for (let i = 0; i < this.firstDayNum; i++) {
            selectedMonthCalendarList.push(this.startDate.getDate() + i)
        }
        return selectedMonthCalendarList;
    }
    makeSecondArray(){
        const lastDateOfThisMonth = this.lastDayOfSelectedMonth.getDate();
        const selectedMonthCalendarList = [];
        for (let i = 1; i < lastDateOfThisMonth+1; i++) {
            selectedMonthCalendarList.push(i)
        }
        return selectedMonthCalendarList;
    }
    makeThirdArray(){
        const lastDateOfThisMonth = this.makeFirstArray().length + this.makeSecondArray().length;
        let cell = 43;
        if (lastDateOfThisMonth<=35) {
            cell = 36;
        }
        if(lastDateOfThisMonth<=28) {
            cell = 29;
        }
        const selectedMonthCalendarList = [];
        for (let i = 1; i < cell-lastDateOfThisMonth; i++) {
            selectedMonthCalendarList.push(i)
        }
        return selectedMonthCalendarList;
    }
    thisMonthCalendarArray(){
        const array1 = this.makeFirstArray().concat(this.makeSecondArray());
        const calendarList = array1.concat(this.makeThirdArray());
        return calendarList;
    }
    divideArray(){
        var arrList = [];
        var idx = 0;
        while(idx < this.calendarList.length){
            arrList.push(this.calendarList.splice(idx,idx+7));
        }
        return arrList;
    }
    createCalendar(id: string){
        const calendar = document.getElementById(id) as HTMLDivElement;
        calendar.style.maxWidth = '840px'
        may.divideArray().forEach((week)=>{
            const weekDiv = document.createElement("div");
            weekDiv.classList.add("flex");
            weekDiv.classList.add("week");
            week.forEach((day)=>{
                const dayDiv = document.createElement("div");
                dayDiv.classList.add("w100")
                const dayHTML = `<div class="day"></div>`
                dayDiv.insertAdjacentHTML('afterbegin', dayHTML);
                const dayClass = dayDiv.getElementsByClassName("day")[0] as HTMLDivElement;
                dayClass.textContent = String(day);
                weekDiv.appendChild(dayDiv);
            })
            calendar.appendChild(weekDiv);
        })
    }
}
const may = new Calendar("2021-02-08");

may.createCalendar("calendar")
console.log(document.getElementsByClassName("day"))


const calendar = document.getElementById("calendar");

//今日を2021-05-08とする。
const today = new Date();
const thisYear = today.getFullYear();
let thisMonth = today.getMonth() +1;
if (thisMonth == 13) {
    thisMonth -= 12;
}
let nextYear = thisYear;
let nextMonth = thisMonth +1;
if (nextMonth == 13) {
    nextMonth -= 12;
    nextYear +=1;
}

const thisDate = today.getDate();

//2021-05-01を出す。
const firstDay = new Date(`${thisYear}-${thisMonth}-01`);
//次の月を出す
const firstDayOfNextMonth = new Date(`${nextYear}-0${nextMonth}-01`);
const lastDayOfThisMonth = new Date(firstDayOfNextMonth.setDate(0));
const lastDateOfThisMonth = lastDayOfThisMonth.getDate();
//カレンダー上で2021-05-01がどこから始まるかを算出。
const firstDayNum = firstDay.getDay();
const firstDate = firstDay.getDate();
//カレンダーの一番最初が先月の何日から始まるかを算出。
const startDayOfLastMonth = new Date(firstDay.setDate(1-firstDayNum));
const startDateOfLastMonth = startDayOfLastMonth.getDate()

//カレンダーのスタートは2021-04-25
const lastMonthCalendarList = [];
for (let i = 0; i < firstDayNum; i++) {
    lastMonthCalendarList.push(startDateOfLastMonth + i)
}
const thisMonthCalendarList = [];
for (let i = 1; i < lastDateOfThisMonth+1; i++) {
    thisMonthCalendarList.push(i)
}

const nextMonthCalendarList = []
for (let i = 1; i < 43-lastMonthCalendarList.length-thisMonthCalendarList.length; i++) {
    nextMonthCalendarList.push(i)
}

const array1 = lastMonthCalendarList.concat(thisMonthCalendarList);
const calendarList = array1.concat(nextMonthCalendarList);

function main(){
    lazyLoad()
    // getNewsHTML()
    // getTodoHTML()
    // getCalendarHTML()
    getNews('technology')
    // for (let i = 0; i < searchWords.length; i++) {
    //     getNews(searchWords[i])
    // }
    getListHTML()
    // getServerTime();
    // getCards()
    getSchedule()
    pagesId()
}

main()

// const httpRequest = new XMLHttpRequest();
// httpRequest.open("GET", 'https://lnoueryo98.sakura.ne.jp/blog/api/blog', false);
// httpRequest.send();
// console.log(JSON.parse(httpRequest.responseText))
