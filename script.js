API = {
   key: {
       value: "96cdff24a8e6dfb506d1fa7fb29b16e5",
       prefix: "?api_key="
   },
   base: "https://api.themoviedb.org/3",
   get: {
       current: "/movie/now_playing",
       search: "/search/movie",
       config: "/configuration",
   },
   config: undefined
}
language = "en-US"
visible_movies = undefined

async function search_url(args) {
    lang = args.lang ? args.lang : language
    q = args.q.replace(/ /g, '+');
    url = API.base + API.get.search + API.key.prefix + API.key.value 
    url += "&language=" + lang + "&query=" + q + "&page=" + args.page

    if (args.adult) {url += "&include_adult=" + true}
    if (args.region) {url += "&region=" + args.region}
    if (args.year) {url += "&year=" + args.year}
    if (args.prim_rel_yr) {url += "&primary_release_year=" + args.prim_rel_yr}

    // console.log(url);
    //document.querySelector("body").innerHTML += url
    return query(url)
}



async function query(url) {
    return fetch(url)
        .then(response => response.json())
}

async function get_config() {
    url = API.base + API.get.config + API.key.prefix + API.key.value
    return await fetch(url)
        .then(response => response.json())
        .then(data => API.config = data)
}

window.onload = () => {
    search_url({q:"King of Staten Island", page:1,})

    get_config()
    .then(() => console.log(API.config))
    .then(() => search_url({q:"King", page:1,}))
    .then(data => {
        console.log(data.results)
        visible_movies = data.results
        return visible_movies
    }).then(
        (movies) => {
            movies.forEach(element => {
                document.querySelector(".flex-container").innerHTML += `<div class="box"></div>`
            });
        }
    )
    
    // query("Jack+Reacher")
    // document.querySelector("body").innerHTML += "hi"
}