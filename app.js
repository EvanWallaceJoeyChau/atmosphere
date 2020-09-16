
const atmo = {};

atmo.unsplashKey = "-yn3TSnS8fmd6m_Vl4i8pkMpz30rD3AFYZo23CGCKLE";
atmo.weatherKey = "76e02199a8d1ef08e9d324471a472dc3";

atmo.getWeather = () => {
    return $.ajax({
        url: "http://api.openweathermap.org/data/2.5/weather",
        method: "GET",
        dataType: "json",
        data: {
            appid: atmo.weatherKey,
            q: "toronto"
        }
    })
}

atmo.getBg = (query) => {
    return $.ajax({
        url: "https://api.unsplash.com/search/photos/",
        method: "GET",
        dataType: "json",
        data: {
            client_id: atmo.unsplashKey,
            orientation: "landscape",
            query: query
        }
    });
}

atmo.setBg = (imgURL) => {
    $("body").css({
        "background-image": `url(${imgURL})`
    })
}

atmo.init = () => {
    atmo.getWeather()
        .then(weatherData => weatherData.weather[0].description)
        .then(description => atmo.getBg(description))
        .then(imgData => {
            const url = imgData.results[0].urls.regular;
            atmo.setBg(url);
        });
}

$(function () {
    atmo.init();
})