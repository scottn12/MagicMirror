/**
 * TODO
 * [x]  Word of the day
 * [ ]  ETA for work today  
 * [x]  Twitch integration
 * [ ]  Sports integration
 */

main();

async function main() {
    await setup();
    setDate();
    setInterval(setDate, 1000); // 1 second
    setLocation();
    setCurrentWeather();
    setInterval(setCurrentWeather, 60 * 60 * 1000); // 1 hour
    setCal();
    //setReddit();
    //setInterval(setReddit, 30 * 60 * 1000); // 30 minutes
    setWord();
    setTwitch();
    setInterval(setTwitch, 15 * 60 * 1000); // 15 minutes
}

function setup() {
    navigator.geolocation.getCurrentPosition(function (location) {
        localStorage.setItem("lat", location.coords.latitude);
        localStorage.setItem("lon", location.coords.longitude);
    });
}

function setDate() {
    // Time
    var d = new Date();
    var meridian = "AM";
    var hour = d.getHours();
    if (hour > 12) {
        hour -= 12;
        meridian = "PM";
    }
    var minute = ("00" + d.getMinutes()).substr(-2);            
    document.getElementById('time').innerHTML = hour + ":" + minute + " " + meridian + "<br>";
    // Date
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    document.getElementById('date').innerHTML = days[d.getDay()] + "<br>" + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
}

