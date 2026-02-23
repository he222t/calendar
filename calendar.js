let currentDate = new Date();
let holidays = [];

document.addEventListener('DOMContentLoaded', function() {
    const settings = loadSettings();
    currentDate = new Date();
    holidays = getPublicHolidays(currentDate.getFullYear());
    
    renderCalendar();
    
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        holidays = getPublicHolidays(currentDate.getFullYear());
        renderCalendar();
    });
    
    document.getElementById('nextMonth').addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        holidays = getPublicHolidays(currentDate.getFullYear());
        renderCalendar();
    });
    
    const modal = document.getElementById('eventModal');
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

function renderCalendar() {
    const settings = loadSettings();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonthYear').textContent = 
        `${monthNames[month]} ${year}`;
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let startDay = firstDay.getDay();
    if (settings.weekStartMonday) {
        startDay = (startDay === 0) ? 6 : startDay - 1;
    }
    
    const prevMonth = new Date(year, month, 0);
    const daysInPrevMonth = prevMonth.getDate();
    
    const calendarDays = document.getElementById('calendarDays');
    calendarDays.innerHTML = '';
    
    for (let i = startDay - 1; i >= 0; i--) {
        const day = daysInPrevMonth - i;
        const date = new Date(year, month - 1, day);
        const dayElement = createDayElement(date, true);
        calendarDays.appendChild(dayElement);
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const isToday = date.toDateString() === today.toDateString();
        const dayElement = createDayElement(date, false, isToday);
        calendarDays.appendChild(dayElement);
    }
    
    const totalCells = calendarDays.children.length;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
        const date = new Date(year, month + 1, day);
        const dayElement = createDayElement(date, true);
        calendarDays.appendChild(dayElement);
    }
}

function createDayElement(date, isOtherMonth, isToday = false) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    
    if (isOtherMonth) {
        dayDiv.classList.add('other-month');
    }
    
    if (isToday) {
        dayDiv.classList.add('today');
    }
    
    const dateStr = formatDate(date);
    const isHoliday = holidays.some(h => h.date === dateStr);
    if (isHoliday && !isOtherMonth) {
        dayDiv.classList.add('holiday');
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = date.getDate();
    dayDiv.appendChild(dayNumber);
    
    const events = getEventsForDate(date);
    if (events.length > 0 && !isOtherMonth) {
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        events.slice(0, 3).forEach(event => {
            const dot = document.createElement('div');
            dot.className = `event-dot ${event.type}`;
            eventsContainer.appendChild(dot);
        });
        if (events.length > 3) {
            const more = document.createElement('div');
            more.className = 'event-dot';
            more.style.opacity = '0.5';
            eventsContainer.appendChild(more);
        }
        dayDiv.appendChild(eventsContainer);
    }
    
    dayDiv.addEventListener('click', () => {
        if (!isOtherMonth) {
            showDayEvents(date, events);
        }
    });
    
    return dayDiv;
}

function showDayEvents(date, events) {
    const modal = document.getElementById('eventModal');
    const modalDate = document.getElementById('modalDate');
    const modalEvents = document.getElementById('modalEvents');
    
    const dateStr = formatDate(date);
    const dateObj = new Date(dateStr);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    modalDate.textContent = dateObj.toLocaleDateString('en-US', options);
    
    modalEvents.innerHTML = '';
    
    if (events.length === 0) {
        modalEvents.innerHTML = '<p>No events scheduled for this day.</p>';
    } else {
        events.forEach(event => {
            const eventDiv = document.createElement('div');
            eventDiv.className = `event-item ${event.type}`;
            eventDiv.style.marginBottom = '1rem';
            eventDiv.style.padding = '1rem';
            eventDiv.style.borderRadius = '5px';
            eventDiv.style.background = 'var(--hover-color)';
            
            let html = `<h4>${event.title}</h4>`;
            if (event.time) {
                html += `<p><strong>Time:</strong> ${event.time}</p>`;
            }
            if (event.type) {
                html += `<p><strong>Type:</strong> ${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</p>`;
            }
            if (event.location) {
                html += `<p><strong>Location:</strong> ${event.location}</p>`;
            }
            if (event.description) {
                html += `<p>${event.description}</p>`;
            }
            
            eventDiv.innerHTML = html;
            modalEvents.appendChild(eventDiv);
        });
    }
    
    const holiday = holidays.find(h => h.date === dateStr);
    if (holiday) {
        const holidayDiv = document.createElement('div');
        holidayDiv.style.padding = '1rem';
        holidayDiv.style.background = 'var(--accent-color)';
        holidayDiv.style.color = 'white';
        holidayDiv.style.borderRadius = '5px';
        holidayDiv.style.marginTop = '1rem';
        holidayDiv.innerHTML = `<strong>Public Holiday:</strong> ${holiday.name}`;
        modalEvents.appendChild(holidayDiv);
    }
    
    modal.style.display = 'block';
}

