
const atmo = {};

atmo.unsplashKey = "-yn3TSnS8fmd6m_Vl4i8pkMpz30rD3AFYZo23CGCKLE";
atmo.weatherKey = "76e02199a8d1ef08e9d324471a472dc3";

// capitalize the first letter of a string
atmo.capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

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
        presetInputMenu: false,
        locationInputBtn: true,
        locationInputText: false,
        sidebar: false,
    },
    inputLocation: {
        overlay: true,
        presetInputBtn: false,
        presetInputMenu: false,
        locationInputBtn: false,
        locationInputText: true,
        locationInputSubmit: true,
        sidebar: false,
    },
    inputPreset: {
        overlay: true,
        presetInputBtn: false,
        presetInputMenu: true,
        locationInputBtn: false,
        locationInputText: false,
        locationInputSubmit: false,
        sidebar: false,
    },
    workspace: {
        overlay: false,
        presetInputBtn: false,
        presetInputMenu: false,
        locationInputBtn: false,
        locationInputText: false,
        locationInputSubmit: false,
        sidebar: true,
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
        atmo.getWeather(userCity)
            .fail(err => {
                let errMsg;
                if (err.status === 400) errMsg = "Please enter a city";
                else if (err.status === 404) errMsg = "Could not find " + atmo.capitalize(userCity) + ". Please try again.";
                $("#errMsg").text(errMsg)
            })
            .then(weatherData => weatherData.weather[0].description)
            .then(description => atmo.getBg(description))
            .then(res => atmo.revealBg(res));

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

        // revert the dynamic style changes made by jQuery
        $('body, h1').removeAttr("style");
    })

}

$(function () {
    atmo.init();
})