function setLocation() {
    var lat = localStorage.getItem("lat");
    var lon = localStorage.getItem("lon");
    var request = new XMLHttpRequest();
    request.open("GET", "https://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lon + "&zoom=18&addressdetails=1");
    request.onload = function () {
        if (this.readyState === this.DONE) {
            if (this.status >= 200 && this.status < 300) {
                var json = JSON.parse(this.response);
                var str = "";
                str += json["address"]["city"] + ", ";
                states = {'Alabama':'AL', 'Alaska':'AK', 'American Samoa':'AS', 'Arizona':'AZ', 'Arkansas':'AR', 'California':'CA', 'Colorado':'CO', 'Connecticut':'CT', 'Delaware':'DE', 'District Of Columbia':'DC', 'Federated States Of Micronesia':'FM', 'Florida':'FL', 'Georgia':'GA', 'Guam':'GU', 'Hawaii':'HI', 'Idaho':'ID', 'Illinois':'IL', 'Indiana':'IN', 'Iowa':'IA', 'Kansas':'KS', 'Kentucky':'KY', 'Louisiana':'LA', 'Maine':'ME', 'Marshall Islands':'MH', 'Maryland':'MD', 'Massachusetts':'MA', 'Michigan':'MI', 'Minnesota':'MN', 'Mississippi':'MS', 'Missouri':'MO', 'Montana':'MT', 'Nebraska':'NE', 'Nevada':'NV', 'New Hampshire':'NH', 'New Jersey':'NJ', 'New Mexico':'NM', 'New York':'NY', 'North Carolina':'NC', 'North Dakota':'ND', 'Northern Mariana Islands':'MP', 'Ohio':'OH', 'Oklahoma':'OK', 'Oregon':'OR', 'Palau':'PW', 'Pennsylvania':'PA', 'Puerto Rico':'PR', 'Rhode Island':'RI', 'South Carolina':'SC', 'South Dakota':'SD', 'Tennessee':'TN', 'Texas':'TX', 'Utah':'UT', 'Vermont':'VT', 'Virgin Islands':'VI', 'Virginia':'VA', 'Washington':'WA', 'West Virginia':'WV', 'Wisconsin':'WI', 'Wyoming':'WY'};
                str += states[json["address"]["state"]]
                document.getElementById('city').innerHTML = str;
            } 
            else {
                console.log(request);
            }
        }
    };
    request.onerror = function () {
        console.log(request);
    };
    request.send();
}

function setCurrentWeather() {
    var lat = localStorage.getItem("lat");
    var lon = localStorage.getItem("lon");
    var request = new XMLHttpRequest();
    var key = ""; // Hide
    request.open("GET", "http://api.openweathermap.org/data/2.5/weather?lat="+ lat + "&lon=" + lon + "&APPID=" + key);
    request.onload = function () {
        if (this.readyState === this.DONE) {
            if (this.status >= 200 && this.status < 300) {
                var json = JSON.parse(this.response);
                // Setup
                var weatherID = json["weather"][0]["id"];
                var sunrise = json["sys"]["sunrise"];
                var sunset = json["sys"]["sunset"];
                var curr = json["dt"];
                // Weather Icon
                var weatherIcon = getWeatherIcon(weatherID, sunrise, sunset, curr, "large-weather-icon");
                document.getElementById('weather').innerHTML = "";
                document.getElementById('weather').appendChild(weatherIcon);
                // Temp
                var temp = document.createElement("span");
                temp.setAttribute("class", "temp");
                temp.innerHTML = Math.round(json["main"]["temp"] * 9/5 - 459.67);
                temp.innerHTML += "&#8457";
                document.getElementById('weather').appendChild(temp);

                setSunTimes(sunrise, sunset);
                setForecast(sunrise, sunset);
                
            } 
            else {
                console.log(request);
            }
        }
    };
    request.onerror = function () {
        console.log(request);
    };
    request.send();
}

function setSunTimes(sunrise, sunset) {
    // Sunrise
    var d = new Date(0);
    d.setUTCSeconds(sunrise);
    document.getElementById('sunrise-time').textContent = d.getHours() + ":" + ("00" + d.getMinutes()).substr(-2) + " AM";
    // Sunset
    var d = new Date(0);
    d.setUTCSeconds(sunset);
    document.getElementById('sunset-time').textContent = (d.getHours()-12) + ":" + ("00" + d.getMinutes()).substr(-2) + " PM";
}

function setForecast(sunrise, sunset) {
    var lat = localStorage.getItem("lat");
    var lon = localStorage.getItem("lon");
    var request = new XMLHttpRequest();
    var key = ""; // Hide
    request.open("GET", "http://api.openweathermap.org/data/2.5/forecast?lat="+ lat + "&lon=" + lon + "&APPID=" + key);
    request.onload = function () {
        if (this.readyState === this.DONE) {
            if (this.status >= 200 && this.status < 300) {
                var json = JSON.parse(this.response);
                // Next 12 hours
                var list = json["list"];
                for (var i = 0; i < 4; i++) {
                    // Time
                    var curr = list[i]["dt"];
                    d = new Date(0);
                    d.setUTCSeconds(curr);
                    var meridian = "AM";
                    var hours = d.getHours();
                    if (hours > 12) {
                        hours -= 12;
                        meridian = "PM";
                    }
                    var id = "forecast" + (i+1).toString(10);
                    document.getElementById(id).innerHTML = hours + " " + meridian + "<br>";
                    // Weather Icon
                    var weatherID = list[i]["weather"][0]["id"];
                    var weatherIcon = getWeatherIcon(weatherID, sunrise, sunset, curr, "small-weather-icon");
                    document.getElementById(id).appendChild(weatherIcon);
                    // Temp
                    var temp = document.createElement("span"); 
                    temp.setAttribute("class", "small-temp");
                    temp.innerHTML += "<br>";
                    temp.innerHTML += Math.round(list[i]["main"]["temp"] * 9/5 - 459.67);
                    temp.innerHTML += "&#8457";
                    document.getElementById(id).appendChild(temp);
                }
            } 
            else {
                console.log(request);
            }
        }
    };
    request.onerror = function () {
        console.log(request);
    };
    request.send();
}

function getWeatherIcon (weatherID, sunrise, sunset, curr, classID) {
    var daytime = curr >= sunrise && curr <= sunset;
    var weatherIcon = document.createElement("img");
    weatherIcon.setAttribute("class", classID);
    if (weatherID < 300) {
        weatherIcon.setAttribute("src", "img/weather/storm.png");    
    }
    else if (weatherID == 511) {
        weatherIcon.setAttribute("src", "img/weather/hail.png");  // is freezing rain hail?
    }
    else if (weatherID < 600) {
        weatherIcon.setAttribute("src", "img/weather/rain.png");    
    }
    else if (weatherID < 611) {
        weatherIcon.setAttribute("src", "img/weather/snow.png");    
    }
    else if (weatherID < 700) {
        weatherIcon.setAttribute("src", "img/weather/mix.png");
    }
    else if (weatherID == 741) {
        if (daytime) {
            weatherIcon.setAttribute("src", "img/weather/fog-day.png");  
        }
        else {
            weatherIcon.setAttribute("src", "img/weather/fog-night.png");  
        }
    }
    else if (weatherID < 800) {
        weatherIcon.setAttribute("src", "img/weather/dust.png");  
    }
    else if (weatherID == 800) {
        if (daytime) {
            weatherIcon.setAttribute("src", "img/weather/sun.png");    
        }
        else {
            weatherIcon.setAttribute("src", "img/weather/moon.png");    
        }
    }
    else if (weatherID == 801 || weatherID == 802) {
        if (daytime) {
            weatherIcon.setAttribute("src", "img/weather/partly-day.png");    
        }
        else {
            weatherIcon.setAttribute("src", "img/weather/partly-night.png");    
        }
    }
    else if (weatherID == 803 || weatherID == 804) {
        weatherIcon.setAttribute("src", "img/weather/clouds.png");    
    }
    else {
        console.log('i guess they added more...')
    }
    return weatherIcon;
}

function setCal() {
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.open("GET", 'cal/events.json', true);
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status == "200") {
            document.getElementById("cal").innerHTML = "";
            var json = JSON.parse(request.response);
            var keys = Object.keys(json);
            var today = new Date(new Date().toLocaleDateString());
            var tomorrow = new Date(new Date().toLocaleDateString());
            tomorrow.setDate(today.getDate()+1);
            console.log();
            var currentDay = new Date(1984);
            var str = "";
            for (var i = 0; i < keys.length; i++) {
                var eventDate;
                var key = keys[i];
                if (json[key]['start'].hasOwnProperty("date")) {
                    eventDate = new Date(json[key]['start']['date']);
                    eventDate.setTime(eventDate.getTime() + eventDate.getTimezoneOffset()*60*1000);
                }
                else {
                    eventDate = new Date(json[key]['start']['dateTime']);
                    eventDate = new Date(eventDate.toLocaleDateString());
                    eventDate.setTime(eventDate.getTime() + eventDate.getTimezoneOffset()*60*1000);
                }

                if (eventDate.toLocaleDateString() == currentDay.toLocaleDateString()) {
                    var meridian = "AM";
                    var time = new Date(json[key]['start']['dateTime']);
                    var hour = time.getHours();
                    if (hour > 12) {
                        hour -= 12;
                        meridian = "PM";
                    }
                    var minute = ("00" + time.getMinutes()).substr(-2);            
                    str += '<div class="calEvent">' + hour + ':' + minute + meridian + ' ' + json[key]['summary'] + "</div>";
                }
                else {
                    document.getElementById("cal").innerHTML += str;
                    currentDay = eventDate;
                    var oneDay = 24*60*60*1000;
                    if (Math.round(Math.abs((today.getTime() - eventDate.getTime())/(oneDay))) < 7) {
                        var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        if (eventDate.toLocaleDateString() == today.toLocaleDateString()) {
                            str = '<br><span class="calDay">Today:</span><br>';
                        }
                        else if (eventDate.toLocaleDateString() == tomorrow.toLocaleDateString()) {
                            str = '<br><span class="calDay">Tomorrow:</span><br>';
                        }
                        else {
                            str = '<br><span class="calDay">' + days[eventDate.getDay()] + ":</span><br>";
                        }
                    }
                    else {
                        str =  '<br><span class="calDay">' + eventDate.toLocaleDateString() + ":</span><br>";
                    }
                    var meridian = "AM";
                    var time = new Date(json[key]['start']['dateTime']);
                    var hour = time.getHours();
                    if (hour > 12) {
                        hour -= 12;
                        meridian = "PM";
                    }
                    var minute = ("00" + time.getMinutes()).substr(-2);            
                    str += '<div class="calEvent">' + hour + ':' + minute + meridian + ' ' + json[key]['summary'] + "</div>";
                }
            }
            document.getElementById("cal").innerHTML += str;
        }
    }
    request.send(null);

    // Call again at midnight next day
    var now = new Date();
    var msTillTmrw = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999) - now + 5001; // 5 seconds after midnight
    setTimeout(setCal, msTillTmrw);
}

