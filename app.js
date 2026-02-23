document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
});

function saveSettings(settings) {
    localStorage.setItem('calendarSettings', JSON.stringify(settings));
    applySettings(settings);
}

function loadSettings() {
    const saved = localStorage.getItem('calendarSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        applySettings(settings);
        return settings;
    }
    return getDefaultSettings();
}

function getDefaultSettings() {
    return {
        primaryColor: '#4a90e2',
        secondaryColor: '#7b68ee',
        accentColor: '#50c878',
        backgroundColor: '#ffffff',
        textColor: '#333333',
        fontFamily: "'Inter', sans-serif",
        fontSize: '16px',
        palette: 'default',
        showWeekends: true,
        showHolidays: true,
        weekStartMonday: false
    };
}

function applySettings(settings) {
    const root = document.documentElement;
    
    if (settings.primaryColor) {
        root.style.setProperty('--primary-color', settings.primaryColor);
    }
    if (settings.secondaryColor) {
        root.style.setProperty('--secondary-color', settings.secondaryColor);
    }
    if (settings.accentColor) {
        root.style.setProperty('--accent-color', settings.accentColor);
    }
    if (settings.backgroundColor) {
        root.style.setProperty('--bg-color', settings.backgroundColor);
        document.body.style.backgroundColor = settings.backgroundColor;
    }
    if (settings.textColor) {
        root.style.setProperty('--text-color', settings.textColor);
    }
    if (settings.fontFamily) {
        root.style.setProperty('--font-family', settings.fontFamily);
        document.body.style.fontFamily = settings.fontFamily;
    }
    if (settings.fontSize) {
        root.style.setProperty('--font-size', settings.fontSize);
        document.body.style.fontSize = settings.fontSize;
    }
}

function saveEvents(events) {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
}

function loadEvents() {
    const saved = localStorage.getItem('calendarEvents');
    return saved ? JSON.parse(saved) : [];
}

function addEvent(event) {
    const events = loadEvents();
    event.id = Date.now().toString();
    events.push(event);
    saveEvents(events);
    return event;
}

function deleteEvent(eventId) {
    const events = loadEvents();
    const filtered = events.filter(e => e.id !== eventId);
    saveEvents(filtered);
    return filtered;
}

function getEventsForDate(date) {
    const events = loadEvents();
    const dateStr = formatDate(date);
    return events.filter(e => e.date === dateStr);
}

function formatDate(date) {
    if (date instanceof Date) {
        return date.toISOString().split('T')[0];
    }
    return date;
}

function getPublicHolidays(year) {
    const holidays = [];
    
    holidays.push({ date: `${year}-01-01`, name: "New Year's Day" });
    
    const mlkDay = getNthWeekday(year, 1, 1, 3);
    holidays.push({ date: mlkDay, name: "Martin Luther King Jr. Day" });
    
    const presidentsDay = getNthWeekday(year, 2, 1, 3);
    holidays.push({ date: presidentsDay, name: "Presidents' Day" });
    
    const memorialDay = getLastWeekday(year, 5, 1);
    holidays.push({ date: memorialDay, name: "Memorial Day" });
    
    holidays.push({ date: `${year}-07-04`, name: "Independence Day" });
    
    const laborDay = getNthWeekday(year, 9, 1, 1);
    holidays.push({ date: laborDay, name: "Labor Day" });
    
    const columbusDay = getNthWeekday(year, 10, 1, 2);
    holidays.push({ date: columbusDay, name: "Columbus Day" });
    
    holidays.push({ date: `${year}-11-11`, name: "Veterans Day" });
    
    const thanksgiving = getNthWeekday(year, 11, 4, 4);
    holidays.push({ date: thanksgiving, name: "Thanksgiving" });
    
    holidays.push({ date: `${year}-12-25`, name: "Christmas" });
    
    return holidays;
}

function getNthWeekday(year, month, weekday, n) {
    const firstDay = new Date(year, month - 1, 1);
    const firstWeekday = firstDay.getDay();
    const offset = (weekday - firstWeekday + 7) % 7;
    const date = 1 + offset + (n - 1) * 7;
    const result = new Date(year, month - 1, date);
    return formatDate(result);
}

function getLastWeekday(year, month, weekday) {
    const lastDay = new Date(year, month, 0);
    const lastWeekday = lastDay.getDay();
    const offset = (lastWeekday - weekday + 7) % 7;
    const date = lastDay.getDate() - offset;
    const result = new Date(year, month - 1, date);
    return formatDate(result);
}

