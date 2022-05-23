String.prototype.urlFriendly = function() {
    return this.replace(/ /g, '+');
}

API = {
   key:  "96cdff24a8e6dfb506d1fa7fb29b16e5",
   base: "https://api.themoviedb.org/3",
   trailer: {
       base: "https://www.youtube.com/embed/"
   },
   get: {
       current: "/movie/now_playing",
       search: "/search/movie",
       config: "/configuration",
       movie: "/movie/",
    //    genres: "/genre/movie/list"
   },
   pref: {
       query: "&query=",
       lang: "&language=",
       page: "&page=",
       key: "?api_key=",
       adult: "&include_adult=",
       region: "&region=",
       year: "&year=",
       py_year: "&primary_release_year=",
   },
   config: undefined,
//    genres_lookup: undefined
}
API.key_str = function() { return this.pref.key + this.key }
API.query_str = function(q) { return this.pref.query + q.urlFriendly(); }

language = "en-US"
visible_movies = undefined
end_movie_page = 0
page_mode = "current"
last_fetch_size = undefined

// Add a string method to replace spaces with +




async function search_movies(args) {
    lang = args.lang ? args.lang : language
    
    url = API.base + API.get.search + API.key_str()
    url += API.pref.lang + lang + API.query_str(args.q) + API.pref.page + args.page

    if (args.adult) {url += API.pref.adult + true}
    if (args.region) {url += API.pref.region + args.region}
    if (args.year) {url += API.pref.year + args.year}
    if (args.py_year) {url += API.pref.py_year + args.py_year}
    return do_query(url)
}

async function get_current_movies(page, lang=language, region=undefined ) {
    url = API.base + API.get.current + API.key_str()
    url += API.pref.lang + lang + API.pref.page + page

    if (region) {url += API.pref.region + region}
    return do_query(url)
}

async function get_movie_details(id, lang=language){
    if (!id) { throw "Cannot fetch movie details without an id."}
    url = API.base + API.get.movie + id + API.key_str()
    url += API.pref.lang + lang + `&append_to_response=${false}`
    return do_query(url)
}

async function get_videos(id, lang=language){
    if (!id) { throw "Cannot fetch movie details without an id."}
    url = API.base + API.get.movie + id + `/videos` + API.key_str()
    url += API.pref.lang + lang
    let vids = await do_query(url)
    if (!vids) { return undefined }
    vids = vids.results.reduce((l, r) => {
        const vid_name = r.name.toLowerCase();
        if (l) {return l;}
        else if ("official trailer" === r.name.toLowerCase()) {
            return r;
        }
    } )
    return vids ? API.trailer.base + vids.key : undefined
}

async function get_config() {
    url = API.base + API.get.config + API.pref.key + API.key
    return await fetch(url)
        .then(response => response.json())
        .then(data => API.config = data)
}
// async function get_genres(lang=language) {
//     url = API.base + API.get.genres + API.pref.key + API.key + API.pref.lang + lang;

//     function build_lookup() {
//         let lookup = {}
//         API.genres_lookup.genres.forEach(g => {
//             lookup[g.id] = g.name;
//         })
//         API.genres_lookup = lookup
//     }

//     return await fetch(url)
//     .then(response => response.json())
//     .then(data => API.genres_lookup = data)
//     .then(() => build_lookup())

// }

API.image_url = (path, type="poster") => {
    let fallback = "data:image/png;base64,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"
    if (type === "backdrop") { fallback = "https://betravingknows.com/wp-content/uploads/2017/06/video-movie-placeholder-image-grey.png"; }
    if (!path) { return fallback;}
    default_poster_idx = type === "poster" ? 4 : 3
    let poster_sizes = type === "poster" ? API.config.images.poster_sizes : API.config.images.backdrop_sizes
    p_idx = poster_sizes.len < default_poster_idx + 1 ? -1 : default_poster_idx
    url = API.config.images.secure_base_url + poster_sizes.at(p_idx) + path
    return url
}

function do_search() {
    q = document.getElementById("search-input").value
    if (!q) {return false;}
    page_mode = "search"
    document.querySelector("header > h2").innerHTML = "Search Results"
    
    clear_visible_movies()
    append_search_result_page(q).then((movies) => {
        rendpend_movies(movies);
    })
    return false
}

async function do_query(url) {
    return fetch(url)
        .then(response => response.json())
}

function render_load_button() {
    id = "load-more-movies-btn"
    html = `<button type="submit" id="${id}">Load More Results</button>`
    html += `<img id="attribution" src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_long_1-8ba2ac31f354005783fab473602c34c3f4fd207150182061e425d366e4f34596.svg"></img>`
    html = `<div id="footer-col">${html}</div>`
    document.querySelector("footer").innerHTML = html
    document.querySelector(`#${id}`).addEventListener("click", () => {
        if (page_mode == "search") {
            if (last_fetch_size == 20) {
                append_search_result_page(document.getElementById("search-input").value).then(rendpend_movies)
            }
        } else {
            append_movie_page().then(rendpend_movies)
        }
        
    })
}



