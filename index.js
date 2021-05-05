"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const baseurl1 = 'https://api.openweathermap.org/data/2.5/';
const baseurl2 = 'https://api.openweathermap.org/geo/1.0/';
const apiKey = '9e69adbbcef4bf2f73c4db5a809e4de8';
const imgPath = './img/';
const wrapper = document.getElementById("wrapper");
let countries;
let now;
class Weather {
    constructor(cityName) {
        this.cityName = cityName;
        this.cityInfo = this.getCityInfo();
        this.timezone = (this.today()).timezone;
        this.card = document.getElementById(this.cityInfo.country);
    }
    ;
    today() {
        const today = baseurl1 + `weather?q=${this.cityName}&appid=${apiKey}`;
        const httpRequest = new XMLHttpRequest();
        httpRequest.open("GET", today, false);
        httpRequest.send();
        if (httpRequest.status === 200) {
            return JSON.parse(httpRequest.responseText);
        }
        return httpRequest.statusText;
    }
    ;
    fiveDaysPerThreeHours() {
        const httpRequest = new XMLHttpRequest();
        const fiveDaysPerThreeHours = baseurl1 + `forecast?q=${this.cityName}&appid=${apiKey}`;
        httpRequest.open("GET", fiveDaysPerThreeHours, false);
        httpRequest.send();
        if (httpRequest.status === 200) {
            return JSON.parse(httpRequest.responseText);
        }
        return httpRequest.statusText;
    }
    ;
    filterWeather() {
        const now = Math.floor(((new Date()).getTime()) / 1000) + this.timezone - 3 * 60 * 60;
        const oneDayLater = now + 60 * 60 * 24;
        const lists = (this.fiveDaysPerThreeHours()).list.filter((li) => {
            return now < li.dt && li.dt < oneDayLater;
        });
        return lists;
    }
    ;
    mainWeather() {
        const mainWeather = this.filterWeather()[0];
        const mainWeatherElement = this.card.getElementsByClassName("main-weather")[0];
        const wind = mainWeatherElement.getElementsByClassName("wind")[0];
        const humidity = mainWeatherElement.getElementsByClassName("humidity")[0];
        const pressure = mainWeatherElement.getElementsByClassName("pressure")[0];
        const temp = mainWeatherElement.getElementsByClassName("temp")[0];
        const pop = mainWeatherElement.getElementsByClassName("pop")[0];
        wind.textContent = String(mainWeather.wind.speed);
        humidity.textContent = String(mainWeather.main.humidity);
        pressure.textContent = String(mainWeather.main.pressure);
        temp.textContent = String(Math.floor(mainWeather.main.temp - 273.15));
        pop.textContent = String(Math.floor(mainWeather.pop * 100));
        const description = mainWeather.weather[0].description.replace(/\s+/g, '');
        const cardContent = this.card.getElementsByClassName("card-content")[0];
        const mainWeatherImg = cardContent.getElementsByTagName('img')[0];
        mainWeatherImg.src = this.weatherImage(description);
    }
    ;
    subWeathers() {
        const weatherInfo = this.filterWeather();
        const subWeathers = [weatherInfo[1], weatherInfo[2], weatherInfo[3]];
        const subWeatherElements = this.card.getElementsByClassName("sub-weathers")[0];
        const sub1Img = subWeatherElements.getElementsByTagName("img")[0];
        const sub2Img = subWeatherElements.getElementsByTagName("img")[1];
        const sub3Img = subWeatherElements.getElementsByTagName("img")[2];
        const pop1 = subWeatherElements.getElementsByClassName("pop")[0];
        const pop2 = subWeatherElements.getElementsByClassName("pop")[1];
        const pop3 = subWeatherElements.getElementsByClassName("pop")[2];
        const time1 = subWeatherElements.getElementsByClassName("time")[0];
        const time2 = subWeatherElements.getElementsByClassName("time")[1];
        const time3 = subWeatherElements.getElementsByClassName("time")[2];
        sub1Img.src = this.weatherImage(subWeathers[0].weather[0].description.replace(/\s+/g, ''));
        sub2Img.src = this.weatherImage(subWeathers[1].weather[0].description.replace(/\s+/g, ''));
        sub3Img.src = this.weatherImage(subWeathers[2].weather[0].description.replace(/\s+/g, ''));
        pop1.textContent = String(Math.floor(subWeathers[0].pop * 100));
        pop2.textContent = String(Math.floor(subWeathers[1].pop * 100));
        pop3.textContent = String(Math.floor(subWeathers[2].pop * 100));
        time1.textContent = `${(new Date((subWeathers[0].dt - 6 * 60 * 60) * 1000)).getHours()}時 `;
        time2.textContent = `${(new Date((subWeathers[1].dt - 6 * 60 * 60) * 1000)).getHours()}時 `;
        time3.textContent = `${(new Date((subWeathers[2].dt - 6 * 60 * 60) * 1000)).getHours()}時 `;
        console.log(subWeathers);
    }
    weatherImage(description) {
        var _a, _b;
        if (description == 'clearsky' || description == 'scatteredclouds' || description == 'fewclouds') {
            const condition = ((_a = this.getTime()) === null || _a === void 0 ? void 0 : _a.getHours()) <= 18 && ((_b = this.getTime()) === null || _b === void 0 ? void 0 : _b.getHours()) > 6;
            if (condition) {
                return `${imgPath}sunny.png`;
            }
            else {
                return `${imgPath}moon.png`;
            }
        }
        else if (description == 'brokenclouds' || description == 'overcastclouds') {
            return `${imgPath}cloud.png`;
        }
        else if (description == 'lightrain' || description == 'moderaterain') {
            return `${imgPath}rain.png`;
        }
        else {
            return `${imgPath}snow.png`;
        }
    }
    getCityInfo() {
        const httpRequest = new XMLHttpRequest();
        const cityInfo = baseurl2 + `direct?q=${this.cityName}&limit=1&appid=${apiKey}`;
        httpRequest.open("GET", cityInfo, false);
        httpRequest.send();
        if (httpRequest.status === 200) {
            return JSON.parse(httpRequest.responseText)[0];
        }
    }
    ;
    getCountryName() {
        const countryInfo = countries.find((country) => {
            return country.code == this.cityInfo.country;
        });
        return countryInfo.name.full;
    }
    ;
    getTime() {
        const httpRequest = new XMLHttpRequest();
        httpRequest.open('HEAD', window.location.href, false);
        httpRequest.send();
        if (httpRequest.status === 200) {
            const GMT = new Date(httpRequest.getResponseHeader('Date'));
            const UTC = GMT.getTime() - 9 * 60 * 60 * 1000;
            const time = new Date(UTC + this.timezone * 1000);
            return time;
        }
    }
    ;
    changeTimeFormat() {
        const element = this.card.getElementsByClassName("time")[0];
        const UTC = now - 9 * 60 * 60 * 1000;
        const time = new Date(UTC + this.timezone * 1000);
        const year = String(time.getFullYear());
        let month = String(time.getMonth() + 1);
        let day = String(time.getDate());
        let hours = String(time.getHours());
        let minutes = String(time.getMinutes());
        let seconds = String(time.getSeconds());
        if (month == '13') {
            month = '1';
        }
        if (this.getCharacterLength(month) == 1) {
            month = '0' + month;
        }
        if (this.getCharacterLength(day) == 1) {
            day = '0' + day;
        }
        if (this.getCharacterLength(hours) == 1) {
            hours = '0' + hours;
        }
        if (this.getCharacterLength(minutes) == 1) {
            minutes = '0' + minutes;
        }
        if (this.getCharacterLength(seconds) == 1) {
            seconds = '0' + seconds;
        }
        element.textContent = `${year}/${month}/${day}　${hours}:${minutes}:${seconds}`;
        const that = this;
        setTimeout(function () {
            that.changeTimeFormat();
        }, 250);
    }
    ;
    getCharacterLength(str) {
        return [...str].length;
    }
    ;
    image() {
        var _a, _b;
        const countryCode = this.cityInfo.country;
        const img = this.card.getElementsByTagName('img')[0];
        const condition = ((_a = this.getTime()) === null || _a === void 0 ? void 0 : _a.getHours()) <= 18 && ((_b = this.getTime()) === null || _b === void 0 ? void 0 : _b.getHours()) > 6;
        if (condition) {
            img.src = `${imgPath}${countryCode}.jpg`;
        }
        else {
            img.src = `${imgPath}${countryCode}2.jpg`;
        }
    }
    ;
}
function main() {
    const tokyo = new Weather('tokyo');
    const shenZhen = new Weather('shenzhen');
    const bangalore = new Weather('bangalore');
    const telAviv = new Weather('tel aviv');
    const berlin = new Weather('berlin');
    const salvador = new Weather('salvador');
    const california = new Weather('california');
    tokyo.changeTimeFormat();
    tokyo.image();
    tokyo.mainWeather();
    tokyo.subWeathers();
    shenZhen.changeTimeFormat();
    shenZhen.image();
    shenZhen.mainWeather();
    shenZhen.subWeathers();
    bangalore.changeTimeFormat();
    bangalore.image();
    bangalore.mainWeather();
    bangalore.subWeathers();
    telAviv.changeTimeFormat();
    telAviv.image();
    telAviv.mainWeather();
    telAviv.subWeathers();
    berlin.changeTimeFormat();
    berlin.image();
    berlin.mainWeather();
    berlin.subWeathers();
    salvador.timezone = salvador.timezone + 60 * 60 * 3;
    salvador.changeTimeFormat();
    salvador.image();
    salvador.mainWeather();
    salvador.subWeathers();
    california.timezone = california.timezone - 60 * 60 * 3;
    california.changeTimeFormat();
    california.image();
    california.mainWeather();
    california.subWeathers();
    const UTC = now - 9 * 60 * 60 * 1000;
    const time = new Date(UTC + california.timezone * 1000);
    console.log(new Date(UTC));
    console.log(-14400 / 60 / 60);
    console.log(california.today());
    console.log(salvador.today());
    ready();
    // console.log(((tokyo.fiveDaysPerThreeHours()).list[0]).pop)
    // console.log(new Date('2021-05-04 15:00:00'))
}
function getJSON() {
    return __awaiter(this, void 0, void 0, function* () {
        const req = new XMLHttpRequest(); // XMLHttpRequest オブジェクトを生成する
        yield req.open("GET", "./country.json", false); // HTTPメソッドとアクセスするサーバーの　URL　を指定
        yield req.send(null); // 実際にサーバーへリクエストを送信
        // req.onreadystatechange = function() {		  // XMLHttpRequest オブジェクトの状態が変化した際に呼び出されるイベントハンドラ
        // };
        if (req.readyState == 4 && req.status == 200) { // サーバーからのレスポンスが完了し、かつ、通信が正常に終了した場合
            return req.responseText; // 取得した JSON ファイルの中身を表示
        }
        return req.statusText;
    });
}
function getServerTime() {
    const req = new XMLHttpRequest();
    req.open('HEAD', window.location.href, false);
    req.send();
    if (req.readyState === 4) {
        now = (new Date(req.getResponseHeader('Date'))).getTime();
        setTimeout(function () {
            getServerTime();
        }, 500);
    }
}
function ready() {
    wrapper.classList.add('show');
}
getServerTime();
const promise = getJSON();
promise.then((res) => {
    countries = JSON.parse(res);
    main();
});
// setTimeout(function(){
//     const card = document.getElementById("JP") as HTMLDivElement;
//     const imgFrame = card.getElementsByClassName("card-img")[0] as HTMLDivElement;
//     const cardContent = card.getElementsByClassName("card-content")[0] as HTMLDivElement;
//     const img = imgFrame.getElementsByTagName('img')[0]
//     const mainWeather = cardContent.getElementsByTagName('img')[0]
//     mainWeather.src = `${imgPath}sunny.png`
//     console.log(mainWeather)
//     img.classList.remove('show')
//     setTimeout(function(){img.src = './img/JP1.jpg'; img.classList.add('show')},1600)
// }, 4000)
