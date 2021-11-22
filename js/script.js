$(function () {
    // localStorage.setItem("existingUser", 0);

    //hide main app if new user by default
    $(".main").css("display", "none");

    //Check if new user
    var existingUser = localStorage.getItem("existingUser");
    if (existingUser == 1) {
        runCode();
    } else {
        // CREATE ARRAY FOR FAVOURITE ITEMS
        var favourites = [];
        // STRINGIFY ARRAY TO STORE INTO LOCALSTORAGE
        localStorage.setItem('favourites', JSON.stringify(favourites));
        // SET DARK MODE STATE INTO LOCALSTORAGE
        localStorage.setItem('darkMode', 0);
        //CODE IF ITS A NEW USER (Show onboarding)
        $(".onboarding").css("display", "block");
        showFrame(1);
    }

    // ONBOARDING SWIPE DETECTIONS
    var onboarding = document.getElementById("frame1");
    var hammertime = new Hammer(onboarding);
    hammertime.on('swipeleft', function (ev) {
        $(".dot").addClass("dot2");
        $(".frame2").css("background-color", "white");
        $(".swipeArrow").css("opacity", "0");
        showFrame(2);
    });

    onboarding = document.getElementById("frame2");
    hammertime = new Hammer(onboarding);
    hammertime.on('swiperight', function (ev) {
        $(".dot").removeClass("dot2");
        $(".frame2").css("background-color", "#358cef");
        $(".swipeArrow").css("opacity", "1");
        showFrame(1);
    });
    hammertime.on('swipeleft', function (ev) {
        $(".dot").addClass("dot3");
        $(".frame3").css("background-color", "white");
        showFrame(3);
    });

    onboarding = document.getElementById("frame3");
    hammertime = new Hammer(onboarding);
    hammertime.on('swiperight', function (ev) {
        $(".dot").removeClass("dot3");
        $(".frame3").css("background-color", "#efc235");
        showFrame(2);
    });

    //INFO CARD DRAG UP
    var infoCard = document.getElementById('infoCard');
    var mc = new Hammer(infoCard);
    //enable all directions
    mc.get('swipe').set({
        direction: Hammer.DIRECTION_ALL,
        threshold: 1,
        velocity: 0.1
    });
    // SWIPE UP TO SHOW CARD
    mc.on("swipeup", function (ev) {
        // myElement.textContent = ev.type + " gesture detected.";
        $(".infoCard").addClass("infoCardUP");
    });
    // SWIPE DOWN TO HIDE CARD
    mc.on("swipedown", function (ev) {
        // myElement.textContent = ev.type + " gesture detected.";
        $(".infoCard").removeClass("infoCardUP");
    });

    //FRAME MANAGER TO HANDLE ONBOARDING
    function showFrame(frameID) {
        console.log("Showing Frame " + frameID);
        //CONDITIONAL EVENTS
        switch (frameID) {
            case 1:
                // DO THIS IF SHOWING FRAME 1 \/
                $(".frame" + (frameID)).removeClass("frames_anim");
                $(".frame" + (frameID)).addClass("frame1_peakAnim");
                break;
            case 2:
                // DO THIS IF SHOWING FRAME 2 \/
                $(".frame" + (frameID - 1)).removeClass("frame1_peakAnim");
                setTimeout(() => {
                    $(".frame" + (frameID - 1)).addClass("frames_anim");
                }, 10);
                $(".frame" + (frameID)).removeClass("frames_anim");
                break;
            case 3:
                // DO THIS IF SHOWING FRAME 3 \/
                $(".frame" + (frameID - 1)).addClass("frames_anim");
                $(".start").css("display", "block");
                break;

            default:
                // DO THIS IF NONE OF THE CONDITIONS NEEDED \/
                console.log("FRAME MANAGER ERROR");
        }
    }

    //DEBUG & CODE TO SET TO EXISTING USER
    $(".start").click(function () {
        // RUN MAIN FUNCTIONALITY CODE
        runCode();
    });

    //MAIN CODE
    function runCode() {
        // SET USER AS EXISTING USER
        localStorage.setItem("existingUser", 1);
        // SHOW MAIN CODE ON LOAD
        $(".main").css("display", "block");
        // HIDE ONBOARDING ON LOAD
        $(".onboarding").css("display", "none");
        console.log("Started app and set as existing user");

        // GLOBAL VARIABLES
        var lat;
        var lon;
        var mymap;

        //GET USERS LOCATION
        getLocation();

        function getLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(showPosition);
            } else {
                alert("Geolocation is not supported by this browser.");
            }
        }

        function showPosition(position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            console.log("USER LOCATION: " + lat, lon);
            // CALL MAIN FUNCTION AND PARSE USER LOCATION
            taxi(lat, lon);
            // SET EMBEDDED iFRAME MAP TO USERS LOCATION BY DEFAULT
            $("#eMap").attr("src", `https://maps.google.com/maps?q=` + lat + `,` + lon + `&z=15&output=embed`);
            // CALL GEOCODE FUNCTION TO REVERSE GEO CODE USERS LOCATION 
            geocode();
        }

        // SEARCH FEATURE
        // SET LOCATION TO "LOADING" BY DEFAULT
        $("#search").attr("value", "LOADING");
        // SET TAXI COUNT TO "LOADING" BY DEFAULT
        $("#taxis").html(`<p><span>LOADING</span></p>`);

        $(".searchIcon").click(function () {
            // GET DATA TO SEARCH
            var searchInput;
            searchInput = document.getElementById("search").value.trim();
            // CALL FUNCTION TO SEARCH AND PARSE SEARCH DATA
            search(searchInput);
        });


        // FUNCTION TO SEARCH LOCATION
        function search(searchInput) {
            // CHANGE FAVOURITE BUTTON TO OUTLINE
            $(".addToFav").attr("name", "star-outline");
            // UNFOCUS SEARCH BOX
            $("#search").blur();
            var search;
            // CHECK IF SEARCH INPUT IS NUMBERS(POSTAL CODE)
            if (isNaN(searchInput)) {
                // IF SEARCH INPUT HAS LETTERS ADD KEYWORD "SINGAPORE" TO SEARCH RESULT FOR ACCURACY
                search = searchInput + " singapore"
                console.log(search);
            } else {
                search = searchInput;
                console.log(search);
            }

            // GEOCODING API 
            $.get("https://geocode.xyz?json=1&locate=" + search, function (data, status, xhr) {
                console.log(xhr.status);
                // IF STATUS IS 200(SUCCESS) SET MAP VIEW TO SEARCHED LOCATION
                if (xhr.status = 200) {
                    console.log("searching");
                    mymap.setView([data.latt, data.longt], 17);
                } else {
                    // IF ERROR RESUBMIT SEARCH TERM (DO THIS BECAUSE API IS UNSTABLE AND NEEDS TO SUBMIT SEARCH QUERY TWICE)
                    console.log("ERROR");
                    // INVOKE SEARCH FUNCTION AGAIN
                    document.getElementById("searchIcon").click();

                }
            }).fail(function () {
                // IF ERROR RESUBMIT SEARCH TERM (DO THIS BECAUSE API IS UNSTABLE AND NEEDS TO SUBMIT SEARCH QUERY TWICE)
                console.log("ERROR");
                // INVOKE SEARCH FUNCTION AGAIN
                document.getElementById("searchIcon").click();
            })
        }

        //PRESS ENTER TO SEARCH
        // STORE SEARCH FIELD INTO A VARIABLE
        var input = document.getElementById("search");

        // Execute a function when the user releases a key on the keyboard
        input.addEventListener("keyup", function (event) {
            // Number 13 is the "Enter" key on the keyboard
            if (event.keyCode === 13) {
                // Cancel the default action, if needed
                event.preventDefault();
                // Trigger the button element with a click
                document.getElementById("searchIcon").click();
            }
        });

        // FAVOURITE FEATURE
        // DETECT ADD TO FAV CLICK
        $("#addToFav").click(function () {
            // CHANGE STAR ICON TO FILLED
            $(".addToFav").attr("name", "star");
            // GET SEARCHED VALUE, TRIM IT AND STORE DATA INTO A VARIABLE
            var areaName = document.getElementById("search").value.trim();
            // CALL FUNCTION TO ADD TO FAVOURITES AND PARSE DATA
            addToFav(areaName);
        });
        // DETECT FAVOURITES LIST BUTTON
        $(".fav_btn").click(function () {
            // SHOW FAVOURITES LIST
            $(".favCard").addClass("favCard_active");
        });

        // HAMMER.JS FOR FAVOURITES LIST SWIPE GESTURE
        var favCardSwipe = document.getElementById("favCard");
        var hammertime = new Hammer(favCardSwipe);
        hammertime.on('swiperight', function (ev) {
            // HIDE FAVOURITES LIST
            $(".favCard").removeClass("favCard_active");
        });
        // FUNCTION TO ADD TO FAVOURITES
        function addToFav(data) {
            // CREATE ARRAY FOR FAVOURITE ITEMS
            var favourites = [];
            // CONVERT LOCALSTORAGE ARRAY TO JAVASCRIPT OBJECT
            favourites = JSON.parse(localStorage.getItem('favourites')) || [];
            // CHECK OF DATA EXISTS IN ARRAY
            if (favourites.indexOf(data) !== -1) {
                alert("You already saved this location");
            } else if (data == "") {
                alert("Please enter a location")
            } else {
                console.log(data + " Added To Favourites");
                // PUSH THE DATA INTO THE ARRAY
                favourites.push(data);
                // CLEAR THE FAVOURITES LIST
                $(".favList").html(``);
                //POPULATE THE FAVOURITES LIST WITH DATA FROM LOCAL STORAGE ARRAY
                for (i = 0; i < favourites.length; i++) {
                    $(".favList").append(`<li class="favLI">${favourites[i]}</li>`);
                }
                // CONVERT ARRAY BACK INTO A STRING AND STORE BACK INTO LOCAL STORAGE
                localStorage.setItem('favourites', JSON.stringify(favourites));
                //NEED TO BIND EVENT LISTENER AGAIN BECAUSE .html(``) DESTROYS EVENT LISTENERS 
                $(".favLI").on("click", searchFav);
            }
        }
        // CONVERT LOCAL STORAGE ARRAY TO JAVASCRIPT OBJECT AND STORE INTO VARIABLE
        var favourites = JSON.parse(localStorage.getItem('favourites'));
        // CHECK IF THERE ARE NO FAVOURITES IN LOCAL STORAGE ARRAY
        if (favourites.length == 0) {
            $(".favList").html(`<p>No Favourites Yet</p>`);
        } else {
            console.log(favourites.length);
            for (i = 0; i < favourites.length; i++) {
                //POPULATE THE FAVOURITES LIST WITH DATA FROM LOCAL STORAGE ARRAY
                $(".favList").append(`<li class="favLI">${favourites[i]}</li>`);
            }
        }
        // EVENT LISTENER FOR FAVOURITE LIST ITEM
        $(".favLI").on("click", searchFav);
        // FUNCTION FOR FAVOURITE LIST ITEM
        function searchFav() {
            // STORE CLICKED LIST TEXT VALUE DATA INTO VARIABLE
            var element = $(this).text();
            console.log("TEST" + element);
            // CHANGE SEARCH INPUT ATTRIBUTE TO DATA
            $("#search").attr("value", element);
            $(".favCard").removeClass("favCard_active");
            // CALL FUNCTION TO SEARCH AND PARSE DATA
            search(element);
        }
        // FUNCTION TO REVERSE GEOCODE USERS LOCATION
        function geocode() {
            $.ajax({
                    type: "GET",
                    //file name or URL here
                    url: "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat + "&longitude=" + lon + "&localityLanguage=en",
                    dataType: "json"
                })
                .done(function (json) {
                    console.log(json)
                    console.log("Geocode successfully loaded");
                    // CHANGE SEARCH FIELD VALUE TO USERS LOCATION ON JSON LOAD
                    $("#search").attr("value", json.locality.replace("GRC", "").replace("SMC", ""));
                })
                .fail(function () {
                    console.log("Geocode loading error");
                });
        }
        // MAIN API FUNCTIONALITY
        function taxi(lat, lon) {
            $.ajax({
                    type: "GET",
                    //file name or URL here
                    url: "https://api.data.gov.sg/v1/transport/taxi-availability",
                    dataType: "json"
                })
                .done(function (json) {
                    console.log("successfully loaded");

                    // CHECK USER DARK MODE STATE
                    var darkMode = localStorage.getItem("darkMode");
                    var darkModeState;
                    $(".darkMode_btn").click(function () {
                        // SET DARK MODE STATE INTO LOCALSTORAGE
                        if (darkMode == 1) {
                            // SET APP TO LIGHT MODE
                            localStorage.setItem('darkMode', 0);
                        } else {
                            // SET APP TO DARK MODE
                            localStorage.setItem('darkMode', 1);
                        }
                        // REFRESH PAGE TO UPDATE CHANGES
                        location.reload();
                    });
                    // console.log("DARK MODE STATE IS " + darkMode);
                    // CHECK IF USER SET TO DARK OR LIGHT MODE
                    if (darkMode == 1) {
                        // SET MAP TO DARK
                        darkModeState = "dark-v9"
                        // CHANGE DARKMODE ICON TO MOON
                        $(".darkMode_icon").attr("name", "sunny");
                    } else {
                        // SET MAP TO LIGHT
                        darkModeState = "streets-v11"
                        // CHANGE DARKMODE ICON TO SUN
                        $(".darkMode_icon").attr("name", "moon");
                        $(".infoCard, .darkMode_btn, #topBar, #mapid, .fav_btn, .recenter_btn, .favCard ").addClass("lightMode_main");
                        $("#search, #addToFav").addClass("lightMode_sub");
                    }
                    console.log("DARK MODE STATE IS " + darkModeState);


                    // LEAFLET MAP INITIALIZATION
                    mymap = L.map('mapid').setView([lat, lon], 17);
                    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                        maxZoom: 22,
                        id: 'mapbox/' + darkModeState,
                        tileSize: 512,
                        zoomOffset: -1,
                        accessToken: 'pk.eyJ1IjoidHlhdHlhIiwiYSI6ImNraTJuazdrbDNsazgycGt6emcwMXk3NXAifQ.XWBoJWhy_nPuPmY_Cza23A'
                    }).addTo(mymap);

                    //GET API LAST UPDATED TIME
                    var time = json.features[0].properties.timestamp;
                    var slicedTime = time.slice(11, 19);

                    // STORE JSON INTO VARIABLE
                    var taxisAvailable = json;

                    //USER LOCATION CIRCLE MARKER
                    userLoc = L.circle([lat, lon], {
                        color: 'skyblue',
                        fillColor: 'blue',
                        fillOpacity: 0.7,
                        radius: 15
                    }).addTo(mymap);

                    // USER LOCATION CIRCLE MARKER
                    var popup = L.popup()
                        .setLatLng([lat, lon])
                        .setContent("<p>You are here!</p>")
                        .openOn(mymap);

                    // TAXI CIRCLE MARKER
                    var taxisOrange = {
                        color: 'orange',
                        fillColor: '#FFC419',
                        weight: 5,
                        fillOpacity: 0.5,
                        radius: 15,
                        className: "testtest"
                    };

                    // LEAFLET GEOJSON TO DISPLAY TAXIS ON MAP
                    var taxis = L.geoJSON(taxisAvailable, {
                        pointToLayer: function (feature, latlng) {
                            return L.circleMarker(latlng, taxisOrange);
                        }
                    }).addTo(mymap).on("click", taxiClick);

                    // SET TAXI COUNT TO LOADING 

                    setTimeout(() => {
                        $("#taxis").html(`<p><span>${json.features[0].geometry.coordinates.length}</span> Taxis Available</p>`);
                    }, 10);

                    // DETECT TOUCH INPUT ANYWHERE ON SCREEN
                    window.addEventListener('touchstart', function (ev) {
                        for (var i = 0; i < ev.targetTouches.length; i++) {
                            // CHANGE RECENTER BUTTON COLOUR
                            $(".recenter_btn").removeClass("recenter_btn_active");
                        }
                    }, false);


                    // RECENTER MAP VIEW TO USER LOCATION
                    $(".recenter_btn").click(function () {
                        console.log(lat);
                        console.log(lon);
                        mymap.setView([lat, lon], 17);
                        $(".recenter_btn").addClass("recenter_btn_active");
                    });

                    // SET DEFAULT REDIRECT COORDINATES TO USER COORDINIATES
                    var coord = L.latLng(lat, lon);


                    // GLOBAL VARIABLE FOR USER LOCATION
                    var userLat = lat;
                    var userLon = lon;

                    var distance;
                    // SET DISTANCE TO "distance not found" BY DEFAULT 
                    var distanceUnit = "Distance Not Found";
                    // LEAFLET POP UP WITH DISTANCE UNIT ON CIRCLE CLICK
                    taxis.bindPopup(`<p><span>${distanceUnit}</span></p>`);

                    // CLICK ON TAXI TO REDIRECT TO GOOGLE MAPS FOR DIRECTIONS TO TAXI
                    function taxiClick(e) {
                        coord = e.latlng;
                        var lat = coord.lat;
                        var lon = coord.lng;
                        // SHOW INFOCARD AFTER CLICKING ON TAXI
                        $(".infoCard").addClass("infoCardUP");
                        // UPDATE gMAPS iFRAME WITH SELECTED TAXI COORDINATES
                        $("#eMap").attr("src", `https://maps.google.com/maps?q=` + lat + `,` + lon + `&z=15&output=embed`);
                        // CONVERT USER LOCATION AND TAXI LOCATION TO LEAFLET LATLNG
                        var userLatLon = L.latLng(userLat, userLon);
                        var latlon = L.latLng(lat, lon);
                        // LEAFLET GEOMETRY PLUGIN TO FIND DISTANCE BETWEEN USER AND SELECTED TAXI
                        distance = L.GeometryUtil.distance(mymap, userLatLon, latlon);
                        distanceUnit = L.GeometryUtil.readableDistance(distance, "metric");
                        console.log(distanceUnit);
                        // UPDATE POP UP WITH DISTANCE 
                        taxis.bindPopup(`<p><span>Taxi is ${distanceUnit} away</span></p>`);
                        // DELAY SET VIEW DUE TO CRASH WITH POP UP ANIMATION
                        setTimeout(() => {
                            // SET VIEW TO SELECTED TAXI LOCATION
                            mymap.setView([(lat - 0.0015), lon], 17);
                        }, 10);
                    }

                    function taxiStands() {
                        $.ajax({
                                type: "GET",
                                //file name or URL here
                                url: "https://api.npoint.io/30aca85ba025db496d2d",
                                dataType: "json"
                            })
                            .done(function (json) {
                                console.log("Taxi Stands Successfully Loaded");
                                // STORE TAXI STAND GEOJSON INTO VARIABLE
                                var taxiStands = json;
                                console.log(taxiStands);

                                // TAXI CIRCLE MARKER
                                var taxiStandMarker = {
                                    color: 'lime',
                                    fillColor: 'green',
                                    weight: 6,
                                    fillOpacity: 0.5,
                                    radius: 20
                                };
                                // LEAFLET GEOJSON TO DISPLAY TAXI STANDS ON MAP
                                taxiStandCircles = L.geoJSON(taxiStands, {
                                    pointToLayer: function (feature, latlng) {
                                        return L.circleMarker(latlng, taxiStandMarker);
                                    }
                                }).addTo(mymap).on("click", taxiStandClick);

                                // UPDATE POP UP WITH DISTANCE 
                                taxiStandCircles.bindPopup(`<p><span>Taxi is ${distanceUnit} away</span></p>`);
                            })
                            .fail(function () {
                                console.log("Taxi Stands loading error");
                            });
                    }

                    var taxiStandCircles;
                    // CLICK ON TAXI STAND TO REDIRECT TO GOOGLE MAPS FOR DIRECTIONS TO TAXI
                    function taxiStandClick(e) {
                        coord = e.latlng;
                        var lat = coord.lat;
                        var lon = coord.lng;
                        // SHOW INFOCARD AFTER CLICKING ON TAXI
                        $(".infoCard").addClass("infoCardUP");
                        // UPDATE gMAPS iFRAME WITH SELECTED TAXI STAND COORDINATES
                        $("#eMap").attr("src", `https://maps.google.com/maps?q=` + lat + `,` + lon + `&z=15&output=embed`);
                        // CONVERT USER LOCATION AND TAXI LOCATION TO LEAFLET LATLNG
                        var userLatLon = L.latLng(userLat, userLon);
                        var latlon = L.latLng(lat, lon);
                        // LEAFLET GEOMETRY PLUGIN TO FIND DISTANCE BETWEEN USER AND SELECTED TAXI
                        distance = L.GeometryUtil.distance(mymap, userLatLon, latlon);
                        distanceUnit = L.GeometryUtil.readableDistance(distance, "metric");
                        console.log(distanceUnit);
                        // UPDATE POP UP WITH DISTANCE 
                        taxiStandCircles.bindPopup(`<p><span>Taxi stand is ${distanceUnit} away</span></p>`);
                        // DELAY SET VIEW DUE TO CRASH WITH POP UP ANIMATION
                        setTimeout(() => {
                            // SET VIEW TO SELECTED TAXI LOCATION
                            mymap.setView([(lat - 0.0015), lon], 17);
                        }, 10);
                    }
                    // CALL TAXI STANDS FUNCTION
                    taxiStands();
                    //REDIRECT USER TO GMAPS FOR DIRECTIONS
                    $(".redirect").click(function () {
                        // SET REDIRECT COORDINATES 
                        var circleCoords = coord;
                        var circleLat = circleCoords.lat;
                        var circleLon = circleCoords.lng;
                        console.log(circleCoords.lat, circleCoords.lng);
                        // GET USER LOCATION
                        navigator.geolocation.getCurrentPosition(redirect);
                        // REDIRECT USER WITH RELATION TO THEIR CURRENT COORDINATES
                        function redirect(position) {
                            // STORE USER LOCATION INTO VARIABLE
                            var userLat = position.coords.latitude;
                            var userLon = position.coords.longitude;
                            // REDIRECT USER TO GOOGLE MAPS
                            var win = window.open(`https://www.google.com.sg/maps/dir//${circleLat},${circleLon}/@${userLat},${userLon},18z`, '_blank');
                            if (win) {
                                //Browser has allowed it to be opened
                                win.focus();
                            } else {
                                //Browser has blocked it
                                alert("Please Allow Popups");
                            }
                        }
                    });
                })
                .fail(function () {
                    console.log("loading error");
                });
        }
    }




}); //END OF DOCUMENT READY FUNCTION