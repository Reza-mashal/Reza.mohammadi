const cityInput =
    document.getElementById("cityInput");


// ========================================
// جستجوی آب و هوا
// فارسی + انگلیسی
// ========================================

async function searchWeather() {

    const city =
        cityInput.value.trim();

    if (city === "") {

        alert("لطفاً نام شهر را وارد کنید.");

        return;
    }


    try {

        // ========================================
        // 1. پیدا کردن مختصات شهر
        // ========================================

        const locationURL =
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=fa&format=json`;


        const locationResponse =
            await fetch(locationURL);


        if (!locationResponse.ok) {

            throw new Error(
                "خطا در اتصال به سرور"
            );
        }


        const locationData =
            await locationResponse.json();


        if (
            !locationData.results ||
            locationData.results.length === 0
        ) {

            alert(
                "این شهر پیدا نشد. لطفاً نام شهر را درست وارد کنید."
            );

            return;
        }


        // ========================================
        // پیدا کردن بهترین نتیجه
        // ========================================

        let location =
            locationData.results[0];


        // اگر کشور افغانستان باشد، نتیجه افغانستان را ترجیح بده
        const afghanistan =
            locationData.results.find(
                item =>
                    item.country_code === "AF"
            );


        if (afghanistan) {

            location = afghanistan;
        }


        const latitude =
            location.latitude;

        const longitude =
            location.longitude;


        // ========================================
        // 2. دریافت آب و هوا
        // ========================================

        const weatherURL =
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=6`;


        const weatherResponse =
            await fetch(weatherURL);


        if (!weatherResponse.ok) {

            throw new Error(
                "خطا در دریافت اطلاعات آب و هوا"
            );
        }


        const data =
            await weatherResponse.json();


        // ========================================
        // 3. معلومات فعلی
        // ========================================

        const current =
            data.current;


        const temperature =
            Math.round(
                current.temperature_2m
            );


        const humidity =
            Math.round(
                current.relative_humidity_2m
            );


        const wind =
            Math.round(
                current.wind_speed_10m
            );


        const weatherCode =
            current.weather_code;


        // ========================================
        // 4. وضعیت هوا
        // ========================================

        const weatherInfo =
            getWeatherInfo(weatherCode);


        // ========================================
        // 5. نمایش معلومات
        // ========================================

        document.getElementById("city")
            .innerText =
            getCityName(location);


        document.getElementById("temp")
            .innerText =
            `${temperature}°C`;


        document.getElementById("condition")
            .innerText =
            weatherInfo.text;


        document.getElementById("icon")
            .innerText =
            weatherInfo.icon;


        document.getElementById("humidity")
            .innerText =
            `${humidity}%`;


        document.getElementById("humidity2")
            .innerText =
            `${humidity}%`;


        document.getElementById("wind")
            .innerText =
            `${wind} km/h`;


        document.getElementById("wind2")
            .innerText =
            `${wind} km/h`;


        // ========================================
        // بیشترین و کمترین دمای امروز
        // ========================================

        document.getElementById("high")
            .innerText =
            `${Math.round(
                data.daily.temperature_2m_max[0]
            )}°C`;


        document.getElementById("low")
            .innerText =
            `${Math.round(
                data.daily.temperature_2m_min[0]
            )}°C`;


        // ========================================
        // تاریخ
        // ========================================

        showDate();


        // ========================================
        // پیش‌بینی پنج روزه
        // ========================================

        showForecast(data.daily);

    }

    catch (error) {

        console.error(error);

        alert(
            "خطا در دریافت اطلاعات هوا. لطفاً اینترنت خود را بررسی کنید."
        );
    }
}


// ========================================
// نام شهر
// ========================================

function getCityName(location) {

    // نام فارسی اگر موجود باشد
    if (location.name) {

        return location.name;
    }

    return "شهر";
}


// ========================================
// تبدیل Weather Code به وضعیت هوا
// ========================================

function getWeatherInfo(code) {

    // آسمان صاف
    if (code === 0) {

        return {
            text: "آسمان صاف",
            icon: "☀️"
        };
    }


    // کمی ابری
    if (
        code === 1 ||
        code === 2
    ) {

        return {
            text: "کمی ابری",
            icon: "🌤️"
        };
    }


    // ابری
    if (code === 3) {

        return {
            text: "ابری",
            icon: "☁️"
        };
    }


    // مه
    if (
        code >= 45 &&
        code <= 48
    ) {

        return {
            text: "مه‌آلود",
            icon: "🌫️"
        };
    }


    // باران
    if (
        code >= 51 &&
        code <= 67
    ) {

        return {
            text: "بارانی",
            icon: "🌧️"
        };
    }


    // برف
    if (
        code >= 71 &&
        code <= 77
    ) {

        return {
            text: "برفی",
            icon: "❄️"
        };
    }


    // رگبار
    if (
        code >= 80 &&
        code <= 82
    ) {

        return {
            text: "رگبار باران",
            icon: "🌦️"
        };
    }


    // طوفان
    if (code >= 95) {

        return {
            text: "رعد و برق",
            icon: "⛈️"
        };
    }


    return {
        text: "وضعیت هوا",
        icon: "🌤️"
    };
}


// ========================================
// نمایش تاریخ
// ========================================

function showDate() {

    const today =
        new Date();


    const options = {

        weekday: "long",

        year: "numeric",

        day: "numeric",

        month: "long"

    };


    document.getElementById("date")
        .innerText =
        today.toLocaleDateString(
            "fa-AF",
            options
        );
}


// ========================================
// نمایش Forecast پنج روزه
// ========================================

function showForecast(daily) {

    const days =
        document.querySelectorAll(".day");


    const weekDays = [

        "یکشنبه",

        "دوشنبه",

        "سه‌شنبه",

        "چهارشنبه",

        "پنجشنبه",

        "جمعه",

        "شنبه"

    ];


    for (
        let i = 0;
        i < 5;
        i++
    ) {

        const date =
            new Date(
                daily.time[i + 1]
            );


        const dayName =
            weekDays[
                date.getDay()
            ];


        const weatherCode =
            daily.weather_code[i + 1];


        const weather =
            getWeatherInfo(
                weatherCode
            );


        const high =
            Math.round(
                daily.temperature_2m_max[
                    i + 1
                ]
            );


        const low =
            Math.round(
                daily.temperature_2m_min[
                    i + 1
                ]
            );


        days[i]
            .querySelector("b")
            .innerText =
            dayName;


        days[i]
            .querySelector("span")
            .innerText =
            weather.icon;


        days[i]
            .querySelector("strong")
            .innerText =
            `${high}° ${low}°`;
    }
}


// ========================================
// وقتی صفحه باز می‌شود
// ========================================

window.addEventListener(
    "load",
    function () {

        cityInput.value =
            "کابل";

        searchWeather();
    }
);


// ========================================
// جستجو با Enter
// ========================================

cityInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            searchWeather();
        }
    }
);
