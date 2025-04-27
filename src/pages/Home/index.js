import Movies from '../../components/Layout/components/Movies'
import Slides from '../../components/Layout/components/Slides'

function Home() {
   

    return (
        <>
            <Slides api='https://phimapi.com/danh-sach/phim-moi-cap-nhat?page=1' />
            <Movies api="https://phimapi.com/v1/api/danh-sach/phim-le?page=1&limit=18" />
            <Movies api="https://phimapi.com/v1/api/danh-sach/phim-bo?page=1&limit=18" />
            <Movies api="https://phimapi.com/v1/api/danh-sach/hoat-hinh?page=1&limit=18" />
            <Movies api="https://phimapi.com/v1/api/danh-sach/tv-shows?page=1&limit=18" />
        </>
    )
}

export default Home