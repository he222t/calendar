document.addEventListener('DOMContentLoaded', function () {
    const settings = loadSettings();

    if (settings.primaryColor) {
        document.getElementById('primaryColor').value = settings.primaryColor;
    }
    if (settings.secondaryColor) {
        document.getElementById('secondaryColor').value = settings.secondaryColor;
    }
    if (settings.accentColor) {
        document.getElementById('accentColor').value = settings.accentColor;
    }
    if (settings.backgroundColor) {
        document.getElementById('backgroundColor').value = settings.backgroundColor;
    }
    if (settings.textColor) {
        document.getElementById('textColor').value = settings.textColor;
    }
    if (settings.fontFamily) {
        document.getElementById('fontFamily').value = settings.fontFamily;
    }
    if (settings.fontSize) {
        const fontSizeNum = parseInt(settings.fontSize);
        document.getElementById('fontSize').value = fontSizeNum;
        document.getElementById('fontSizeValue').textContent = `${fontSizeNum}px`;
    }
    if (settings.showWeekends !== undefined) {
        document.getElementById('showWeekends').checked = settings.showWeekends;
    }
    if (settings.showHolidays !== undefined) {
        document.getElementById('showHolidays').checked = settings.showHolidays;
    }
    if (settings.weekStartMonday !== undefined) {
        document.getElementById('weekStartMonday').checked = settings.weekStartMonday;
    }

    if (settings.palette) {
        const paletteOption = document.querySelector(`[data-palette="${settings.palette}"]`);
        if (paletteOption) {
            paletteOption.classList.add('selected');
        }
    }

    document.querySelectorAll('.palette-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.palette-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            applyPalette(option.dataset.palette);
        });
    });

    ['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor', 'textColor'].forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
            applyColorChange(id, e.target.value);
        });
    });

    document.getElementById('fontFamily').addEventListener('change', (e) => {
        applyFontFamily(e.target.value);
    });

    const fontSizeSlider = document.getElementById('fontSize');
    fontSizeSlider.addEventListener('input', (e) => {
        const size = e.target.value;
        document.getElementById('fontSizeValue').textContent = `${size}px`;
        applyFontSize(`${size}px`);
    });

    document.getElementById('saveSettings').addEventListener('click', () => {
        saveCurrentSettings();
        showMessage('Settings saved successfully!', 'success');
    });

    document.getElementById('resetSettings').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            const defaultSettings = getDefaultSettings();
            saveSettings(defaultSettings);
            location.reload();
        }
    });
});

function applyPalette(paletteName) {
    const palettes = {
        default: {
            primaryColor: '#4a90e2',
            secondaryColor: '#7b68ee',
            accentColor: '#50c878',
            backgroundColor: '#ffffff',
            textColor: '#333333'
        },
        dark: {
            primaryColor: '#2c3e50',
            secondaryColor: '#34495e',
            accentColor: '#7f8c8d',
            backgroundColor: '#1a1a1a',
            textColor: '#ffffff'
        },
        warm: {
            primaryColor: '#e74c3c',
            secondaryColor: '#f39c12',
            accentColor: '#e67e22',
            backgroundColor: '#fff5f0',
            textColor: '#2c2c2c'
        },
        cool: {
            primaryColor: '#3498db',
            secondaryColor: '#1abc9c',
            accentColor: '#9b59b6',
            backgroundColor: '#f0f8ff',
            textColor: '#2c3e50'
        },
        pastel: {
            primaryColor: '#ffb3ba',
            secondaryColor: '#bae1ff',
            accentColor: '#baffc9',
            backgroundColor: '#fffef7',
            textColor: '#4a4a4a'
        }
    };

    const palette = palettes[paletteName];
    if (palette) {
        document.getElementById('primaryColor').value = palette.primaryColor;
        document.getElementById('secondaryColor').value = palette.secondaryColor;
        document.getElementById('accentColor').value = palette.accentColor;
        document.getElementById('backgroundColor').value = palette.backgroundColor;
        document.getElementById('textColor').value = palette.textColor;

        applyColorChange('primaryColor', palette.primaryColor);
        applyColorChange('secondaryColor', palette.secondaryColor);
        applyColorChange('accentColor', palette.accentColor);
        applyColorChange('backgroundColor', palette.backgroundColor);
        applyColorChange('textColor', palette.textColor);
    }
}

function applyColorChange(colorId, value) {
    const root = document.documentElement;
    const cssVarMap = {
        'primaryColor': '--primary-color',
        'secondaryColor': '--secondary-color',
        'accentColor': '--accent-color',
        'backgroundColor': '--bg-color',
        'textColor': '--text-color'
    };

    const cssVar = cssVarMap[colorId];
    if (cssVar) {
        root.style.setProperty(cssVar, value);
        if (colorId === 'backgroundColor') {
            document.body.style.backgroundColor = value;
        }
        if (colorId === 'textColor') {
            document.body.style.color = value;
        }
    }
}

function applyFontFamily(fontFamily) {
    document.body.style.fontFamily = fontFamily;
    const root = document.documentElement;
    root.style.setProperty('--font-family', fontFamily);
}

function applyFontSize(fontSize) {
    document.body.style.fontSize = fontSize;
    const root = document.documentElement;
    root.style.setProperty('--font-size', fontSize);
}

function saveCurrentSettings() {
    const settings = {
        primaryColor: document.getElementById('primaryColor').value,
        secondaryColor: document.getElementById('secondaryColor').value,
        accentColor: document.getElementById('accentColor').value,
        backgroundColor: document.getElementById('backgroundColor').value,
        textColor: document.getElementById('textColor').value,
        fontFamily: document.getElementById('fontFamily').value,
        fontSize: document.getElementById('fontSize').value + 'px',
        palette: document.querySelector('.palette-option.selected')?.dataset.palette || 'default',
        showWeekends: document.getElementById('showWeekends').checked,
        showHolidays: document.getElementById('showHolidays').checked,
        weekStartMonday: document.getElementById('weekStartMonday').checked
    };

    saveSettings(settings);
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `status-message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.zIndex = '10000';
    messageDiv.style.padding = '1rem 2rem';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