async function fetch_page_of_movies(page) {
    if (!API.config) { throw "API configuration must be fetched before loading movies."}
    movies = await get_current_movies(page = page).then(rsp => rsp.results);
    return movies.map(({id, title, poster_path, vote_average}) => ({id, title, poster_path, vote_average}))
}

async function fetch_page_of_search_results(page, q) {
    if (!API.config) { throw "API configuration must be fetched before loading movies."}
    movies = await search_movies({q:q, page:page}).then(rsp => rsp.results);
    return movies.map(({id, title, poster_path, vote_average}) => ({id, title, poster_path, vote_average}))
}

async function append_search_result_page(q) {
    end_movie_page += 1
    new_movies = await fetch_page_of_search_results(end_movie_page, q);
    visible_movies = [...visible_movies, ...new_movies]
    last_fetch_size = new_movies.length
    return new_movies
}

async function append_movie_page() {
    end_movie_page += 1
    new_movies = await fetch_page_of_movies(end_movie_page);
    visible_movies = [...visible_movies, ...new_movies]
    last_fetch_size = new_movies.length
    return new_movies
}

async function reset_movies() {
    clear_visible_movies()
    await append_movie_page()
    return visible_movies
}
function clear_visible_movies() {
    end_movie_page = 0
    visible_movies = []
    document.getElementById("movies-grid").innerHTML = "";
}

star_code = "&#11088"
function movie_preview_html(movie) {
    
    rating = `<span class="movie-votes">${star_code} ${movie.vote_average}</span>`
    id = `movie-${movie.id}`
    poster = `<img class="movie-poster" src="${API.image_url(movie.poster_path)}" alt="Movie Poster: ${movie.title}">`
    html = `<div class= "movie-card" id="${id}">
    ${poster}
    ${rating}
    <h4 class="movie-title">${movie.title}</h4>        
    </div>`
    return html
}

function genres_str(genre_ids) {
    let str = "";
    genre_ids.forEach((id, ix) => {
        str += ix > 0 ? ", ": "";
        const gen = id.name;
        str += gen.at(0).toUpperCase() + gen.slice(1);
    })
    return str;
}

async function render_movie_details(id, modal_canvas) {
    let movie = await get_movie_details(id);
    trailer_url = await get_videos(id);
    trailer = ""
    if (trailer_url) {
        trailer = `<iframe class="backdrop" src="${trailer_url}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
    }
    backdrop = `<img class="backdrop" src="${API.image_url(movie.backdrop_path, "backdrop")}" alt="Movie Backdrop: ${movie.title}">`
    title = `<h3>${movie.title}</h3>`;
    subtitle = `<h5>${movie.runtime} min | ${movie.release_date} | ${movie.release_date} | ${genres_str(movie.genres)} | ${star_code} ${movie.vote_average}</h5>`
    description = `<p>${movie.overview}</p>`
    modal_canvas.innerHTML = backdrop + title + subtitle + description +trailer
}

function open_movie(id) {
    modal = document.querySelector(".modal");
    render_movie_details(id, modal.querySelector("#movie-detail"));

    modal.classList.remove("closed");
    modal.classList.add("open");
    
}
function close_movie() {
    document.querySelector("#movie-detail").innerHTML = ''
    modal.classList.remove("open");
    modal.classList.add("closed");
} 

function rendpend_movies(movies) {
    movies.forEach(e => {
        document.querySelector("main > .flex-row").innerHTML += movie_preview_html(e);
        // document.querySelector(`.flex-row > #movie-${e.id} > img`).addEventListener("click", doit)
    });
    visible_movies.forEach(m => {
        element = document.getElementById(`movie-${m.id}`);
        element.addEventListener("click", () => open_movie(m.id))
    })

}

function add_event_listeners() {
    modal_close = document.querySelector("#modal-close-btn")
    shade = document.querySelector(".shade")
    modal_close.addEventListener("click", close_movie)
    shade.addEventListener("click", close_movie)

    back = document.getElementById("close-search-btn")
    back.addEventListener("click", () => {
        page_mode = "current"
        document.querySelector("header > h2").innerHTML = "Current Movies";
        document.getElementById("search-input").value = "";
        reset_movies().then((movies) => rendpend_movies(movies))
    })
}

window.onload = () => {
    get_config()
    // .then(() => get_genres())
    .then(() => add_event_listeners())
    .then(() => reset_movies())
    .then((movies) => rendpend_movies(movies))
    .then(() => render_load_button())
    
}