function setReddit() {
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    request.open("GET", 'https://www.reddit.com/r/all.json', true);
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status == "200") {
            var json = JSON.parse(request.response);
            document.getElementById("reddit").innerHTML += "";
            for (var i = 0; i < 10; i++) {
                var post = json["data"]["children"][i]["data"];
                if (post["thumbnail"] != "self") {
                    if (checkURL(post["url"])) {
                        var thumbnail = document.createElement("img");
                        thumbnail.setAttribute("class", "reddit-thumbnail");
                        thumbnail.setAttribute("src", post["url"]);
                        document.getElementById("reddit").appendChild(thumbnail);
                    }
                    else if (checkURL(post["thumbnail"])) {
                        var thumbnail = document.createElement("img");
                        thumbnail.setAttribute("class", "reddit-thumbnail");
                        thumbnail.setAttribute("src", post["thumbnail"]);
                        document.getElementById("reddit").appendChild(thumbnail);
                    }
                }
                document.getElementById("reddit").innerHTML += post["title"] + "<br>";
            }
        }
    }
    request.send(null);
}

function checkURL(url) {
    var arr = ["jpeg", "jpg", "gif", "png"];
    var ext = url.substring(url.lastIndexOf(".")+1);
    if (arr.includes(ext)) {
        return true;
    }
    return false;
}

