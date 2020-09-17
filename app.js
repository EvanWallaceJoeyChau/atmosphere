
const atmo = {};

atmo.unsplashKey = "-yn3TSnS8fmd6m_Vl4i8pkMpz30rD3AFYZo23CGCKLE";
atmo.weatherKey = "76e02199a8d1ef08e9d324471a472dc3";

atmo.getWeather = (query) => {
    return $.ajax({
        url: "http://api.openweathermap.org/data/2.5/weather",
        method: "GET",
        dataType: "json",
        data: {
            appid: atmo.weatherKey,
            q: query
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

atmo.showLocationInput = function () {
    $("#presetInputBtn").hide();
    $("#locationInputText").show();
    $("#locationInputSubmit").show();
    $(this).hide();
}

atmo.showPresetInput = function () {
    $("#locationInputBtn").hide();
    $("#presetInputMenu").show();
    $(this).hide();
}

atmo.hideOverlay = () => {
    $('.userInput').hide();
    $('.overlay').hide();
}

atmo.init = () => {
    // when user clicks on "Location" button, make location input form appear
    $("#locationInputBtn").on("click", atmo.showLocationInput);

    // when user clicks on "preset" button, make preset dropdown menu form appear
    $("#presetInputBtn").on("click", atmo.showPresetInput);

    // when user enters a location, pass location into getWeather
    $("#location").on("submit", function (e) {
        e.preventDefault();
        const userLocation = $("#locationInputText").val();
        atmo.getWeather(userLocation)
            .then(weatherData => weatherData.weather[0].description)
            .then(description => atmo.getBg(description))
            .then(imgData => {
                const url = imgData.results[0].urls.regular;
                atmo.setBg(url);
            })
            .then(() => atmo.hideOverlay());
    });
}

$(function () {
    atmo.init();
})