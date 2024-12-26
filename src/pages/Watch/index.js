import clsx from "clsx"
import { useParams } from "react-router-dom"
import { useEffect, useRef, useState } from "react"
import styles from "./Watch.module.scss"
import Comment from "../../components/Layout/components/Comments"
import storage from "../../util"
import useFetch from "../../Hooks/useFetch"
import MovieSuggestions from "../../components/Layout/components/MovieSuggestions"
import { showErrorMessage, showInfoMessage, showSuccessMessage } from "../../components/Layout/components/toastMessage"

function Watch() {
    const params = useParams()
    const movieRef = useRef()
    const [data] = useFetch(`https://phimapi.com/phim/${params.slug}`)
    const [movie, setMovie] = useState([])
    const [slug, setSlug] = useState('')
    const [movieName, setMovieName] = useState('')
    const [episode, setEpisode] = useState(1)
    const [linkEmbed, setLinkEmbed] = useState('')

    useEffect(() => {
        showInfoMessage('Chúc bạn xem phim vui vẻ ^_^')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    useEffect(() => {
        if (data?.episodes[0].server_data.length === 0) {
            showErrorMessage('Đã xảy ra sự cố khi tải phim!')
            return
        }
        setMovie(data?.episodes[0]?.server_data || [])
        setSlug(data?.movie?.slug || '')
        data && setMovieName(
            `${data?.movie?.name} - ${data?.episodes[0]?.server_data[0]?.name}` || '')
        handleRecenltyViewed(data)
        handleSetEpisode(data)
    }, [data])

    useEffect(() => {
        document.title = `Bạn đang xem: ${movieName}`
    }, [movieName])

    const handleSetEpisode = (data) => {
        const currentMovie = storage.get('save-watched-episodes', [])
        const movieExist = currentMovie.find(
            movie => movie?.link_embed ===
                data?.episodes[0]?.server_data[movie.episode - 1]?.link_embed)
        if (movieExist) {
            setEpisode(movieExist.episode)
            setLinkEmbed(movieExist.link_embed)
            showInfoMessage(`Lúc trước bạn đang xem tập ${movieExist.episode}`)
            return
        }
        setEpisode(1)
        setLinkEmbed(data?.episodes[0]?.server_data[0]?.link_embed)
    }

    const handleRecenltyViewed = (data) => {
        const recenltyViewed = storage.get('recentlty-viewed', [])
        const isExist = recenltyViewed.some(
            movie => movie?.movie?.slug === data?.movie?.slug)
        if (!isExist && data !== null) {
            storage.set('recentlty-viewed', [...recenltyViewed, data])
        }
    }

    const hanleChangeEpisode = (link_embed, index, slug) => {
        const value = {
            link_embed,
            episode: index,
            slug
        }
        setMovieName(
            `${data?.movie?.name} - ${data?.episodes[0]?.server_data[index - 1]?.name}`)
        setEpisode(index)
        setLinkEmbed(link_embed)
        const currentMovieStorage = storage.get('save-watched-episodes', [])
        const indexMovie = currentMovieStorage.findIndex(
            movie => movie.slug === slug
        )
        if (indexMovie !== -1) {
            currentMovieStorage[indexMovie].episode = index
            currentMovieStorage[indexMovie].link_embed = link_embed
            storage.set('save-watched-episodes', currentMovieStorage)
            return
        }
        storage.set('save-watched-episodes', [...currentMovieStorage, value])
    }

    const handleCopyLinkM3u8 = () => {
        navigator.clipboard.writeText(linkEmbed) // trả về promise
            .then(() => {
                showSuccessMessage('Đã copy thành công!')
            })
            .catch(err => {
                console.error('Failed to copy: ', err)
            })
    }

    return (
        <div className={styles.watch}>
            <h4 className={styles.watch__title}>{movieName}</h4>
            <div className={styles.watch__iframe}>
                <iframe
                    src={linkEmbed}
                    frameBorder="0"
                    className="video"
                    allow="fullscreen">
                </iframe>
            </div>
            <div className={styles.watch__episodes}>
                {movie &&
                    <h4 className={styles.watch__title}>
                        <i className="fa-solid fa-grip"></i>
                        Danh sách tập phim ( {data?.movie?.lang} )
                    </h4>
                }
                <ul>
                    {movie.map((movie, index) => (
                        <li
                            ref={movieRef}
                            className={clsx({
                                [styles.active]: ++index === episode
                            })}
                            key={index}
                            onClick={() =>
                                hanleChangeEpisode(movie.link_embed, index, slug)}
                        >
                            {movie.name}
                        </li>
                    ))}
                </ul>
            </div>
            <div className={(styles.watch__copy_box)}>
                <h4 className={styles.watch__title}>
                    <i className="fa-solid fa-link"></i>
                    Link m3u8
                </h4>
                <div className={styles.watch__copy_area}>
                    <button
                        onClick={handleCopyLinkM3u8}
                        className={clsx('btn', 'btn--primary')}>Copy</button>
                    <p>{linkEmbed}</p>
                </div>
            </div>
            {slug && <Comment slug={slug} />}

            {data && <MovieSuggestions data={data} />}
        </div>
    )
}

export default Watch