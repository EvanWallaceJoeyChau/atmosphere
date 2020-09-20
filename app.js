
const atmo = {};

atmo.unsplashKey = "-yn3TSnS8fmd6m_Vl4i8pkMpz30rD3AFYZo23CGCKLE";
atmo.weatherKey = "76e02199a8d1ef08e9d324471a472dc3";
atmo.geolocationKey = "59b86ae070e3453fb8d4ec8e88f4d2b4";

// capitalize the first letter of a string
atmo.capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

atmo.getLocation = (query) => {
    return $.ajax({
        url: "https://api.opencagedata.com/geocode/v1/json",
        method: "GET",
        dataType: "json",
        data: {
            key: atmo.geolocationKey,
            q: query
        }
    })
}

atmo.getWeather = (lat, lng) => {
    return $.ajax({
        url: "http://api.openweathermap.org/data/2.5/weather",
        method: "GET",
        dataType: "json",
        data: {
            appid: atmo.weatherKey,
            lat: lat,
            lon: lng
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

atmo.revealBg = (data) => {
    // randomize image returned from Unsplash
    const randomIndex = Math.floor(Math.random() * data.results.length);
    const image = data.results[randomIndex];
    const url = image.urls.regular;

    // set css before overlay is hidden
    $("body").css({
        "background-image": `url(${url})`,
        "color": image.color,
    })
    $("h1").css({
        "font-size": "2.5rem",
    })

    // add description of bg image for screen readers
    const description = `<span class="srOnly">${image.alt_description}</span>`;
    $('main').append(description);

    // hide overlay to reveal the background
    atmo.setState("workspace");
}

// define which components are visible at each app state
atmo.states = {
    welcome: {
        overlay: true,
        presetInputBtn: true,
        presetInputContainer: false,
        locationInputBtn: true,
        locationInputContainer: false,
        sidebar: false,
        weatherInfo: false,
    },
    inputLocation: {
        overlay: true,
        presetInputBtn: false,
        presetInputContainer: false,
        locationInputBtn: false,
        locationInputContainer: true,
        locationInputSubmit: true,
        sidebar: false,
        weatherInfo: false,
    },
    inputPreset: {
        overlay: true,
        presetInputBtn: false,
        presetInputContainer: true,
        locationInputBtn: false,
        locationInputContainer: false,
        locationInputSubmit: false,
        sidebar: false,
        weatherInfo: false,
    },
    workspace: {
        overlay: false,
        presetInputBtn: false,
        presetInputContainer: false,
        locationInputBtn: false,
        locationInputContainer: false,
        locationInputSubmit: false,
        sidebar: true,
        weatherInfo: true,
    }
}

// set the state of the app by hiding/showing app components
atmo.setState = (stateName) => {
    // assemble all components whose visibility must be changed
    const components = atmo.states[stateName];
    const keys = Object.keys(components);

    // set the visibility of each compoennt's DOM node according to the boolean value
    keys.forEach((key) => {
        const node = $(`#${key}`);
        if (components[key]) {
            node.removeClass('hidden');
        } else {
            node.addClass('hidden');
        }
    });
};

atmo.createWeatherDisplay = (weatherData) => {
    // create HTML string for weather icon
    const iconCode = weatherData.weather[0].icon;
    const description = weatherData.weather[0].description;
    const icon = `<img src="./assets/white/${iconCode}.png" alt="${description}">`;

    // create HTML string for weather text
    const temperature = Math.round(weatherData.main.temp - 273);
    const text = `<p id="tempMsg" class="temp">${temperature}&#176;C</p>`;

    // add elements to their container
    $("#weatherInfo").append(icon, text);
};

atmo.init = () => {
    // when user clicks on "Location" button, make location input form appear
    $("#locationInputBtn").on("click", () => { atmo.setState("inputLocation") });

    // when user clicks on "preset" button, make preset dropdown menu form appear
    $("#presetInputBtn").on("click", () => { atmo.setState("inputPreset") });

    // when user enters a location, pass location into getWeather
    $("#location").on("submit", function (e) {
        e.preventDefault();
        let userLocation = $("#locationInputText");
        const userCity = userLocation.val();
        $("#errMsg").empty();

        // request information about user's location from geolocation API
        // TODO: handle errors for all APIs
        atmo.getLocation(userCity)
            .then((res) => {
                // extract data from location response
                const country = res.results[0].components.country;
                const lat = res.results[0].geometry.lat;
                const lng = res.results[0].geometry.lng;

                // request weather from weather API
                const weatherResponse = atmo.getWeather(lat, lng);

                // when weather response arrives, request background image from photo API
                const imageResponse = weatherResponse.then((weatherData) => {
                    atmo.createWeatherDisplay(weatherData) 
                    return atmo.getBg(`${weatherData.weather[0].description} ${country}`);
                })

                // return a Promise for the response holding the image data
                return imageResponse;
            })

            // set background image when the response arrives
            .then((res) => atmo.revealBg(res));
            // .fail(err => {
            //     let errMsg;
            //     if (err.status === 400) errMsg = "Please enter a city";
            //     else if (err.status === 404) errMsg = "Could not find " + atmo.capitalize(userCity) + ". Please try again.";
            //     $("#errMsg").text(errMsg)
            // })

        // clear the input text so box is empty on refresh
        userLocation.val("");
    });

    // when user chooses a preset, pass value to Unsplash API
    $("#preset").on("change", function (e) {
        e.preventDefault();
        const preset = $("#presetInputMenu").val();
        atmo.getBg(preset)
            .then(res => atmo.revealBg(res));
    });

    // when user clicks shuffle icon, choose a random background using presets
    $("#shuffleIcon").on("click", () => {
        const optionArray = $("option").toArray();
        optionArray.shift();
        const presets = optionArray.map(el => el.value);
        const random = Math.floor(Math.random() * presets.length);
        atmo.getBg(presets[random])
            .then(res => atmo.revealBg(res));
    })

    // TODO: clean this up and have both input forms appear; use toggleClass?
    $("#restartIcon").on("click", () => {
        atmo.setState("welcome");

        // remove weather Info
        $("#weatherInfo").empty();

        // revert the dynamic style changes made by jQuery
        $('body, h1').removeAttr("style");
    })

}

$(function () {
    atmo.init();
})