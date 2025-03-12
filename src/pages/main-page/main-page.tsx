import React, { useEffect, useRef, useState } from 'react';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { dates } from '../../const/dates';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './main-page.scss';
import gsap from "gsap";

function MainPage() {
  // Константы и состояния
  const numberOfEvents = dates.length;
  const angleBetweenDots = 360 / numberOfEvents;
  const defaultTimeOfRotation = 300;

  // Рефы для DOM-элементов
  const sliderRef = useRef<HTMLDivElement>(null);
  const mainCircleRef = useRef<HTMLDivElement>(null);
  const startDateRef = useRef<HTMLDivElement>(null);
  const endDateRef = useRef<HTMLDivElement>(null);

  // Состояния
  const [angle, setAngle] = useState<number>(angleBetweenDots);
  const [currentEvent, setCurrentEvent] = useState<number>(0);
  const [timeOfRotation, setTimeOfRotation] = useState<number>(defaultTimeOfRotation);
  const [startDate, setStartDate] = useState<number>(Number(dates[0].events[0].date));
  const [endDate, setEndDate] = useState<number>(Number(dates[0].events[dates.length - 1].date));

  // Эффект для показа слайдера с задержкой
  useEffect(() => {
    const timer = setTimeout(() => {
      sliderRef.current?.classList.add("slider__activ"); // Добавляем класс для показа слайдера
      clearTimeout(timer); // Очищаем таймер
    }, 300);
  }, [currentEvent]); // Зависимость от текущего события

  // Функция для форматирования текущего и общего количества событий
  function getTotal(length: number, index: number): string {
    return `${String(index + 1).padStart(2,'0')}/${String(length).padStart(2,'0')}`;
  }

  // Функция для скрытия слайдера перед обновлением состояния
  function fadeIt(fn: Function): void {
    sliderRef.current?.classList.remove("slider__activ"); // Убираем класс для скрытия слайдера
    const timer = setTimeout(() => {
      fn(); // Выполняем переданную функцию
      clearTimeout(timer); // Очищаем таймер
    }, 300);
  }

  // Функции для навигации
  function loadPrev(): void {
    loadThis(currentEvent - 1); // Переход к предыдущему событию
  }

  function loadNext(): void {
    loadThis(currentEvent + 1); // Переход к следующему событию
  }

  // Анимация изменения диапазона дат
  function animateDatesRange(index: number): void {
    const newStartDate = Number(dates[index].events[0].date); // Новая начальная дата
    const startRange = newStartDate - startDate; // Разница между старой и новой начальной датой
    const newEndDate = Number(dates[index].events[dates.length - 1].date); // Новая конечная дата
    const endRange = newEndDate - endDate; // Разница между старой и новой конечной датой
    const animationTime = (timeOfRotation + 300) / 1000; // Время анимации

    // Анимация начальной даты
    gsap.to(startDateRef.current, {
      duration: animationTime,
      textContent: `+=${startRange}`,
      roundProps: "textContent", 
      ease: "none",
      onUpdate: () => setStartDate(newStartDate) // Обновление состояния
    });

    // Анимация конечной даты
    gsap.to(endDateRef.current, {
      duration: animationTime,
      textContent: `+=${endRange}`,
      roundProps: "textContent",
      ease: "none",
      onUpdate: () => setEndDate(newEndDate) // Обновление состояния
    });
  }

  // Основная функция для загрузки события
  function loadThis(index: number): void {
    animateDatesRange(index); // Анимация дат

    // Активация текущей точки на круге
    mainCircleRef.current?.children[index].classList.add("spinner__shoulder_active");

    // Расчет угла поворота
    const angleOfRotation = angleBetweenDots - index * angleBetweenDots;
    setTimeOfRotation(Math.abs(currentEvent - index) * defaultTimeOfRotation); // Установка времени вращения

    // Установка нового угла с задержкой
    const timer = setTimeout(() => {
      setAngle(angleOfRotation);
      clearTimeout(timer);
    }, 300);

    // Скрытие слайдера и обновление текущего события
    fadeIt(() => setCurrentEvent(index));
  }

  // Рендер компонента
  return (
    <main className='main'> 
      <section className='historic-dates'>
        <h1 className='historic-dates__heading'>Исторические даты</h1>
        {/* Диапазон дат */}
        <div className="historic-dates__range range">
          <p className='range_start' ref={startDateRef}>{startDate}</p>
          <p className='range_end' ref={endDateRef}>{endDate}</p>
        </div>
        {/* Круг с событиями */}
        <div className="historic-dates__spinner spinner">
          <div ref={mainCircleRef} className='spinner__main-circle' 
               style={{ 
                "--count": numberOfEvents, 
                "--angle": angle + "deg", 
                "--time": timeOfRotation + "ms",
                "--delay": timeOfRotation + 300 + "ms",
                } as React.CSSProperties}>
            {
              dates.map((item, index) => {
                const { title } = item;
                const idx = index + 1;
                return (
                  <div key={index} className={"spinner__shoulder " + (currentEvent === index ? 'spinner__shoulder_active' : '')} 
                       style={{ "--i": idx } as React.CSSProperties}
                       onClick={() => loadThis(index)}>
                    <div className='spinner__circle-area'>
                      <p className='spinner__circle'>{idx}
                        <span className='spinner__title'>{title}</span>
                      </p>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
        {/* Навигация */}
        <div className="historic-dates__navigation navigation">
          <p className='navigation__total'>{getTotal(numberOfEvents, currentEvent)}</p>
          <div className='navigation__buttons control-buttons'>
            <button 
              className='control-buttons__default control-buttons__prev'
              onClick={loadPrev}
              disabled={currentEvent === 0 ? true : false}>
            </button>
            <button
              className='control-buttons__default control-buttons__next'
              onClick={loadNext}
              disabled={currentEvent === numberOfEvents - 1 ? true : false}>
            </button>
          </div>
        </div>
        {/* Слайдер */}
        <div ref={sliderRef} className="historic-dates__slider slider">
          <p className='slider__mobile-title'>{dates[currentEvent].title}</p>
          <button className='slider__btn slider__btn_prev'></button>
          <Swiper
            modules={[Navigation]}
            spaceBetween={80}
            slidesPerView={3}
            slidesPerGroup={1}
            breakpoints={{
              320: { slidesPerView: 1.5, spaceBetween: 25 },
              769: { slidesPerView: 3, spaceBetween: 80 },
              1025: { slidesPerView: 3, spaceBetween: 80 }
            }}
            navigation={{
              prevEl: '.slider__btn_prev',
              nextEl: '.slider__btn_next',
            }}
            pagination={{ clickable: true }}
            scrollbar={{ draggable: true }}>
            {
              dates[currentEvent].events.map((item, index) => {
                const { date, description } = item;
                return (
                  <SwiperSlide key={index} className='slider__slide'>
                    <p className='slider__year'>{date}</p>
                    <p className='slider__description'>{description}</p>
                  </SwiperSlide>
                );
              })
            }
          </Swiper>
          <button className='slider__btn slider__btn_next'></button>  
        </div>
        {/* Кнопки управления событиями */}
        <div className='events__control-buttons'>
          {
            dates.map((item, index) => {
              return <button 
                className={"events__button " + (currentEvent === index ? 'events__button_active' : '')}
                key={index}
                onClick={() => loadThis(index)}>
              </button>
            })
          }
        </div>
      </section>
    </main>
  );
}

export default MainPage;