function setWord() {
    var request = new XMLHttpRequest();
    request.overrideMimeType("application/json");
    var key = ""; // Hide
    request.open("GET", 'http://api.wordnik.com/v4/words.json/wordOfTheDay?api_key=' + key, true);
    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status == "200") {
            var json = JSON.parse(request.response);
            document.getElementById("word").innerHTML = json["word"]; 
            document.getElementById("def").innerHTML = json["definitions"][0]["text"];

        }
    }
    request.send(null);

    // Call again at midnight next day
    var now = new Date();
    var msTillTmrw = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999) - now + 5001; // 5 seconds after midnight
    setTimeout(setWord, msTillTmrw);
}

function setTwitch() {
    const clientID = ''; // hide
    const userID = ''; // hide

    getAllStreamIDs(userID, clientID).then((data) => {
        getAllStreams(clientID, data.streams).then((data) => {
            var streams = data.streams;
            if (streams.length > 0) {
                streams.sort(function(a,b) {return (a.viewer_count < b.viewer_count) ? 1 : ((b.viewer_count < a.viewer_count) ? -1 : 0);} );
                str = '';
                for (let i = 0; i < streams.length -1 && i < 5; i++) {
                    stream = streams[i];
                    str += '<span style="float: left; padding-left: 25%;">' + streams[i].user_name + '</span> ' + streams[i].viewer_count + '<br>';
                }
                document.getElementById('twitchContent').innerHTML = str;
            }

        });
    });
}

function getAllStreamIDs(userID, clientID, streams=[], pagination=undefined) {
    return new Promise((resolve, reject) => {
        getStreamIDBatch(userID, clientID, pagination).then((data) => {
            if (data.streams.length > 0) {
                streams.push(data.streams);
            }
            if (data.pagination) {
                resolve(getAllStreamIDs(userID, clientID, streams, data.pagination));
            }
            else {
                resolve({ streams: streams });
            }
        });
    });
}

function getStreamIDBatch(userID, clientID, pagination=undefined) {
    return new Promise((resolve, reject) => {
        streams = [];
        var request = new XMLHttpRequest();
        url = "https://api.twitch.tv/helix/users/follows?first=100&from_id=" + userID;
        if (pagination) {
            url += '&after=' + pagination;
        }
        request.open("GET", url);
        request.setRequestHeader('Client-ID', clientID);
        request.onload = function () {
            if (this.readyState === this.DONE) {
                if (this.status >= 200 && this.status < 300) {
                    var json = JSON.parse(this.response);
                    for (var i = 0; i < json.data.length; i++) {
                        streams.push(json.data[i].to_id);
                    }
                    resolve({ 
                        pagination: json.pagination.cursor,
                        streams: streams
                    });
                } 
                else {
                    console.log(request);
                    resolve();
                }
            }
        };
        request.onerror = function () {
            console.log(request);
            resolve();
        };
        request.send();
    })
}

function getAllStreams(clientID, streamIDs) {
    return new Promise((resolve, reject) => {
        streams = []
        streamIDs.forEach((batch, index, array) => {
            getStreamBatch(clientID, batch).then((data) => {
                if (data.streams.length > 0) {
                    streams.concat(data.streams);
                }
                if (index == array.length - 1) {
                    resolve({streams: streams});
                }
            });
        });
    });
}

function getStreamBatch(clientID, streamIDs) {
    return new Promise((resolve, reject) => {
        streams = []
        var request= new XMLHttpRequest();
        url = "https://api.twitch.tv/helix/streams?first=100&user_id=" + streamIDs.join('&user_id=');
        request.open("GET", url);
        request.setRequestHeader('Client-ID', clientID);
        request.onload = function () {
            if (this.readyState === this.DONE) {
                if (this.status >= 200 && this.status < 300) {
                    var json = JSON.parse(this.response);
                    for (var i = 0; i < json.data.length; i++){
                        streams.push(json.data[i]);
                    }
                    resolve({streams: streams})
                } 
                else {
                    console.log(request);
                }
            }
        };
        request.onerror = function () {
            console.log(request);
            return request;
        };
        request.send();   
    });   
}
