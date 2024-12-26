import { useEffect, useRef, useState } from "react"
import styles from "./Slides.module.scss"
import useFetch from "../../../../Hooks/useFetch"
import Slide from "../Slide"

function Slides({ api }) {
    const [index, setIndex] = useState(0)
    const slideInnerRef = useRef()
    const idInterval = useRef()
    const [data] = useFetch(api)
    const [slides, setSlides] = useState([])
    const isGrabbing = useRef(false)
    const startPos = useRef(null)
    const currentTranslate = useRef(0)

    useEffect(() => {
        setSlides(data?.items || [])
    }, [data])

    useEffect(() => {
        startAutoSlides()
    }, [index])

    useEffect(() => {
        slideInnerRef.current.style.transform =
            `translateX(-${index * slideInnerRef.current.clientWidth}px)`
    }, [index])

    const startAutoSlides = () => {
        clearInterval(idInterval.current)
        idInterval.current = setInterval(handleNext, 6000)
    }

    const stopAutoSlides = () => {
        clearInterval(idInterval.current)
    }

    const handlePrev = () => {
        setIndex(prevIndex =>
            (prevIndex === 0 ? slides.length - 1 : prevIndex - 1))
    }

    const handleNext = () => {
        setIndex(prevIndex =>
            (prevIndex === slides.length - 1 ? 0 : prevIndex + 1))
    }

    const getClientX = (event) => {
        return event.type.startsWith('touch') ?
            event.touches[0].clientX :
            event.clientX
    }

    const handleDragStart = (event) => {
        stopAutoSlides()
        if (event.type.startsWith('mouse')) {
            event.preventDefault()
        }
        const clientX = getClientX(event)
        startPos.current = clientX
        currentTranslate.current = 0
        isGrabbing.current = true
        slideInnerRef.current.style.transition = 'unset'
    }

    const handleDragMove = (event) => {
        if (isGrabbing.current) {
            const clientX = getClientX(event)
            currentTranslate.current = clientX - startPos.current
            slideInnerRef.current.style.transform =
                `translateX(${currentTranslate.current -
                (index * slideInnerRef.current.clientWidth)}px)`
        }
    }

    const handleDragEnd = () => {
        if (Math.abs(currentTranslate.current) > slideInnerRef.current.clientWidth / 3) {
            currentTranslate.current > 0 ? handlePrev() : handleNext()
        } else {
            slideInnerRef.current.style.transform =
            `translateX(-${index * slideInnerRef.current.clientWidth}px)`
        }
        isGrabbing.current = false
        startPos.current = null
        currentTranslate.current = 0
        slideInnerRef.current.style.transition = 'all .8s ease 0s'
        startAutoSlides()
    }

    return (
        <div className={styles.slides__container}>
            <button onClick={handlePrev} className='prev'>
                <i className="fa-solid fa-chevron-left"></i>
            </button>
            <div
                ref={slideInnerRef}
                className={styles.slides__inner}
                onMouseDown={handleDragStart}
                onMouseMove={handleDragMove}
                onMouseLeave={handleDragEnd}
                onMouseUp={handleDragEnd}
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
                style={{ cursor: isGrabbing.current ? 'grabbing' : 'grab' }}
            >
                {slides.map((slide, index) => (
                    <Slide key={index} data={slide} />
                ))}
            </div>
            <button onClick={handleNext} className='next'>
                <i className="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    )
}

export default Slides
